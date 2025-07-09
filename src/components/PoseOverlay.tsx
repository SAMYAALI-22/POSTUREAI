import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Results } from '@mediapipe/pose';
import { PoseViolation } from '../utils/poseDetection';

interface PoseOverlayProps {
  violations: PoseViolation[];
  mode: 'desk' | 'squat';
  poseResults: Results | null;
}

const PoseOverlay: React.FC<PoseOverlayProps> = ({ violations, mode, poseResults }) => {
  const hasViolations = violations.length > 0;
  
  const drawPoseConnections = () => {
    if (!poseResults?.poseLandmarks) return null;
    
    const landmarks = poseResults.poseLandmarks;
    
    // Define pose connections (MediaPipe pose connections)
    const connections = [
      // Face
      [0, 1], [1, 2], [2, 3], [3, 7],
      [0, 4], [4, 5], [5, 6], [6, 8],
      // Torso
      [9, 10],
      [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [11, 23], [12, 24], [23, 24],
      // Legs
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ];

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
        {/* Draw connections */}
        {connections.map(([start, end], index) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          
          if (startPoint?.visibility > 0.5 && endPoint?.visibility > 0.5) {
            return (
              <line
                key={`connection-${index}`}
                x1={`${startPoint.x * 100}%`}
                y1={`${startPoint.y * 100}%`}
                x2={`${endPoint.x * 100}%`}
                y2={`${endPoint.y * 100}%`}
                stroke={hasViolations ? '#EF4444' : '#10B981'}
                strokeWidth="2"
                opacity="0.8"
              />
            );
          }
          return null;
        })}
        
        {/* Draw key points */}
        {landmarks.map((landmark, index) => {
          if (landmark.visibility > 0.5) {
            // Only show key landmarks
            const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
            if (keyPoints.includes(index)) {
              return (
                <circle
                  key={`point-${index}`}
                  cx={`${landmark.x * 100}%`}
                  cy={`${landmark.y * 100}%`}
                  r="4"
                  fill={hasViolations ? '#EF4444' : '#10B981'}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            }
          }
          return null;
        })}
      </svg>
    );
  };
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Pose skeleton */}
      {drawPoseConnections()}
      
      {/* Violation alerts */}
      {hasViolations && (
        <div className="absolute top-4 right-4 space-y-2 max-w-xs">
          {violations.map((violation, index) => (
            <div
              key={index}
              className={`px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
                violation.severity === 'error' 
                  ? 'bg-red-600/90 text-white' 
                  : 'bg-orange-600/90 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {violation.type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs mt-1 opacity-90">
                {violation.message}
              </div>
              {violation.angle && violation.threshold && (
                <div className="text-xs mt-1 font-mono opacity-75">
                  {Math.round(violation.angle)}° (limit: {violation.threshold}°)
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Good posture indicator */}
      {!hasViolations && poseResults?.poseLandmarks && (
        <div className="absolute top-4 right-4 bg-green-600/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Perfect Form!</span>
          </div>
        </div>
      )}
      
      {/* Mode indicator */}
      <div className="absolute bottom-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        {mode === 'desk' ? '🖥️ Desk Mode' : '🏋️ Squat Mode'}
      </div>
      
      {/* Detection status */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${poseResults?.poseLandmarks ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          {poseResults?.poseLandmarks ? 'Detecting' : 'No Pose'}
        </span>
      </div>
    </div>
  );
};

export default PoseOverlay;