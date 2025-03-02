'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import useAchievements, { Achievement } from '../hooks/useAchievements';
import AchievementNotification from '../../trivia-app/components/AchievementNotification';
import { useTheme } from './ThemeContext';

interface AchievementsContextType {
  achievements: Achievement[];
  loading: boolean;
  unlockAchievement: (id: string) => void;
  hasAchievement: (id: string) => boolean;
  getRecentAchievements: (count?: number) => Achievement[];
  getSportAchievements: (sport: 'basketball' | 'soccer' | 'general') => Achievement[];
  resetAchievements: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const { 
    achievements, 
    unlockAchievement: unlock, 
    hasAchievement, 
    getRecentAchievements, 
    getSportAchievements,
    resetAchievements,
    loading
  } = useAchievements();
  
  const [notification, setNotification] = useState<Achievement | null>(null);
  const { darkMode } = useTheme();

  // Override the unlock function to show a notification
  const unlockAchievement = (id: string) => {
    // Check if already unlocked to avoid duplicate notifications
    if (!hasAchievement(id)) {
      unlock(id);
      
      // Find the achievement to display in the notification
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        setNotification({ ...achievement, unlocked: true });
      }
    }
  };

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        loading,
        unlockAchievement,
        hasAchievement,
        getRecentAchievements,
        getSportAchievements,
        resetAchievements,
      }}
    >
      {children}
      {notification && (
        <AchievementNotification
          achievement={notification}
          onClose={() => setNotification(null)}
          darkMode={darkMode}
        />
      )}
    </AchievementsContext.Provider>
  );
}

export function useAchievementsContext(): AchievementsContextType {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error('useAchievementsContext must be used within an AchievementsProvider');
  }
  return context;
}

export default AchievementsContext; 