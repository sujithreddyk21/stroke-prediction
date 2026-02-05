import api from './api';

// --- 1. Stroke Prediction Types ---

export interface StrokeInput {
    gender: "Male" | "Female";
    age: number;
    hypertension: 0 | 1;
    heart_disease: 0 | 1;
    ever_married: "Yes" | "No";
    work_type: "Private" | "Self-employed" | "Govt_job" | "children" | "Never_worked";
    residence_type: "Urban" | "Rural";
    avg_glucose_level: number;
    bmi: number;
    smoking_status: "formerly smoked" | "never smoked" | "smokes" | "Unknown";
}

export interface StrokeResponse {
    risk_score: number;
    risk_percentage: string;
    category: "High Risk" | "Low Risk";
}

// --- 2. AFib Detection Types ---

export interface AFibResponse {
    prediction: string; // e.g., "Normal Sinus Rhythm" or "Atrial Fibrillation Detected"
    probability?: string;
}

// --- 3. TIA Assessment Types (NEW) ---

export interface TIAResponse {
    status: string;
    alert_level: "CRITICAL" | "WARNING" | "CAUTION" | "NORMAL";
    recommendation: string;
    risk_factors_found: string[];
}

// --- 4. Service Functions ---

// Predict Stroke Risk
export const predictStrokeRisk = async (data: StrokeInput): Promise<StrokeResponse> => {
    try {
        const response = await api.post('/api/predict-stroke', data);
        return response.data; 
    } catch (error) {
        console.error("Stroke API Error:", error);
        throw error;
    }
};

// Detect AFib
export const detectAfib = async (signalData: number[]): Promise<AFibResponse> => {
    try {
        // We wrap the array in an object because the Backend expects { "signal": [...] }
        const response = await api.post('/api/detect-afib', { signal: signalData });
        return response.data;
    } catch (error) {
        console.error("AFib API Error:", error);
        throw error;
    }
};

// Assess TIA Risk (NEW)
export const assessTiaRisk = async (symptoms: string[], duration: number): Promise<TIAResponse> => {
    try {
        const response = await api.post('/api/assess-tia', { 
            symptoms: symptoms, 
            symptom_duration_hours: duration 
        });
        return response.data;
    } catch (error) {
        console.error("TIA API Error:", error);
        throw error;
    }
};