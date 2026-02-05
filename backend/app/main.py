from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import os
import torch

from app.utils.model_loader import ModelLoader
from app.utils.preprocessors import process_stroke_input, process_afib_signal
from app.schemas import StrokePredictionInput, AFibPredictionInput

# Load env vars
load_dotenv()

app = FastAPI(title="Stroke Risk AI System")

# ======================
# ✅ FIXED CORS (MOST IMPORTANT PART)
# ======================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # MUST be False with Render + Vercel
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models on startup
@app.on_event("startup")
def startup_event():
    ModelLoader.load_models()

@app.get("/")
def read_root():
    return {"status": "active", "version": "1.0.0"}

# ======================
# ✅ PROPER OPTIONS HANDLER (preflight fix)
# ======================

@app.options("/api/predict-stroke")
def options_predict_stroke():
    return {}

@app.options("/api/detect-afib")
def options_detect_afib():
    return {}

@app.options("/api/assess-tia")
def options_assess_tia():
    return {}

# ======================
# 🔹 ENDPOINT 1 — Stroke Prediction (FIXED ERROR HANDLING)
# ======================

@app.post("/api/predict-stroke")
def predict_stroke(data: StrokePredictionInput):
    model = ModelLoader.get_xgb_model()
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        input_df = process_stroke_input(data)
        probability = model.predict_proba(input_df)[:, 1][0]

        return {
            "risk_score": float(probability),
            "risk_percentage": f"{round(probability * 100, 2)}%",
            "category": "High Risk" if probability > 0.4 else "Low Risk"
        }

    except Exception as e:
        print("🔥 FULL Prediction Error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

# ======================
# 🔹 ENDPOINT 2 — AFib Detection (UNCHANGED)
# ======================

@app.post("/api/detect-afib")
def detect_afib(data: AFibPredictionInput):
    model = ModelLoader.get_afib_model()
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        input_tensor = process_afib_signal(data.signal)

        with torch.no_grad():
            output = model(input_tensor)
            prob = torch.sigmoid(output).item()

        label = "Atrial Fibrillation Detected" if prob > 0.5 else "Normal Sinus Rhythm"

        return {
            "prediction": label,
            "probability": f"{prob:.2%}",
            "raw_value": prob
        }

    except Exception as e:
        print("🔥 AFib Error:", str(e))
        raise HTTPException(status_code=400, detail="Error processing signal")

# ======================
# 🔹 ENDPOINT 3 — TIA Assessment
# ======================

class TIACheckInput(BaseModel):
    symptoms: List[str]
    symptom_duration_hours: float

@app.post("/api/assess-tia")
def assess_tia(data: TIACheckInput):
    high_risk_symptoms = [
        "face_drooping",
        "arm_weakness",
        "speech_difficulty",
        "vision_loss",
        "paralysis",
        "numbness"
    ]

    detected_risk_factors = [s for s in data.symptoms if s in high_risk_symptoms]
    is_critical = len(detected_risk_factors) > 0

    if is_critical:
        status = "High Risk (Possible TIA/Stroke)"
        alert = "CRITICAL"
        recommendation = "IMMEDIATE ACTION REQUIRED: Call Emergency Services."
    elif data.symptom_duration_hours > 24:
        status = "Medical Evaluation Needed"
        alert = "WARNING"
        recommendation = "Consult a doctor."
    elif len(data.symptoms) > 0:
        status = "Moderate Risk"
        alert = "CAUTION"
        recommendation = "Monitor symptoms closely."
    else:
        status = "Low Risk"
        alert = "NORMAL"
        recommendation = "No immediate concerns."

    return {
        "status": status,
        "alert_level": alert,
        "recommendation": recommendation,
        "risk_factors_found": detected_risk_factors
    }
