import React, { useState, useRef } from 'react';
import { Upload, Play, Pause, RotateCcw, FileVideo, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface VideoUploadProps {
  onViolation: (violation: any) => void;
  onAnalysisComplete: (analysis: any) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onViolation, onAnalysisComplete }) => {
  const { isDark } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMode, setAnalysisMode] = useState<'desk' | 'squat'>('desk');
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setResults(null);
      
      // Create object URL for video preview
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    } else {
      alert('Please select a valid video file');
    }
  };

  const startAnalysis = () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          
          // Simulate analysis results
          const mockResults = {
            duration: 45,
            totalFrames: 1350,
            violations: [
              {
                timestamp: '0:05',
                type: 'neck_angle',
                severity: 'warning',
                message: 'Neck angle exceeded 30°'
              },
              {
                timestamp: '0:23',
                type: 'back_slouch',
                severity: 'error',
                message: 'Significant slouching detected'
              },
              {
                timestamp: '0:38',
                type: 'neck_angle',
                severity: 'warning',
                message: 'Forward head posture'
              }
            ],
            accuracy: 87,
            recommendations: [
              'Adjust monitor height to eye level',
              'Use a lumbar support cushion',
              'Take breaks every 20 minutes'
            ]
          };
          
          setResults(mockResults);
          onAnalysisComplete(mockResults);
          
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setResults(null);
    setAnalysisProgress(0);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>
        Video Analysis
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Upload Video
            </h3>
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value as 'desk' | 'squat')}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="desk">Desk Posture</option>
              <option value="squat">Squat Form</option>
            </select>
          </div>
          
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDark 
                  ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <Upload size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Click to upload video
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Supports MP4, MOV, AVI files up to 100MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <div className="flex items-center space-x-3">
                  <FileVideo size={24} className="text-blue-600" />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {selectedFile.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play size={16} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Start Analysis'}</span>
                </button>
                
                <button
                  onClick={resetAnalysis}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className={`flex justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Analyzing video...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Video Preview */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Preview
          </h3>
          <div className="bg-gray-900 rounded-lg aspect-video overflow-hidden">
            {selectedFile ? (
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FileVideo size={48} className="mx-auto mb-4" />
                  <p>No video selected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {results && (
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
            Analysis Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`${isDark ? 'bg-gray-600' : 'bg-white'} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold text-blue-600">{results.duration}s</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Duration</div>
            </div>
            <div className={`${isDark ? 'bg-gray-600' : 'bg-white'} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold text-red-600">{results.violations.length}</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Violations</div>
            </div>
            <div className={`${isDark ? 'bg-gray-600' : 'bg-white'} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold text-green-600">{results.accuracy}%</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Accuracy</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                Detected Violations
              </h4>
              <div className="space-y-2">
                {results.violations.map((violation: any, index: number) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                    <div>
                      <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {violation.timestamp}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {violation.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                Recommendations
              </h4>
              <div className="space-y-2">
                {results.recommendations.map((rec: string, index: number) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isDark ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {rec}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;