import React from 'react';
import { TrendingUp, AlertTriangle, Clock, Target, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  violations: any[];
  analysisHistory: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ violations, analysisHistory }) => {
  const { isDark } = useTheme();

  const todayViolations = violations.filter(v => {
    const today = new Date();
    const violationDate = new Date(v.timestamp);
    return violationDate.toDateString() === today.toDateString();
  });

  const getViolationsByType = () => {
    const typeCount: Record<string, number> = {};
    violations.forEach(v => {
      typeCount[v.type] = (typeCount[v.type] || 0) + 1;
    });
    return typeCount;
  };

  const violationsByType = getViolationsByType();

  const getRecentSessions = () => {
    return analysisHistory.slice(-5).reverse();
  };

  const averageAccuracy = analysisHistory.length > 0 
    ? Math.round(analysisHistory.reduce((acc, session) => acc + session.stats.accuracy, 0) / analysisHistory.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>
          Dashboard Overview
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analysisHistory.length}</div>
                <div className="text-sm opacity-90">Total Sessions</div>
              </div>
              <Target size={24} className="opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{violations.length}</div>
                <div className="text-sm opacity-90">Total Violations</div>
              </div>
              <AlertTriangle size={24} className="opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{averageAccuracy}%</div>
                <div className="text-sm opacity-90">Avg Accuracy</div>
              </div>
              <TrendingUp size={24} className="opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{todayViolations.length}</div>
                <div className="text-sm opacity-90">Today's Violations</div>
              </div>
              <Calendar size={24} className="opacity-80" />
            </div>
          </div>
        </div>
        
        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Violation Types */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
              Violation Types
            </h3>
            <div className="space-y-3">
              {Object.entries(violationsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'neck_angle' ? 'bg-red-500' :
                      type === 'back_slouch' ? 'bg-orange-500' :
                      type === 'knee_over_toe' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className={`text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Sessions */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {getRecentSessions().map((session, index) => (
                <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-gray-600' : 'bg-white'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      session.stats.accuracy > 90 ? 'bg-green-500' :
                      session.stats.accuracy > 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {session.mode === 'desk' ? 'Desk Session' : 'Squat Session'}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {session.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {session.stats.accuracy}%
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.duration}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Violations */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
          Recent Violations
        </h3>
        <div className="space-y-3">
          {violations.slice(-10).reverse().map((violation, index) => (
            <div key={violation.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <AlertTriangle size={16} className={`mt-0.5 ${
                violation.severity === 'error' ? 'text-red-600' : 'text-orange-600'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {violation.message}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {violation.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {violation.rule}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;