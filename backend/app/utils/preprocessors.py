import pandas as pd
import numpy as np
import torch

# --- 1. Stroke Data Preprocessing ---
def process_stroke_input(data):
    """
    Manually encodes data to match the columns XGBoost was trained on.
    Ensures 'gender', 'Residence_type', and One-Hot Encoding match training exactly.
    """
    # 1. Base Feature Mappings
    # Note: Ensure these mappings (0/1/2) match your LabelEncoder from training!
    row = {
        'gender': 0 if data.gender == 'Male' else (1 if data.gender == 'Female' else 2),
        'age': data.age,
        'hypertension': data.hypertension,
        'heart_disease': data.heart_disease,
        'ever_married': 1 if data.ever_married == 'Yes' else 0,
        'Residence_type': 1 if data.residence_type == 'Urban' else 0,
        'avg_glucose_level': data.avg_glucose_level,
        'bmi': data.bmi,
    }

    # 2. One-Hot Encoding Initialization
    # We initialize all dummy columns to 0.
    one_hot_cols = [
        'work_type_Govt_job', 'work_type_Never_worked', 'work_type_Private', 
        'work_type_Self-employed', 'work_type_children',
        'smoking_status_Unknown', 'smoking_status_formerly smoked', 
        'smoking_status_never smoked', 'smoking_status_smokes'
    ]
    
    for col in one_hot_cols:
        row[col] = 0

    # 3. Set Active Columns (One-Hot Encoding)
    # This activates the specific column based on the user's input string.
    if f'work_type_{data.work_type}' in row:
        row[f'work_type_{data.work_type}'] = 1
    
    if f'smoking_status_{data.smoking_status}' in row:
        row[f'smoking_status_{data.smoking_status}'] = 1

    # 4. Create DataFrame
    df = pd.DataFrame([row])
    
    # --- CRITICAL: ENFORCE COLUMN ORDER ---
    # XGBoost does not use column names during prediction; it relies purely on column order.
    # This list must match the order of columns in X_train during training.
    expected_order = [
        'gender', 
        'age', 
        'hypertension', 
        'heart_disease', 
        'ever_married', 
        'Residence_type', 
        'avg_glucose_level', 
        'bmi',
        # Work Type columns sorted alphabetically usually
        'work_type_Govt_job', 
        'work_type_Never_worked', 
        'work_type_Private', 
        'work_type_Self-employed', 
        'work_type_children',
        # Smoking Status columns sorted alphabetically usually
        'smoking_status_Unknown', 
        'smoking_status_formerly smoked', 
        'smoking_status_never smoked', 
        'smoking_status_smokes'
    ]
    
    # Reorder DataFrame columns to match the model's expectation
    df = df[expected_order]
    
    return df

# --- 2. AFib Signal Preprocessing (OPTIMIZED) ---
def process_afib_signal(signal_list):
    """
    Prepares the raw ECG signal for the LSTM model.
    Steps:
    1. Convert to NumPy Float32.
    2. Normalize (Z-Score) to match training distribution (Mean=0, Std=1).
    3. Pad or Truncate to exactly 1000 time steps.
    4. Reshape to (Batch, Seq_Len, Features) -> (1, 1000, 1).
    """
    # 1. Convert list to Numpy Float Array (Stable types)
    signal = np.array(signal_list, dtype=np.float32)
    
    # 2. Data Cleaning: Replace NaNs or Infinity with 0
    signal = np.nan_to_num(signal)

    # 3. Z-Score Normalization
    # Training data was normalized using: (X - mean) / std
    # We must apply the same transform here so 5.0 behaves like a peak, not an outlier.
    mean = np.mean(signal)
    std = np.std(signal)
    
    # Avoid division by zero if signal is a flat line (std = 0)
    if std < 1e-7:
        std = 1e-7
        
    signal_normalized = (signal - mean) / std

    # 4. Length Standardization (Target: 1000 points)
    target_len = 1000
    current_len = len(signal_normalized)

    if current_len < target_len:
        # Pad with zeros if too short
        padding = np.zeros(target_len - current_len, dtype=np.float32)
        signal_normalized = np.concatenate([signal_normalized, padding])
    elif current_len > target_len:
        # Truncate if too long
        signal_normalized = signal_normalized[:target_len]

    # 5. Convert to PyTorch Tensor & Reshape
    # LSTM expects input shape: (Batch_Size, Sequence_Length, Input_Size)
    # Here: (1, 1000, 1)
    input_tensor = torch.tensor(signal_normalized, dtype=torch.float32).view(1, target_len, 1)
    
    return input_tensor