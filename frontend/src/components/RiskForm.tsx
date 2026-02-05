import { useState } from 'react';
import { predictStrokeRisk, StrokeInput } from '../services/riskService';
import ResultCard from './ResultCard';

const RiskForm = () => {
  const [formData, setFormData] = useState<StrokeInput>({
    gender: "Male",
    age: 65,
    hypertension: 0,
    heart_disease: 0,
    ever_married: "Yes",
    work_type: "Private",
    residence_type: "Urban",
    avg_glucose_level: 100.0,
    bmi: 28.0,
    smoking_status: "never smoked"
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["age", "avg_glucose_level", "bmi", "hypertension", "heart_disease"].includes(name) 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictStrokeRisk(formData);
      setResult(data);
    } catch (err) {
      setError("Unable to connect to the AI Server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Patient Assessment</h2>
        <p className="text-gray-500">Enter clinical metrics for stroke risk prediction.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- Section 1: Demographics --- */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" required />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* --- Section 2: Clinical Metrics --- */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Avg Glucose Level</label>
          <input type="number" step="0.1" name="avg_glucose_level" value={formData.avg_glucose_level} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">BMI</label>
          <input type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
        </div>

        {/* --- Section 3: History (Selects) --- */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Hypertension</label>
          <select name="hypertension" value={formData.hypertension} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Heart Disease</label>
          <select name="heart_disease" value={formData.heart_disease} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </div>

        {/* --- Section 4: Lifestyle --- */}
        <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Smoking Status</label>
            <select name="smoking_status" value={formData.smoking_status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                <option value="never smoked">Never Smoked</option>
                <option value="formerly smoked">Formerly Smoked</option>
                <option value="smokes">Smokes</option>
                <option value="Unknown">Unknown</option>
            </select>
        </div>
        
        <div className="col-span-1">
             <label className="block text-sm font-medium text-gray-700">Work Type</label>
             <select name="work_type" value={formData.work_type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                <option value="Private">Private</option>
                <option value="Self-employed">Self-Employed</option>
                <option value="Govt_job">Government Job</option>
                <option value="children">Children</option>
                <option value="Never_worked">Never Worked</option>
             </select>
        </div>

        {/* --- Submit Button --- */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Clinical Data...
                </span>
            ) : "Analyze Stroke Risk"}
          </button>
        </div>
      </form>

      {/* --- Error Message --- */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
        </div>
      )}

      {/* --- Results Display --- */}
      <ResultCard result={result} />
    </div>
  );
};

export default RiskForm;