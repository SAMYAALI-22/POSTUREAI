import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { PoseViolation } from '../utils/poseDetection';
import { useTheme } from '../contexts/ThemeContext';

interface RealTimeFeedbackProps {
  violations: PoseViolation[];
}

const RealTimeFeedback: React.FC<RealTimeFeedbackProps> = ({ violations }) => {
  const { isDark } = useTheme();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': 
        return isDark 
          ? 'bg-red-900/50 border-red-700 text-red-300' 
          : 'bg-red-50 border-red-200 text-red-800';
      case 'warning': 
        return isDark 
          ? 'bg-orange-900/50 border-orange-700 text-orange-300' 
          : 'bg-orange-50 border-orange-200 text-orange-800';
      default: 
        return isDark 
          ? 'bg-blue-900/50 border-blue-700 text-blue-300' 
          : 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle size={16} className="text-red-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-600" />;
      default: return <Info size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
        Real-Time Feedback
      </h3>
      
      {violations.length === 0 ? (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle size={20} />
          <span className="font-medium">Perfect Posture!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {violations.map((violation, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getSeverityColor(violation.severity)}`}
            >
              <div className="flex items-start space-x-2">
                {getSeverityIcon(violation.severity)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{violation.message}</div>
                  <div className="text-xs mt-1 opacity-75">{violation.rule}</div>
                  {violation.angle && violation.threshold && (
                    <div className="text-xs mt-1 font-mono">
                      Current: {Math.round(violation.angle)}° | Limit: {violation.threshold}°
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <strong>Tips:</strong> Keep your shoulders relaxed, spine aligned, and maintain steady breathing.
        </div>
      </div>
    </div>
  );
};

export default RealTimeFeedback;