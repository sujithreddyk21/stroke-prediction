from pydantic import BaseModel
from typing import List, Literal

# Stroke Risk Input
class StrokePredictionInput(BaseModel):
    gender: Literal["Male", "Female", "Other"]
    age: float
    hypertension: int       # 0 or 1
    heart_disease: int      # 0 or 1
    ever_married: Literal["Yes", "No"]
    work_type: Literal["Private", "Self-employed", "Govt_job", "children", "Never_worked"]
    residence_type: Literal["Urban", "Rural"]
    avg_glucose_level: float
    bmi: float
    smoking_status: Literal["formerly smoked", "never smoked", "smokes", "Unknown"]

# AFib Signal Input (ECG)
class AFibPredictionInput(BaseModel):
    signal: List[float] # List of heart rate/ECG values