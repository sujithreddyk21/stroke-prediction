import React from 'react';

interface ResultCardProps {
  result: {
    risk_score: number;
    risk_percentage: string;
    category: string;
  } | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  if (!result) return null;

  // Determine styles based on risk category
  const isHighRisk = result.category.includes("High");
  const bgColor = isHighRisk ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
  const textColor = isHighRisk ? "text-red-700" : "text-green-700";
  const icon = isHighRisk ? "⚠️" : "✅";

  return (
    <div className={`mt-6 p-6 rounded-lg border-2 ${bgColor} text-center shadow-sm transition-all duration-500 ease-in-out`}>
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className={`text-2xl font-bold ${textColor} mb-2`}>
        {result.category}
      </h3>
      
      <div className="flex justify-center items-end space-x-2">
        <span className="text-4xl font-extrabold text-gray-800">
          {result.risk_percentage}
        </span>
        <span className="text-gray-500 mb-1">Probability</span>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        {isHighRisk 
          ? "Immediate clinical assessment is recommended." 
          : "Standard health monitoring is advised."}
      </p>
    </div>
  );
};

export default ResultCard;