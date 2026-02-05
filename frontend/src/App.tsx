import Navbar from './components/Navbar';
import RiskForm from './components/RiskForm';
import AfibDetector from './components/AfibDetector';
import TiaAssessment from './components/TiaAssessment'; // <--- Import the new component

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            NeuroGuard AI System
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Advanced multi-modal stroke risk stratification & symptom analysis.
          </p>
        </div>

        {/* --- MODULE 1: STROKE RISK (XGBoost) --- */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">1. Stroke Prediction</h2>
            <p className="text-gray-500 text-sm">Long-term risk analysis based on health history.</p>
          </div>
          <div className="flex justify-center">
            <RiskForm />
          </div>
        </section>

        <div className="border-t border-gray-200 w-1/2 mx-auto"></div>

        {/* --- MODULE 2: AFIB DETECTION (LSTM) --- */}
        <section>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">2. Wearable AFib Detection</h2>
            <p className="text-gray-500 text-sm">Real-time ECG signal processing from wearable devices.</p>
          </div>
          <div className="flex justify-center">
            <AfibDetector />
          </div>
        </section>

        <div className="border-t border-gray-200 w-1/2 mx-auto"></div>

        {/* --- MODULE 3: TIA ASSESSMENT (Rule-Based) --- */}
        <section className="pb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">3. TIA Symptom Check</h2>
            <p className="text-gray-500 text-sm">Immediate F.A.S.T. protocol assessment for active symptoms.</p>
          </div>
          <div className="flex justify-center">
            <TiaAssessment />
          </div>
        </section>

      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <p className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} NeuroGuard System. Medical Research Use Only.
        </p>
      </footer>
    </div>
  );
}

export default App;