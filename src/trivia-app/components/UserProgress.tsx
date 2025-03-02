import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaTrophy, FaFire, FaCalendarCheck, FaChartLine, FaBasketballBall, FaFutbol } from 'react-icons/fa';
import { useUserPreferences } from '../../lib/contexts/UserPreferencesContext';
import { UserProgress as UserProgressType } from '../../lib/contexts/UserPreferencesContext';

interface UserProgressProps {
  darkMode: boolean;
  sport?: 'basketball' | 'soccer';
}

const UserProgress: React.FC<UserProgressProps> = ({ darkMode, sport }) => {
  const { preferences, resetDailyGoal, getProgressForSport } = useUserPreferences();
  const [currentSport, setCurrentSport] = useState<'basketball' | 'soccer'>(sport || 'basketball');
  const [progressData, setProgressData] = useState<UserProgressType | null>(null);

  // Check if we need to reset daily goals (new day)
  useEffect(() => {
    if (preferences) {
      resetDailyGoal();
    }
  }, [preferences, resetDailyGoal]);

  // Update progress data when sport changes
  useEffect(() => {
    if (preferences) {
      const sportToUse = sport || preferences.preferredSport || 'basketball';
      setCurrentSport(sportToUse);
      setProgressData(getProgressForSport(sportToUse));
    }
  }, [preferences, sport, getProgressForSport]);

  // Handle sport change
  const handleSportChange = (newSport: 'basketball' | 'soccer') => {
    setCurrentSport(newSport);
    if (preferences) {
      setProgressData(getProgressForSport(newSport));
    }
  };

  if (!preferences || !progressData) {
    return (
      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-orange-100'} animate-pulse`}>
        <div className="h-24 rounded-md bg-gray-300 dark:bg-gray-700"></div>
      </div>
    );
  }

  const xpPercentage = Math.min(100, Math.floor((progressData.xp / progressData.xpToNextLevel) * 100));
  const dailyGoalPercentage = Math.min(100, Math.floor((progressData.dailyGoalProgress / progressData.dailyGoalTarget) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg p-6 shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <FaChartLine className="mr-2 text-orange-500" /> Your Progress
        </h3>
        <div className="flex items-center">
          <FaFire className={`mr-1 ${progressData.streakDays > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className="font-bold">{progressData.streakDays} day streak</span>
        </div>
      </div>

      {/* Sport selector tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handleSportChange('basketball')}
          className={`px-3 py-1 rounded-full text-sm flex items-center ${
            currentSport === 'basketball'
              ? 'bg-orange-500 text-white'
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaBasketballBall className="mr-1" /> Basketball
        </button>
        <button
          onClick={() => handleSportChange('soccer')}
          className={`px-3 py-1 rounded-full text-sm flex items-center ${
            currentSport === 'soccer'
              ? 'bg-green-500 text-white'
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaFutbol className="mr-1" /> Soccer
        </button>
      </div>

      {/* Level and XP */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                currentSport === 'basketball'
                  ? darkMode ? 'bg-orange-600' : 'bg-orange-500'
                  : darkMode ? 'bg-green-600' : 'bg-green-500'
              } text-white font-bold`}
            >
              {progressData.level}
            </motion.div>
            <div>
              <h4 className="font-bold">Level {progressData.level}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {progressData.xp} / {progressData.xpToNextLevel} XP
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center"
          >
            <FaStar className={`mr-1 ${currentSport === 'basketball' ? 'text-yellow-500' : 'text-yellow-400'}`} />
            <span className="font-bold">{progressData.xp} XP</span>
          </motion.div>
        </div>

        {/* XP Progress Bar */}
        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full bg-gradient-to-r ${
              currentSport === 'basketball'
                ? 'from-orange-500 to-orange-400'
                : 'from-green-500 to-green-400'
            }`}
          ></motion.div>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <FaCalendarCheck className={`mr-2 ${progressData.dailyGoalCompleted ? 'text-green-500' : 'text-gray-400'}`} />
            <h4 className="font-bold">Daily Goal</h4>
          </div>
          <span className={`text-sm font-medium ${progressData.dailyGoalCompleted ? 'text-green-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {progressData.dailyGoalProgress} / {progressData.dailyGoalTarget} quizzes
            {progressData.dailyGoalCompleted && ' ✓'}
          </span>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dailyGoalPercentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${
              progressData.dailyGoalCompleted
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : `bg-gradient-to-r ${
                    currentSport === 'basketball'
                      ? 'from-blue-500 to-blue-400'
                      : 'from-blue-400 to-blue-300'
                  }`
            }`}
          ></motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className={`p-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-700' 
            : currentSport === 'basketball' ? 'bg-orange-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center mb-1">
            <FaTrophy className={`mr-2 ${
              currentSport === 'basketball' ? 'text-orange-500' : 'text-green-500'
            }`} />
            <span className="font-medium">Quizzes Completed</span>
          </div>
          <p className="text-xl font-bold">{progressData.quizzesCompleted}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-700' 
            : currentSport === 'basketball' ? 'bg-orange-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center mb-1">
            <FaFire className={`mr-2 ${
              currentSport === 'basketball' ? 'text-orange-500' : 'text-green-500'
            }`} />
            <span className="font-medium">Best Streak</span>
          </div>
          <p className="text-xl font-bold">{progressData.streakDays} days</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProgress; 