import React, { useState, useRef } from 'react';
import { detectAfib } from '../services/riskService';

const AfibDetector = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // Accepts object with prediction & probability
  const [signalStatus, setSignalStatus] = useState("No signal loaded");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. SIMULATION HELPERS ---
  
  // Generates a "Heartbeat-like" pattern (Spikes every ~150ms)
  const generateNormalSignal = () => {
    const data = [];
    for (let i = 0; i < 1000; i++) {
      let val = Math.random() * 0.1; // Base noise
      // Add QRS Spike to mimic real heartbeat
      if (i % 150 === 0) val += 5.0;
      else if (i % 150 === 5) val -= 1.0;
      data.push(val);
    }
    return data;
  };

  // Generates Chaotic Noise (AFib)
  const generateAfibSignal = () => {
    return Array.from({ length: 1000 }, () => (Math.random() - 0.5) * 5);
  };

  // --- 2. MAIN ANALYSIS FUNCTION ---
  const runAnalysis = async (signalData: number[], sourceName: string) => {
    setLoading(true);
    setResult(null);
    setSignalStatus(`Analyzing signal from: ${sourceName}...`);

    try {
      // Calls the Backend LSTM API
      const response = await detectAfib(signalData);
      setResult(response); 
      setSignalStatus("Analysis Complete");
    } catch (error) {
      setResult(null);
      setSignalStatus("Error connecting to AI Model");
      alert("Backend Error: Ensure the Python server is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. HANDLE FILE UPLOAD (SMART LOGIC) ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    // This runs once the file is read
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      // 1. Parse the text file into an array of numbers
      // Splits by new lines (\n) OR commas (,) to handle CSVs
      let signalArray = text.split(/[\n,]+/)
                              .map(num => parseFloat(num.trim()))
                              .filter(num => !isNaN(num)); // Remove garbage/empty lines

      // 2. Validate Data
      if (signalArray.length < 10) {
        alert("File Error: The file must contain at least 10 valid numbers.");
        return;
      }
      
      // 3. AUTO-REPEAT LOGIC (The Fix)
      // The AI needs 1000 points. If the file is short, we repeat the pattern.
      // This allows small clips of data to be analyzed accurately.
      while (signalArray.length < 1000) {
        signalArray = [...signalArray, ...signalArray];
      }

      // 4. Trim to exactly 1000 points (Standard input size for your LSTM)
      const finalSignal = signalArray.slice(0, 1000); 

      // 5. Send to AI
      await runAnalysis(finalSignal, `Uploaded File (${file.name})`);
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 border-t-4 border-indigo-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AFib Detection (LSTM)</h2>
        <p className="text-gray-500 text-sm">Analyze ECG signal patterns from wearables or uploaded files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Button 1: Simulate Normal */}
        <button 
          onClick={() => runAnalysis(generateNormalSignal(), "Simulation (Normal)")}
          disabled={loading}
          className="p-3 border border-green-200 bg-green-50 hover:bg-green-100 rounded text-green-700 font-semibold text-sm transition-colors"
        >
          🏥 Demo Normal
        </button>

        {/* Button 2: Simulate AFib */}
        <button 
          onClick={() => runAnalysis(generateAfibSignal(), "Simulation (AFib)")}
          disabled={loading}
          className="p-3 border border-red-200 bg-red-50 hover:bg-red-100 rounded text-red-700 font-semibold text-sm transition-colors"
        >
          💔 Demo AFib
        </button>

        {/* Button 3: Upload File */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="p-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 font-semibold text-sm transition-colors flex flex-col items-center justify-center"
        >
          <span className="flex items-center gap-2">📂 Upload Data</span>
        </button>
        
        {/* Hidden Input for File Upload */}
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt"
            className="hidden"
        />
      </div>

      {/* Result Area */}
      <div className="bg-gray-50 p-6 rounded-lg text-center min-h-[120px] flex flex-col justify-center border border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{signalStatus}</p>
        
        {loading && (
          <div className="flex justify-center items-center space-x-2 text-indigo-600">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
             <span className="font-bold">Processing Signal...</span>
          </div>
        )}
        
        {result && (
          <div className="animate-fade-in-up">
            <h3 className={`text-2xl font-extrabold ${result.prediction.includes("Normal") ? "text-green-600" : "text-red-600"}`}>
              {result.prediction}
            </h3>
            {result.probability && (
              <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-bold shadow-sm text-gray-500 border border-gray-200">
                Confidence: {result.probability}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AfibDetector;