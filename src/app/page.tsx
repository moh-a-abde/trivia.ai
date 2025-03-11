'use client';

import { useState, useEffect } from 'react';
import Home from '../trivia-app/components/Home';
import Quiz from '../trivia-app/components/Quiz';
import { useTheme } from '../lib/contexts/ThemeContext';
import { useUserPreferences } from '../lib/contexts/UserPreferencesContext';
import { useAuthIntegration } from '@/lib/hooks/useAuthIntegration';
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState<'basketball' | 'soccer'>('basketball');
  const { darkMode, setDarkMode } = useTheme();
  const { preferences } = useUserPreferences();
  const { isAuthenticated, user, signInWithGoogle, signOut } = useAuthIntegration();

  // Use the user's preferred sport from preferences if available
  useEffect(() => {
    if (preferences?.preferredSport) {
      setSelectedSport(preferences.preferredSport);
    }
  }, [preferences]);

  const resetQuiz = () => {
    setQuizStarted(false);
  }

  const handleSportChange = (sport: 'basketball' | 'soccer') => {
    setSelectedSport(sport);
  }

  const handleStartQuiz = () => {
    setIsLoading(true);
    // Simulate loading time for a smooth transition
    setTimeout(() => {
      setQuizStarted(true);
      setIsLoading(false);
    }, 1200);
  };

  // Get theme colors based on selected sport
  const getThemeColors = () => {
    return selectedSport === 'basketball' 
      ? 'bg-gradient-to-br from-orange-50 to-orange-100/50'
      : 'bg-gradient-to-br from-green-50 to-green-100/50';
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : getThemeColors()} p-0 m-0`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="relative w-20 h-20 mb-4">
                <div className={`absolute inset-0 rounded-full border-4 ${selectedSport === 'basketball' ? 'border-orange-300' : 'border-green-300'} opacity-30`}></div>
                <div className={`absolute inset-0 rounded-full border-t-4 border-r-4 ${selectedSport === 'basketball' ? 'border-orange-500' : 'border-green-500'} animate-spin`}></div>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Preparing Your Quiz
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading challenging {selectedSport} questions...
              </p>
            </motion.div>
          </motion.div>
        ) : quizStarted ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Quiz 
              onRestart={resetQuiz} 
              darkMode={darkMode} 
              sport={selectedSport}
            />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Home 
              onStart={handleStartQuiz} 
              darkMode={darkMode}
              onDarkModeChange={setDarkMode}
              selectedSport={selectedSport}
              onSportChange={handleSportChange}
              isAuthenticated={isAuthenticated}
              user={user}
              signInWithGoogle={signInWithGoogle as () => Promise<void>}
              signOut={signOut}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
