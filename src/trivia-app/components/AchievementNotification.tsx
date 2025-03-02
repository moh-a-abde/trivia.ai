import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../lib/hooks/useAchievements';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  darkMode?: boolean;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  darkMode = false,
}) => {
  // Auto-close the notification after 5 seconds
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`rounded-lg shadow-xl overflow-hidden max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 py-2 px-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold">Achievement Unlocked!</h3>
                <button 
                  onClick={onClose}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 flex items-center">
              <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mr-4 text-3xl">
                {achievement.icon}
              </div>
              
              <div>
                <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {achievement.title}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
              </div>
            </div>
            
            <motion.div 
              className="h-1 bg-orange-500" 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification; 