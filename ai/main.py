"""MediSense BD — ML Inference Service (FastAPI)"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from datetime import datetime, timedelta
import random

app = FastAPI(title="MediSense ML Inference", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
