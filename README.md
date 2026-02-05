# Stroke Risk Prediction & Early Detection System

A comprehensive AI-powered system for stroke risk prediction, AFib detection, and TIA assessment.

## Technology Stack

- **Backend**: Python, FastAPI, Mock ML Models (XGBoost/LSTM logic)
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Architecture**: Separated Client-Server model

## Project Structure

```
/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # API Routes
│   │   ├── ml/             # Mock Machine Learning Models
│   │   └── main.py         # Application Entry Point
│   └── requirements.txt    # Python Dependencies
│
└── frontend/               # React Application
    ├── src/
    │   ├── components/     # Functional Components (RiskGauge, AFibMonitor, etc.)
    │   ├── App.tsx         # Main Layout
    │   └── main.tsx        # React Entry Point
    └── package.json        # Node Dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+ & npm (required for frontend)

### 1. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. Documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
The application will run at `http://localhost:5173`.

## Features

1.  **Risk Dashboard**: Input patient data (age, BMI, etc.) to get a calculated stroke risk probability.
2.  **AFib Monitor**: Real-time simulation of wearable heart rate data with AFib detection logic.
3.  **Alerts & TIA Check**: View system alerts and assess Transient Ischemic Attack symptoms.

## API Endpoints

- `POST /api/v1/predict_risk`: Calculate stroke risk score.
- `POST /api/v1/detect_afib`: Analyze heart rate series for AFib.
- `POST /api/v1/assess_tia`: Evaluates symptoms for TIA risk.
