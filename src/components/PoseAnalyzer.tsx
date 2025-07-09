import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Play, Pause, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { PoseAnalyzer as PoseDetector, extractKeypoints, checkDeskPosture, checkSquatForm, PoseViolation } from '../utils/poseDetection';
import { Results } from '@mediapipe/pose';
import PoseOverlay from './PoseOverlay';
import PostureRules from './PostureRules';
import RealTimeFeedback from './RealTimeFeedback';
import { useTheme } from '../contexts/ThemeContext';

interface PoseAnalyzerProps {
  onViolation: (violation: PoseViolation) => void;
  onAnalysisComplete: (analysis: any) => void;
}

const PoseAnalyzer: React.FC<PoseAnalyzerProps> = ({ onViolation, onAnalysisComplete }) => {
  const { isDark } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMode, setCurrentMode] = useState<'desk' | 'squat'>('desk');
  const [currentViolations, setCurrentViolations] = useState<PoseViolation[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalFrames: 0,
    violationFrames: 0,
    accuracy: 100
  });
  const [poseResults, setPoseResults] = useState<Results | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseAnalyzerRef = useRef<PoseDetector | null>(null);

  const onResults = (results: Results) => {
    if (isPaused || !results) return;
    
    try {
      setPoseResults(results);
      
      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        const keypoints = extractKeypoints(results.poseLandmarks);
        if (keypoints) {
          const violations = currentMode === 'desk' 
            ? checkDeskPosture(keypoints)
            : checkSquatForm(keypoints);
          
          setCurrentViolations(violations);
          
          // Update session stats
          setSessionStats(prev => {
            const newTotal = prev.totalFrames + 1;
            const newViolations = prev.violationFrames + (violations.length > 0 ? 1 : 0);
            const accuracy = newTotal > 0 ? Math.round(((newTotal - newViolations) / newTotal) * 100) : 100;
            
            return {
              totalFrames: newTotal,
              violationFrames: newViolations,
              accuracy
            };
          });

          // Report violations
          violations.forEach(violation => {
            onViolation(violation);
          });
        }
      }
    } catch (error) {
      console.error('Error processing pose results:', error);
    }
  };

  const startCamera = async () => {
    if (!videoRef.current) {
      setError('Video element not available');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      console.log('Initializing pose analyzer...');
      poseAnalyzerRef.current = new PoseDetector(onResults);
      
      console.log('Starting camera...');
      await poseAnalyzerRef.current.startCamera(videoRef.current);
      
      setIsStreaming(true);
      setError('');
      console.log('Camera started successfully!');
    } catch (error) {
      console.error('Camera error:', error);
      setError(error.message || 'Failed to start camera. Please check permissions.');
      
      if (poseAnalyzerRef.current) {
        poseAnalyzerRef.current.close();
        poseAnalyzerRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    try {
      if (poseAnalyzerRef.current) {
        poseAnalyzerRef.current.close();
        poseAnalyzerRef.current = null;
      }
      
      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      setIsStreaming(false);
      setIsPaused(false);
      setPoseResults(null);
      setCurrentViolations([]);
      setError('');
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  const endSession = () => {
    const analysis = {
      mode: currentMode,
      stats: sessionStats,
      duration: Math.floor(sessionStats.totalFrames / 10), // Assuming ~10 FPS
      violations: currentViolations.length
    };
    
    onAnalysisComplete(analysis);
    
    // Reset stats
    setSessionStats({
      totalFrames: 0,
      violationFrames: 0,
      accuracy: 100
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (poseAnalyzerRef.current) {
        poseAnalyzerRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Live Posture Analysis
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={currentMode}
            onChange={(e) => setCurrentMode(e.target.value as 'desk' | 'squat')}
            disabled={isStreaming}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="desk">Desk Posture</option>
            <option value="squat">Squat Form</option>
          </select>
          
          {!isStreaming ? (
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Camera size={20} />
              <span>{isLoading ? 'Starting...' : 'Start Camera'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isPaused 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              
              <button
                onClick={stopCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <CameraOff size={16} />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span className="font-medium">Camera Error:</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <p className="mt-2 text-sm">
            Please ensure you've granted camera permissions and try again.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Display */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isStreaming ? 'transform scale-x-[-1]' : ''}`}
              style={{ display: isStreaming ? 'block' : 'none' }}
            />
            
            {isStreaming && (
              <>
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
                <PoseOverlay 
                  violations={currentViolations}
                  mode={currentMode}
                  poseResults={poseResults}
                />
                {isPaused && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-xl font-semibold">Analysis Paused</div>
                  </div>
                )}
              </>
            )}
            
            {!isStreaming && !isLoading && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Camera size={48} className="mx-auto mb-4" />
                  <p className="text-lg">Click "Start Camera" to begin analysis</p>
                  <p className="text-sm mt-2">Make sure to allow camera permissions</p>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Session Stats */}
          {isStreaming && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className={`${isDark ? 'bg-blue-900/50' : 'bg-blue-50'} rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold text-blue-600">{sessionStats.totalFrames}</div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Frames Analyzed</div>
              </div>
              <div className={`${isDark ? 'bg-red-900/50' : 'bg-red-50'} rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold text-red-600">{sessionStats.violationFrames}</div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Violations</div>
              </div>
              <div className={`${isDark ? 'bg-green-900/50' : 'bg-green-50'} rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold text-green-600">{sessionStats.accuracy}%</div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Accuracy</div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <RealTimeFeedback violations={currentViolations} />
          <PostureRules mode={currentMode} />
          
          {isStreaming && (
            <button
              onClick={endSession}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Target size={20} />
              <span>End Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoseAnalyzer;