import React from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaUnlock, FaBasketballBall, FaFutbol, FaTrophy } from 'react-icons/fa';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  sport: 'basketball' | 'soccer' | 'general';
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  darkMode?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showDetails = false,
  darkMode = false,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  // Animation variants
  const variants = {
    unlocked: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 }
    },
    locked: {
      scale: 1,
      opacity: 0.5,
    }
  };

  // Get badge colors based on sport and unlock status
  const getBadgeColors = () => {
    if (!achievement.unlocked) {
      return darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500';
    }
    
    switch (achievement.sport) {
      case 'basketball':
        return darkMode ? 'bg-orange-700 text-white' : 'bg-orange-500 text-white';
      case 'soccer':
        return darkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white';
      case 'general':
      default:
        return darkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white';
    }
  };

  // Get sport icon
  const getSportIcon = () => {
    switch (achievement.sport) {
      case 'basketball':
        return <FaBasketballBall className="text-xs opacity-70" />;
      case 'soccer':
        return <FaFutbol className="text-xs opacity-70" />;
      case 'general':
      default:
        return <FaTrophy className="text-xs opacity-70" />;
    }
  };

  // Get sport badge color
  const getSportBadgeColor = () => {
    switch (achievement.sport) {
      case 'basketball':
        return darkMode ? 'bg-orange-800' : 'bg-orange-100';
      case 'soccer':
        return darkMode ? 'bg-green-800' : 'bg-green-100';
      case 'general':
      default:
        return darkMode ? 'bg-blue-800' : 'bg-blue-100';
    }
  };

  // Get sport tag colors
  const getSportTagColors = () => {
    switch (achievement.sport) {
      case 'basketball':
        return darkMode ? 'bg-orange-900 text-orange-200 border border-orange-700' : 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'soccer':
        return darkMode ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200';
      case 'general':
      default:
        return darkMode ? 'bg-blue-900 text-blue-200 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  // Get sport name with proper capitalization
  const getSportName = () => {
    switch (achievement.sport) {
      case 'basketball':
        return 'Basketball';
      case 'soccer':
        return 'Soccer';
      case 'general':
        return 'General';
      default:
        // Handle any other sport type that might be added in the future
        const sport = achievement.sport as string;
        return sport.charAt(0).toUpperCase() + sport.slice(1);
    }
  };

  return (
    <div className={`flex ${showDetails ? 'flex-col' : ''} items-center group`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${getBadgeColors()} relative shadow-md`}
        variants={variants}
        animate={achievement.unlocked ? 'unlocked' : 'locked'}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <span role="img" aria-label={achievement.title} className="text-3xl">
          {achievement.icon}
        </span>
        
        {/* Lock/Unlock indicator */}
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
          {achievement.unlocked ? (
            <FaUnlock className="text-green-500 text-xs" />
          ) : (
            <FaLock className="text-gray-500 text-xs" />
          )}
        </div>
        
        {/* Sport indicator */}
        <div className={`absolute -top-1 -right-1 ${getSportBadgeColor()} rounded-full p-1 shadow-md`}>
          {getSportIcon()}
        </div>
      </motion.div>
      
      {showDetails && (
        <div className={`mt-2 text-center ${darkMode ? 'text-white' : 'text-gray-800'} w-full`}>
          <h3 className="font-bold text-sm">{achievement.title}</h3>
          <p className="text-xs opacity-75 mt-1">{achievement.description}</p>
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs mt-1 opacity-50">
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
          <div className={`mt-1 text-xs inline-flex items-center px-2 py-0.5 rounded-full ${getSportTagColors()}`}>
            {getSportIcon()}
            <span className="ml-1 font-medium">{getSportName()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;