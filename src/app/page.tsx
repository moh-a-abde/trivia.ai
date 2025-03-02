'use client';

import { useState, useEffect } from 'react';
import Home from '../trivia-app/components/Home';
import Quiz from '../trivia-app/components/Quiz';
import { useTheme } from '../lib/contexts/ThemeContext';
import { useUserPreferences } from '../lib/contexts/UserPreferencesContext';
import { useAuthIntegration } from '@/lib/hooks/useAuthIntegration';

export default function Page() {
  const [quizStarted, setQuizStarted] = useState(false);
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

  // Get theme colors based on selected sport
  const getThemeColors = () => {
    return selectedSport === 'basketball' 
      ? 'bg-orange-50'
      : 'bg-green-50';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : getThemeColors()} p-0 m-0`}>
      {!quizStarted ? (
        <Home 
          onStart={() => setQuizStarted(true)} 
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
          selectedSport={selectedSport}
          onSportChange={handleSportChange}
          isAuthenticated={isAuthenticated}
          user={user}
          signInWithGoogle={signInWithGoogle as () => Promise<void>}
          signOut={signOut}
        />
      ) : (
        <Quiz 
          onRestart={resetQuiz} 
          darkMode={darkMode} 
          sport={selectedSport}
        />
      )}
    </div>
  );
}
