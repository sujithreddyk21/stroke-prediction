import pandas as pd
import numpy as np
import torch

def process_stroke_input(data):
    """
    Robust version that works reliably on Render + Vercel + Local
    and matches your trained XGBoost column order.
    """

    # Normalize text inputs to avoid case issues
    gender = data.gender.strip().title()   # "male" -> "Male"
    work_type = data.work_type.strip()
    smoking = data.smoking_status.strip().lower()
    residence = data.residence_type.strip().title()

    # 1. Base Feature Mappings
    row = {
        'gender': 0 if gender == 'Male' else (1 if gender == 'Female' else 2),
        'age': int(data.age),
        'hypertension': int(data.hypertension),
        'heart_disease': int(data.heart_disease),
        'ever_married': 1 if data.ever_married == 'Yes' else 0,
        'Residence_type': 1 if residence == 'Urban' else 0,
        'avg_glucose_level': float(data.avg_glucose_level),
        'bmi': float(data.bmi),
    }

    # 2. One-Hot Encoding Initialization
    one_hot_cols = [
        'work_type_Govt_job', 'work_type_Never_worked', 'work_type_Private',
        'work_type_Self-employed', 'work_type_children',
        'smoking_status_Unknown', 'smoking_status_formerly smoked',
        'smoking_status_never smoked', 'smoking_status_smokes'
    ]

    for col in one_hot_cols:
        row[col] = 0

    # 3. Activate correct one-hot column (SAFE VERSION)
    work_key = f"work_type_{work_type}"
    smoke_key = f"smoking_status_{smoking}"

    if work_key in row:
        row[work_key] = 1
    else:
        print("⚠️ Unknown work_type:", work_type)

    if smoke_key in row:
        row[smoke_key] = 1
    else:
        print("⚠️ Unknown smoking_status:", smoking)

    # 4. Create DataFrame
    df = pd.DataFrame([row])

    # 5. Enforce exact column order
    expected_order = [
        'gender',
        'age',
        'hypertension',
        'heart_disease',
        'ever_married',
        'Residence_type',
        'avg_glucose_level',
        'bmi',
        'work_type_Govt_job',
        'work_type_Never_worked',
        'work_type_Private',
        'work_type_Self-employed',
        'work_type_children',
        'smoking_status_Unknown',
        'smoking_status_formerly smoked',
        'smoking_status_never smoked',
        'smoking_status_smokes'
    ]

    return df[expected_order]
