from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  # <--- Added for TIA Input
from typing import List         # <--- Added for TIA Input
from dotenv import load_dotenv
import os
import torch

from app.utils.model_loader import ModelLoader
from app.utils.preprocessors import process_stroke_input, process_afib_signal
from app.schemas import StrokePredictionInput, AFibPredictionInput

# Load env vars
load_dotenv()

app = FastAPI(title="Stroke Risk AI System")

# CORS Configuration
origins = ["*"]



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # allow all (we can tighten later)
    allow_credentials=True,
    allow_methods=["*"],      # allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)

# Load models on startup
@app.on_event("startup")
def startup_event():
    ModelLoader.load_models()

@app.get("/")
def read_root():
    return {"status": "active", "version": "1.0.0"}
@app.options("/api/predict-stroke")
def options_predict_stroke():
    return {}

# --- Endpoint 1: Stroke Risk ---
@app.post("/api/predict-stroke")
def predict_stroke(data: StrokePredictionInput):
    model = ModelLoader.get_xgb_model()
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Preprocess
        input_df = process_stroke_input(data)
        
        # Predict (GridSearch object has .predict_proba)
        # We need the probability of class 1 (Stroke)
        probability = model.predict_proba(input_df)[:, 1][0]
        
        return {
            "risk_score": float(probability),
            "risk_percentage": f"{round(probability * 100, 2)}%",
            "category": "High Risk" if probability > 0.4 else "Low Risk"
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=400, detail="Error processing data")
@app.options("/api/detect-afib")
def options_detect_afib():
    return {}

# --- Endpoint 2: AFib Detection ---
@app.post("/api/detect-afib")
def detect_afib(data: AFibPredictionInput):
    model = ModelLoader.get_afib_model()
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # 1. Preprocess using your utility function
        input_tensor = process_afib_signal(data.signal)
        
        # 2. Predict
        with torch.no_grad():
            output = model(input_tensor)
            # Ensure we get a probability between 0 and 1
            # If your model ends with a Linear layer (logits), use sigmoid:
            prob = torch.sigmoid(output).item()
            
            # If your model already has Sigmoid, just use: prob = output.item()
            
        # 3. Create the Label (CRITICAL FIX FOR FRONTEND)
        # Your Frontend specifically looks for the key "prediction"
        label = "Atrial Fibrillation Detected" if prob > 0.5 else "Normal Sinus Rhythm"
            
        return {
            "prediction": label,           # <--- This connects to your React Component
            "probability": f"{prob:.2%}",  # <--- formatted as percentage
            "raw_value": prob
        }
    except Exception as e:
        print(f"AFib Error: {e}")
        raise HTTPException(status_code=400, detail="Error processing signal")

# --- Endpoint 3: TIA Assessment (NEW) ---

# Define Input Schema for TIA
class TIACheckInput(BaseModel):
    symptoms: List[str]  # e.g., ["face_drooping", "speech_difficulty"]
    symptom_duration_hours: float
@app.options("/api/assess-tia")
def options_assess_tia():
    return {}

@app.post("/api/assess-tia")
def assess_tia(data: TIACheckInput):
    # Rule-Based Logic for TIA (Transient Ischemic Attack)
    # Based on the F.A.S.T. protocol and common TIA warning signs
    high_risk_symptoms = [
        "face_drooping",      # F: Face
        "arm_weakness",       # A: Arm
        "speech_difficulty",  # S: Speech
        "vision_loss", 
        "paralysis",
        "numbness"
    ]
    
    # 1. Identify Matches
    detected_risk_factors = [s for s in data.symptoms if s in high_risk_symptoms]
    is_critical = len(detected_risk_factors) > 0
    
    # 2. Logic Tree
    if is_critical:
        status = "High Risk (Possible TIA/Stroke)"
        alert = "CRITICAL"
        recommendation = "IMMEDIATE ACTION REQUIRED: Call Emergency Services. Symptoms match the FAST stroke protocol."
    
    elif data.symptom_duration_hours > 24:
        status = "Medical Evaluation Needed"
        alert = "WARNING"
        recommendation = "Symptoms lasting >24h are likely not a TIA (which resolve quickly) but require a doctor's visit to rule out other neurological issues."
        
    elif len(data.symptoms) > 0:
        status = "Moderate Risk"
        alert = "CAUTION"
        recommendation = "Monitor symptoms closely. If they worsen or return, seek medical help immediately."
        
    else:
        status = "Low Risk"
        alert = "NORMAL"
        recommendation = "No specific stroke/TIA indicators reported. Maintain healthy lifestyle."

    return {
        "status": status,
        "alert_level": alert,
        "recommendation": recommendation,
        "risk_factors_found": detected_risk_factors
    }