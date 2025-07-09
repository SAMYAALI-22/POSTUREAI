import React from 'react';
import { Activity, Settings, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="text-blue-600" size={24} />
              <span className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                PosturAI
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              <Settings size={20} />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;