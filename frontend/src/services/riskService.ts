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
    prediction: string;
    probability?: string;
}

// --- 3. TIA Assessment Types ---

export interface TIAResponse {
    status: string;
    alert_level: "CRITICAL" | "WARNING" | "CAUTION" | "NORMAL";
    recommendation: string;
    risk_factors_found: string[];
}

// --- 4. Service Functions ---

// ✅ Predict Stroke Risk (FIXED + DEBUG LOGGING)
export const predictStrokeRisk = async (data: StrokeInput): Promise<StrokeResponse> => {
    try {
        console.log("📤 Sending to Render:", data);  // <-- IMPORTANT DEBUG LOG

        const response = await api.post('/api/predict-stroke', data, {
            timeout: 15000, // 15 seconds
        });

        console.log("✅ Response from Render:", response.data);
        return response.data; 

    } catch (error: any) {
        console.error("❌ Stroke API Error:", error);

        if (error.response) {
            console.error("Backend status:", error.response.status);
            console.error("Backend detail:", error.response.data);
        }

        throw error;
    }
};

// ✅ Detect AFib (No change needed, but cleaner)
export const detectAfib = async (signalData: number[]): Promise<AFibResponse> => {
    try {
        console.log("📤 Sending AFib signal:", signalData);

        const response = await api.post('/api/detect-afib', { signal: signalData });

        console.log("✅ AFib response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ AFib API Error:", error);
        throw error;
    }
};

// ✅ Assess TIA Risk (No change needed, but cleaner)
export const assessTiaRisk = async (
    symptoms: string[], 
    duration: number
): Promise<TIAResponse> => {
    try {
        console.log("📤 Sending TIA data:", { symptoms, symptom_duration_hours: duration });

        const response = await api.post('/api/assess-tia', { 
            symptoms: symptoms, 
            symptom_duration_hours: duration 
        });

        console.log("✅ TIA response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ TIA API Error:", error);
        throw error;
    }
};
