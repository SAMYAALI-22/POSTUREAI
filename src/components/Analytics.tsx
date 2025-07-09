import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsProps {
  violations: any[];
  analysisHistory: any[];
}

const Analytics: React.FC<AnalyticsProps> = ({ violations, analysisHistory }) => {
  const { isDark } = useTheme();

  const getWeeklyStats = () => {
    const weeklyData: Record<string, { violations: number; sessions: number }> = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      weeklyData[dateStr] = {
        violations: violations.filter(v => 
          new Date(v.timestamp).toDateString() === date.toDateString()
        ).length,
        sessions: analysisHistory.filter(s => 
          new Date(s.date).toDateString() === date.toDateString()
        ).length
      };
    }
    
    return weeklyData;
  };

  const weeklyStats = getWeeklyStats();

  const getHourlyPattern = () => {
    const hourlyData: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }
    
    violations.forEach(v => {
      const hour = new Date(v.timestamp).getHours();
      hourlyData[hour]++;
    });
    
    return hourlyData;
  };

  const hourlyPattern = getHourlyPattern();

  const getPostureScore = () => {
    if (analysisHistory.length === 0) return 0;
    const recentSessions = analysisHistory.slice(-10);
    return Math.round(recentSessions.reduce((acc, session) => acc + session.stats.accuracy, 0) / recentSessions.length);
  };

  const postureScore = getPostureScore();

  const getTrend = () => {
    if (analysisHistory.length < 2) return 0;
    const recent = analysisHistory.slice(-5);
    const older = analysisHistory.slice(-10, -5);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((acc, s) => acc + s.stats.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((acc, s) => acc + s.stats.accuracy, 0) / older.length;
    
    return Math.round(recentAvg - olderAvg);
  };

  const trend = getTrend();

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>
          Analytics & Insights
        </h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{postureScore}</div>
                <div className="text-sm opacity-90">Posture Score</div>
              </div>
              <BarChart3 size={32} className="opacity-80" />
            </div>
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp size={16} className="text-green-300 mr-1" />
              ) : trend < 0 ? (
                <TrendingDown size={16} className="text-red-300 mr-1" />
              ) : null}
              <span className="text-sm">
                {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : 'No change'} from last week
              </span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{analysisHistory.length}</div>
                <div className="text-sm opacity-90">Sessions Completed</div>
              </div>
              <Calendar size={32} className="opacity-80" />
            </div>
            <div className="text-sm mt-2">
              {analysisHistory.filter(s => {
                const today = new Date();
                const sessionDate = new Date(s.date);
                return sessionDate.toDateString() === today.toDateString();
              }).length} sessions today
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{violations.length}</div>
                <div className="text-sm opacity-90">Total Violations</div>
              </div>
              <PieChart size={32} className="opacity-80" />
            </div>
            <div className="text-sm mt-2">
              {violations.filter(v => {
                const today = new Date();
                const violationDate = new Date(v.timestamp);
                return violationDate.toDateString() === today.toDateString();
              }).length} violations today
            </div>
          </div>
        </div>
        
        {/* Weekly Progress Chart */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
            Weekly Progress
          </h3>
          <div className="space-y-4">
            {Object.entries(weeklyStats).map(([date, stats]) => (
              <div key={date} className="flex items-center space-x-4">
                <div className={`w-20 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {date}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className={`flex-1 rounded-full h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(stats.sessions * 20, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-sm w-16 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats.sessions} sessions
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className={`text-sm w-16 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats.violations} violations
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Hourly Activity Pattern */}
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
            Hourly Activity Pattern
          </h3>
          <div className="grid grid-cols-12 gap-1">
            {Object.entries(hourlyPattern).map(([hour, count]) => (
              <div key={hour} className="text-center">
                <div
                  className="bg-blue-600 rounded-sm mx-auto transition-all duration-300"
                  style={{
                    height: `${Math.max(count * 10, 4)}px`,
                    width: '16px'
                  }}
                ></div>
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hour}
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Peak violation hours: {Object.entries(hourlyPattern)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([hour]) => `${hour}:00`)
              .join(', ')}
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
          Personalized Recommendations
        </h3>
        <div className="space-y-4">
          <div className={`flex items-start space-x-3 p-4 rounded-lg ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Workspace Ergonomics
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Your neck angle violations peak at 2 PM. Consider adjusting your monitor height or taking a break.
              </div>
            </div>
          </div>
          
          <div className={`flex items-start space-x-3 p-4 rounded-lg ${
            isDark ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Exercise Form
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Your squat form has improved 15% this week. Focus on maintaining knee tracking for better results.
              </div>
            </div>
          </div>
          
          <div className={`flex items-start space-x-3 p-4 rounded-lg ${
            isDark ? 'bg-orange-900/30' : 'bg-orange-50'
          }`}>
            <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Break Schedule
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Consider setting reminders every 30 minutes to check your posture and take micro-breaks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;