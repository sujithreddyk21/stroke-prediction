import torch
import torch.nn as nn
import joblib
import os
import sys

# --- 1. Define LSTM Architecture (Must match training!) ---
class AFibLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, num_classes=1):
        super(AFibLSTM, self).__init__()
        # If you trained with 'batch_first=True', keep it here.
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, num_classes)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # x shape: (batch, seq_len, features)
        out, _ = self.lstm(x)
        # Take the last time step output
        out = self.fc(out[:, -1, :])
        return self.sigmoid(out)

# --- 2. Loader Logic ---
class ModelLoader:
    _xgb_model = None
    _afib_model = None

    @classmethod
    def load_models(cls):
        print("⏳ Loading models...")
        base_path = os.path.dirname(os.path.abspath(__file__))
        # Pointing to backend/app/ml_assets
        assets_dir = os.path.join(base_path, "../ml_assets")

        # 1. Load XGBoost (GridSearch Object)
        try:
            xgb_path = os.path.join(assets_dir, "xgboost_stroke_model.pkl")
            if os.path.exists(xgb_path):
                cls._xgb_model = joblib.load(xgb_path)
                print("✅ XGBoost Stroke Model loaded")
            else:
                print(f"❌ XGBoost file not found at: {xgb_path}")
        except Exception as e:
            print(f"❌ Error loading XGBoost: {e}")

        # 2. Load PyTorch LSTM (State Dict)
        try:
            # REVERTED: Now looking for 'lstm_stroke_model.pt'
            afib_path = os.path.join(assets_dir, "lstm_stroke_model.pt")
            
            if os.path.exists(afib_path):
                # Initialize the architecture
                cls._afib_model = AFibLSTM()
                
                # Load the weights
                state_dict = torch.load(afib_path, map_location=torch.device('cpu'))
                cls._afib_model.load_state_dict(state_dict)
                cls._afib_model.eval() # Important for inference
                print("✅ PyTorch AFib Model loaded")
            else:
                print(f"❌ AFib model file not found at: {afib_path}")
                
        except Exception as e:
            print(f"❌ Error loading PyTorch Model: {e}")

    @classmethod
    def get_xgb_model(cls):
        if cls._xgb_model is None: cls.load_models()
        return cls._xgb_model

    @classmethod
    def get_afib_model(cls):
        if cls._afib_model is None: cls.load_models()
        return cls._afib_model