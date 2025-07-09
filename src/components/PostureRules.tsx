import React from 'react';
import { Target, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface PostureRulesProps {
  mode: 'desk' | 'squat';
}

const PostureRules: React.FC<PostureRulesProps> = ({ mode }) => {
  const { isDark } = useTheme();

  const deskRules = [
    {
      title: 'Neck Alignment',
      description: 'Keep your neck angle < 30°',
      icon: <Target size={16} className="text-blue-600" />,
      status: 'neutral'
    },
    {
      title: 'Back Straightness',
      description: 'Maintain straight back posture',
      icon: <Target size={16} className="text-blue-600" />,
      status: 'neutral'
    },
    {
      title: 'Shoulder Position',
      description: 'Keep shoulders relaxed and aligned',
      icon: <Target size={16} className="text-blue-600" />,
      status: 'neutral'
    }
  ];

  const squatRules = [
    {
      title: 'Knee Tracking',
      description: 'Knees should not go past toes',
      icon: <Target size={16} className="text-blue-600" />,
      status: 'neutral'
    },
    {
      title: 'Back Angle',
      description: 'Maintain back angle > 150°',
      icon: <Target size={16} className="text-blue-600" />,
      status: 'neutral'
    },
    {
      title: 'Hip Depth',
      description: 'Descend until hips are below knees',
      icon: <Target size={16} className="text-blue-600" />,
      status: 'neutral'
    }
  ];

  const rules = mode === 'desk' ? deskRules : squatRules;

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
        {mode === 'desk' ? 'Desk Posture Rules' : 'Squat Form Rules'}
      </h3>
      
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            {rule.icon}
            <div className="flex-1">
              <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {rule.title}
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {rule.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
        <div className="flex items-start space-x-2">
          <AlertCircle size={16} className="text-blue-600 mt-0.5" />
          <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            <strong>Pro Tip:</strong> {mode === 'desk' 
              ? 'Take breaks every 30 minutes and adjust your monitor height.'
              : 'Focus on controlled movement and proper breathing during squats.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostureRules;