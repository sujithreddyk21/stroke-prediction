import React, { useState } from 'react';
import { assessTiaRisk } from '../services/riskService';

const TiaAssessment = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [duration, setDuration] = useState<number | string>(0);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Clinical Symptom List (FAST Protocol + Extras)
    const symptomsList = [
        { id: "face_drooping", label: "Face Drooping (Uneven Smile)" },
        { id: "arm_weakness", label: "Arm Weakness (Drifting down)" },
        { id: "speech_difficulty", label: "Slurred Speech / Confusion" },
        { id: "vision_loss", label: "Sudden Vision Loss / Blurring" },
        { id: "paralysis", label: "Sudden Paralysis (One side)" },
        { id: "numbness", label: "Numbness (Face/Arm/Leg)" },
        { id: "dizziness", label: "Severe Dizziness / Vertigo" }
    ];

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleCheck = async () => {
        setLoading(true);
        setResult(null);
        try {
            // Convert duration to number before sending
            const hours = Number(duration);
            const response = await assessTiaRisk(selectedSymptoms, hours);
            setResult(response);
        } catch (err) {
            alert("Unable to connect to assessment server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 border-t-4 border-yellow-500">
            {/* Header */}
            <div className="mb-8 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">TIA Symptom Assessor</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Rapid TIA/Stroke screening using the F.A.S.T. clinical protocol.
                </p>
            </div>

            {/* 1. Symptom Checklist */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    Select Reported Symptoms
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {symptomsList.map((sym) => (
                        <button 
                            key={sym.id}
                            onClick={() => toggleSymptom(sym.id)}
                            className={`p-3 rounded-lg border text-left flex items-center transition-all duration-200 ${
                                selectedSymptoms.includes(sym.id) 
                                ? 'bg-yellow-50 border-yellow-500 text-yellow-900 shadow-sm ring-1 ring-yellow-500' 
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                                selectedSymptoms.includes(sym.id) ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'
                            }`}>
                                {selectedSymptoms.includes(sym.id) && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="font-medium text-sm">{sym.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Duration Input */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Duration of Symptoms (Hours)
                </label>
                <input 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    className="w-full md:w-1/3 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="0" 
                />
                <p className="text-xs text-gray-400 mt-1">Example: 0.5 for 30 minutes</p>
            </div>

            {/* 3. Action Button */}
            <button 
                onClick={handleCheck} 
                disabled={loading}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-yellow-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {loading ? (
                    <span>Processing Protocol...</span>
                ) : (
                    <span>Run Clinical Assessment</span>
                )}
            </button>

            {/* 4. Results Display */}
            {result && (
                <div className={`mt-8 p-6 rounded-lg border-l-4 animate-fade-in ${
                    result.alert_level === "CRITICAL" ? "bg-red-50 border-red-500 text-red-900" : 
                    result.alert_level === "WARNING" ? "bg-orange-50 border-orange-500 text-orange-900" :
                    "bg-green-50 border-green-500 text-green-900"
                }`}>
                    <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">
                            {result.alert_level === "CRITICAL" ? "🚨" : result.alert_level === "WARNING" ? "⚠️" : "✅"}
                        </span>
                        <div>
                            <h3 className="font-bold text-xl uppercase">{result.status}</h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white bg-opacity-50 border border-current">
                                LEVEL: {result.alert_level}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-2 border-t border-current border-opacity-20 pt-2">
                        <p className="font-medium text-lg mb-1">Recommendation:</p>
                        <p className="leading-relaxed opacity-90">
                            {result.recommendation}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TiaAssessment;