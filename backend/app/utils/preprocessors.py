import pandas as pd
import numpy as np
import torch

# =========================
# 1) STROKE PREPROCESSING
# =========================

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


# =========================
# 2) AFIB PREPROCESSING  ✅ (THIS WAS MISSING)
# =========================

def process_afib_signal(signal_list):
    """
    Prepares the raw ECG signal for the LSTM model.
    """

    # Convert to numpy
    signal = np.array(signal_list, dtype=np.float32)
    signal = np.nan_to_num(signal)

    # Normalize
    mean = np.mean(signal)
    std = np.std(signal)
    if std < 1e-7:
        std = 1e-7
    signal = (signal - mean) / std

    # Pad or truncate to 1000
    target_len = 1000
    if len(signal) < target_len:
        signal = np.pad(signal, (0, target_len - len(signal)))
    else:
        signal = signal[:target_len]

    # Convert to tensor shape (1, 1000, 1)
    return torch.tensor(signal, dtype=torch.float32).view(1, target_len, 1)
