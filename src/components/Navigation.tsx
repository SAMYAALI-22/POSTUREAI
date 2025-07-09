import React from 'react';
import { Camera, Upload, BarChart3, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { isDark } = useTheme();
  
  const tabs = [
    { id: 'live', label: 'Live Analysis', icon: Camera },
    { id: 'upload', label: 'Upload Video', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <nav className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-1`}>
      <div className="flex space-x-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 flex-1 justify-center ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow-md'
                : isDark
                  ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;