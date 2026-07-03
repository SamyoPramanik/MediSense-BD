# -*- coding: utf-8 -*-
"""
MediSense BD — Outbreak Prediction Model Training and Inference Module
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

def load_and_preprocess_data(df):
    """Preprocess the dataset for training."""
    df_clean = df.copy()
    
    # Handle empty/missing values safely
    df_clean['temperature'] = df_clean['temperature'].fillna(df_clean['temperature'].mean() if len(df_clean) > 0 else 30.0)
    df_clean['humidity'] = df_clean['humidity'].fillna(df_clean['humidity'].mean() if len(df_clean) > 0 else 80.0)
    df_clean['rainfall_mm'] = df_clean['rainfall_mm'].fillna(df_clean['rainfall_mm'].mean() if len(df_clean) > 0 else 100.0)
    df_clean['season_type'] = df_clean['season_type'].fillna('Summer')
    
    # Fit and transform encoders
    le_season = LabelEncoder()
    df_clean['season_encoded'] = le_season.fit_transform(df_clean['season_type'].astype(str))
    
    le_disease = LabelEncoder()
    df_clean['disease_encoded'] = le_disease.fit_transform(df_clean['disease'].astype(str))
    
    return df_clean, le_season, le_disease

def train_disease_model(df):
    """Train the RandomForestClassifier on the provided dataframe."""
    df_clean, le_season, le_disease = load_and_preprocess_data(df)
    
    features = ['district_id', 'temperature', 'humidity', 'rainfall_mm', 'season_encoded']
    X = df_clean[features]
    y = df_clean['disease_encoded']
    
    # Train the RandomForest model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save the model and encoders
    joblib.dump(model, os.path.join(MODEL_DIR, 'disease_model.pkl'))
    joblib.dump(le_season, os.path.join(MODEL_DIR, 'season_encoder.pkl'))
    joblib.dump(le_disease, os.path.join(MODEL_DIR, 'disease_encoder.pkl'))
    
    return {
        "status": "success",
        "classes": [str(c) for c in le_disease.classes_]
    }

def predict_current_disease(district_id, temp, hum, rain, season_text):
    """Load model and encoders to predict disease outbreak risk."""
    model_path = os.path.join(MODEL_DIR, 'disease_model.pkl')
    season_path = os.path.join(MODEL_DIR, 'season_encoder.pkl')
    disease_path = os.path.join(MODEL_DIR, 'disease_encoder.pkl')
    
    # Fallback if model hasn't been trained yet
    if not (os.path.exists(model_path) and os.path.exists(season_path) and os.path.exists(disease_path)):
        fallback_diseases = ["Dengue", "Diarrhea", "Influenza", "Typhoid"]
        return fallback_diseases[district_id % len(fallback_diseases)], 0.65
        
    model = joblib.load(model_path)
    le_season = joblib.load(season_path)
    le_disease = joblib.load(disease_path)
    
    try:
        # Transform the input season text using the saved label encoder
        season_encoded = le_season.transform([season_text])[0]
    except ValueError:
        # Default fallback if season label was never seen in training
        season_encoded = 0
        
    input_data = pd.DataFrame(
        [[district_id, temp, hum, rain, season_encoded]],
        columns=['district_id', 'temperature', 'humidity', 'rainfall_mm', 'season_encoded']
    )
    
    predicted_encoded = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]
    
    disease_name = le_disease.inverse_transform([predicted_encoded])[0]
    highest_prob = np.max(probabilities)
    
    return str(disease_name), float(highest_prob)

def predict_all_diseases(district_id, temp, hum, rain, season_text):
    """Load model and encoders to predict probabilities for all diseases."""
    model_path = os.path.join(MODEL_DIR, 'disease_model.pkl')
    season_path = os.path.join(MODEL_DIR, 'season_encoder.pkl')
    disease_path = os.path.join(MODEL_DIR, 'disease_encoder.pkl')
    
    fallback_diseases = ["Dengue", "Diarrhea", "Influenza", "Typhoid"]
    
    # Fallback if model hasn't been trained yet
    if not (os.path.exists(model_path) and os.path.exists(season_path) and os.path.exists(disease_path)):
        np.random.seed(district_id)
        # Generate random probabilities that sum to 1
        probs = np.random.dirichlet(np.ones(4))[0]
        return [(fallback_diseases[i], float(probs[i])) for i in range(4)]
        
    model = joblib.load(model_path)
    le_season = joblib.load(season_path)
    le_disease = joblib.load(disease_path)
    
    try:
        season_encoded = le_season.transform([season_text])[0]
    except ValueError:
        season_encoded = 0
        
    input_data = pd.DataFrame(
        [[district_id, temp, hum, rain, season_encoded]],
        columns=['district_id', 'temperature', 'humidity', 'rainfall_mm', 'season_encoded']
    )
    
    probabilities = model.predict_proba(input_data)[0]
    classes = le_disease.classes_
    
    results = []
    for cls, prob in zip(classes, probabilities):
        results.append((str(cls), float(prob)))
        
    # Ensure all four standard diseases are returned
    existing_diseases = [r[0] for r in results]
    for fd in fallback_diseases:
        if fd not in existing_diseases:
            results.append((fd, 0.0))
            
    return results