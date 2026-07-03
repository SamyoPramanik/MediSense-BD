"""MediSense BD — ML Inference Service (FastAPI)"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from datetime import datetime, timedelta
import random
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import outbreak_prediction

app = FastAPI(title="MediSense ML Inference", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_URL = os.getenv("DB_URL", "postgresql://admin:password@database:5432/medisense")

class ForecastRequest(BaseModel):
    district_id: int
    disease: str = "Dengue"
    days: int = 30


class TriageRequest(BaseModel):
    symptoms_text: str
    language: str = "bn"


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "medisense-ml-inference", "timestamp": datetime.now().isoformat()}


@app.post("/predict/forecast")
def generate_forecast(req: ForecastRequest):
    """Generate mock LSTM time-series forecast data."""
    base_cases = random.randint(20, 200)
    forecasts = []
    for i in range(req.days):
        date = datetime.now() + timedelta(days=i)
        # Simulate seasonal trend with noise
        seasonal = np.sin(i * 0.2) * 30
        trend = i * 1.5
        noise = random.gauss(0, 10)
        predicted = max(0, int(base_cases + seasonal + trend + noise))
        forecasts.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_cases": predicted,
            "lower_bound": max(0, predicted - random.randint(10, 30)),
            "upper_bound": predicted + random.randint(10, 30),
            "confidence": round(0.7 + random.random() * 0.25, 3),
        })

    return {
        "district_id": req.district_id,
        "disease": req.disease,
        "model": "LSTM-Epidemic-v2",
        "forecasts": forecasts,
    }


@app.post("/verify/triage")
def run_triage(req: TriageRequest):
    """Mock BanglaBERT triage inference."""
    symptom_embeddings = {
        "জ্বর": [0.8, 0.2, 0.1],
        "কাশি": [0.3, 0.7, 0.1],
        "শ্বাসকষ্ট": [0.1, 0.3, 0.9],
        "বুকে ব্যথা": [0.1, 0.1, 0.95],
        "মাথাব্যথা": [0.6, 0.1, 0.05],
    }

    severity_scores = [0.3]
    for symptom, embedding in symptom_embeddings.items():
        if symptom in req.symptoms_text:
            severity_scores.append(embedding[2])

    max_severity = max(severity_scores)
    if max_severity > 0.7:
        level = "critical"
    elif max_severity > 0.3:
        level = "moderate"
    else:
        level = "low"

    return {
        "triage_level": level,
        "severity_score": round(max_severity, 3),
        "model": "BanglaBERT-Triage-v1",
        "confidence": round(0.75 + random.random() * 0.2, 3),
    }


@app.post("/predict/train_and_predict")
def train_and_predict():
    """Train the classifier model on DB records and predict outbreaks for tomorrow."""
    try:
        # 1. Fetch data from DB
        conn = psycopg2.connect(DB_URL)
        query = """
            SELECT district_id, disease, predicted_date, predicted_cases, 
                   actual_cases, probability, temperature, humidity, rainfall_mm, season_type 
            FROM outbreak_predictions
        """
        df = pd.read_sql(query, conn)
        
        if len(df) == 0:
            # Fallback: if table is empty, load from outbreak_data.csv
            csv_path = os.path.join(os.path.dirname(__file__), "outbreak_data.csv")
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
            else:
                return {"status": "error", "message": "No data found in database or CSV to train on"}

        # 2. Train the model
        train_result = outbreak_prediction.train_disease_model(df)
        
        # 3. Predict for next day (tomorrow) for all 64 districts
        tomorrow = (datetime.now() + timedelta(days=1)).date()
        
        # Fetch the latest climate settings per district to use as inputs
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT DISTINCT ON (district_id) 
                   district_id, temperature, humidity, rainfall_mm, season_type 
            FROM outbreak_predictions 
            ORDER BY district_id, predicted_date DESC
        """)
        latest_weather = {row['district_id']: row for row in cursor.fetchall()}
        
        predictions_to_insert = []
        
        for district_id in range(1, 65):
            weather = latest_weather.get(district_id, {
                'temperature': 31.0,
                'humidity': 80.0,
                'rainfall_mm': 120.0,
                'season_type': 'Monsoon'
            })
            
            temp = float(weather.get('temperature') or 31.0)
            hum = float(weather.get('humidity') or 80.0)
            rain = float(weather.get('rainfall_mm') or 120.0)
            season = str(weather.get('season_type') or 'Monsoon')
            
            # Predict all diseases and their probabilities
            disease_probs = outbreak_prediction.predict_all_diseases(
                district_id, temp, hum, rain, season
            )
            
            for disease, prob in disease_probs:
                # Generate simulated predicted cases
                predicted_cases = int(prob * 300 + random.randint(10, 50))
                
                predictions_to_insert.append((
                    district_id, disease, tomorrow, predicted_cases, None, prob, temp, hum, rain, season
                ))
            
        # Delete any existing predictions for tomorrow to avoid duplicates
        cursor.execute("DELETE FROM outbreak_predictions WHERE predicted_date = %s", (tomorrow,))
        
        # Insert new predictions
        insert_query = """
            INSERT INTO outbreak_predictions 
            (district_id, disease, predicted_date, predicted_cases, actual_cases, probability, temperature, humidity, rainfall_mm, season_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.executemany(insert_query, predictions_to_insert)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "message": f"Successfully trained model and generated predictions for tomorrow ({tomorrow})",
            "trained_rows": len(df),
            "predictions_count": len(predictions_to_insert)
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
