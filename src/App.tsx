import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PoseAnalyzer from './components/PoseAnalyzer';
import VideoUpload from './components/VideoUpload';
import Analytics from './components/Analytics';
import Header from './components/Header';
import Navigation from './components/Navigation';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PoseViolation } from './utils/poseDetection';

interface Violation extends PoseViolation {
  id: number;
  timestamp: Date;
}

interface Analysis {
  id: number;
  date: Date;
  mode: string;
  stats: {
    accuracy: number;
  };
  duration: number;
}

function AppContent() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('live');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<Analysis[]>([]);

  const addViolation = (violation: PoseViolation) => {
    setViolations(prev => [...prev, { 
      ...violation, 
      id: Date.now(), 
      timestamp: new Date() 
    }]);
  };

  const addAnalysis = (analysis: any) => {
    setAnalysisHistory(prev => [...prev, { 
      ...analysis, 
      id: Date.now(), 
      date: new Date() 
    }]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <Brain className="text-blue-600" size={40} />
            PosturAI
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your AI-Powered Posture Buddy for Real-Time Form Correction
          </p>
        </div>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-8">
          {activeTab === 'live' && (
            <PoseAnalyzer 
              onViolation={addViolation}
              onAnalysisComplete={addAnalysis}
            />
          )}
          {activeTab === 'upload' && (
            <VideoUpload 
              onViolation={addViolation}
              onAnalysisComplete={addAnalysis}
            />
          )}
          {activeTab === 'dashboard' && (
            <Dashboard 
              violations={violations}
              analysisHistory={analysisHistory}
            />
          )}
          {activeTab === 'analytics' && (
            <Analytics 
              violations={violations}
              analysisHistory={analysisHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;