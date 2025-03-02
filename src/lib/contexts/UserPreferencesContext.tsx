'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addDocument, getDocuments, updateDocument } from '../firebase/firebaseUtils';
import { useAchievementsContext } from './AchievementsContext';

// Define the categories for trivia questions
export const TRIVIA_CATEGORIES = [
  { id: 'players', name: 'Players' },
  { id: 'teams', name: 'Teams' },
  { id: 'history', name: 'NBA History' },
  { id: 'stats', name: 'Statistics' },
  { id: 'championships', name: 'Championships' },
  { id: 'draft', name: 'Draft' },
  { id: 'records', name: 'Records' },
  { id: 'current_events', name: 'Current Events' },
];

// Define the available sports
export const SPORTS = [
  { id: 'basketball', name: 'Basketball' },
  { id: 'soccer', name: 'Soccer' },
];

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  dailyGoalCompleted: boolean;
  dailyGoalProgress: number;
  dailyGoalTarget: number;
  lastQuizDate: string | null;
  quizzesCompleted: number;
  streakDays: number;
  lastStreakDate: string | null;
}

export interface SportSpecificProgress {
  basketball: UserProgress;
  soccer: UserProgress;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  categories: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionHistory: {
    questionId: string;
    correct: boolean;
    timestamp: number;
    sport: 'basketball' | 'soccer';
  }[];
  progress: SportSpecificProgress;
  preferredSport: 'basketball' | 'soccer';
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  updateCategories: (categories: string[]) => Promise<void>;
  updateDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  addQuestionToHistory: (questionId: string, correct: boolean, sport: 'basketball' | 'soccer') => Promise<void>;
  updatePreferredSport: (sport: 'basketball' | 'soccer') => Promise<void>;
  getProgressForSport: (sport: 'basketball' | 'soccer') => UserProgress | null;
  addXP: (amount: number, sport?: 'basketball' | 'soccer') => Promise<void>;
  completeDailyGoal: (sport?: 'basketball' | 'soccer') => Promise<void>;
  resetDailyGoal: () => Promise<void>;
  incrementQuizzesCompleted: (sport?: 'basketball' | 'soccer') => Promise<void>;
  updateStreak: (sport?: 'basketball' | 'soccer') => Promise<void>;
}

const defaultProgress: UserProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  dailyGoalCompleted: false,
  dailyGoalProgress: 0,
  dailyGoalTarget: 3,
  lastQuizDate: null,
  quizzesCompleted: 0,
  streakDays: 0,
  lastStreakDate: null,
};

const defaultPreferences: UserPreferences = {
  userId: '',
  categories: ['players', 'teams'],
  difficulty: 'medium',
  questionHistory: [],
  progress: {
    basketball: defaultProgress,
    soccer: defaultProgress,
  },
  preferredSport: 'basketball',
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { unlockAchievement } = useAchievementsContext();

  // Load user preferences from Firestore
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setPreferences(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const docs = await getDocuments('userPreferences');
        const userPrefs = docs.find((doc: any) => doc.userId === user.uid);

        if (userPrefs) {
          setPreferences(userPrefs as UserPreferences);
        } else {
          // Create new preferences for the user
          const newPrefs = {
            ...defaultPreferences,
            userId: user.uid,
          };
          const docRef = await addDocument('userPreferences', newPrefs);
          setPreferences({ ...newPrefs, id: docRef.id });
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Update categories
  const updateCategories = async (categories: string[]) => {
    if (!preferences || !preferences.id) return;

    try {
      await updateDocument('userPreferences', preferences.id, { categories });
      setPreferences({ ...preferences, categories });
    } catch (error) {
      console.error('Error updating categories:', error);
    }
  };

  // Update difficulty
  const updateDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!preferences || !preferences.id) return;

    try {
      await updateDocument('userPreferences', preferences.id, { difficulty });
      setPreferences({ ...preferences, difficulty });
    } catch (error) {
      console.error('Error updating difficulty:', error);
    }
  };

  // Add question to history
  const addQuestionToHistory = async (questionId: string, correct: boolean, sport: 'basketball' | 'soccer') => {
    if (!preferences || !preferences.id) return;

    const newEntry = {
      questionId,
      correct,
      timestamp: Date.now(),
      sport,
    };

    const updatedHistory = [...preferences.questionHistory, newEntry];
    
    try {
      await updateDocument('userPreferences', preferences.id, { 
        questionHistory: updatedHistory 
      });
      setPreferences({ 
        ...preferences, 
        questionHistory: updatedHistory 
      });
    } catch (error) {
      console.error('Error updating question history:', error);
    }
  };

  // Add XP and handle level ups
  const addXP = async (amount: number, sport: 'basketball' | 'soccer' = 'basketball') => {
    if (!preferences || !preferences.id) return;

    const sportProgress = preferences.progress[sport];
    let newXP = sportProgress.xp + amount;
    let newLevel = sportProgress.level;
    let newXpToNextLevel = sportProgress.xpToNextLevel;

    // Check for level up
    while (newXP >= newXpToNextLevel) {
      newXP -= newXpToNextLevel;
      newLevel++;
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5); // Increase XP required for next level
    }

    const updatedSportProgress = {
      ...sportProgress,
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
    };

    // Create updated progress with the specific sport progress updated
    const updatedProgress = {
      ...preferences.progress,
      [sport]: updatedSportProgress
    };

    try {
      await updateDocument('userPreferences', preferences.id, { progress: updatedProgress });
      setPreferences({ ...preferences, progress: updatedProgress });

      // Check for level-based achievements
      if (newLevel >= 5) {
        unlockAchievement('reach_level_5');
      }
      if (newLevel >= 10) {
        unlockAchievement('reach_level_10');
      }
      if (newLevel >= 25) {
        unlockAchievement('reach_level_25');
      }
    } catch (error) {
      console.error('Error updating XP:', error);
    }
  };

  // Complete daily goal
  const completeDailyGoal = async (sport: 'basketball' | 'soccer' = 'basketball') => {
    if (!preferences || !preferences.id) return;

    const sportProgress = preferences.progress[sport];
    const today = new Date().toISOString().split('T')[0];
    let newStreakDays = sportProgress.streakDays;
    
    // Check if this is a new day compared to the last streak date
    if (sportProgress.lastStreakDate !== today) {
      if (sportProgress.lastStreakDate) {
        const lastDate = new Date(sportProgress.lastStreakDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If the last streak date was yesterday, increment the streak
        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          newStreakDays++;
        } else {
          // If the last streak date was not yesterday, reset the streak
          newStreakDays = 1;
        }
      } else {
        // First time completing a daily goal
        newStreakDays = 1;
      }
    }

    const updatedSportProgress = {
      ...sportProgress,
      dailyGoalCompleted: true,
      dailyGoalProgress: sportProgress.dailyGoalTarget,
      lastStreakDate: today,
      streakDays: newStreakDays,
    };

    // Create updated progress with the specific sport progress updated
    const updatedProgress = {
      ...preferences.progress,
      [sport]: updatedSportProgress
    };

    try {
      await updateDocument('userPreferences', preferences.id, { progress: updatedProgress });
      setPreferences({ ...preferences, progress: updatedProgress });

      // Check for streak-based achievements
      if (newStreakDays >= 3) {
        unlockAchievement('streak_3_days');
      }
      if (newStreakDays >= 7) {
        unlockAchievement('streak_7_days');
      }
      if (newStreakDays >= 30) {
        unlockAchievement('streak_30_days');
      }
    } catch (error) {
      console.error('Error completing daily goal:', error);
    }
  };

  // Update daily goal progress
  const updateDailyGoalProgress = async (progress: number, sport: 'basketball' | 'soccer' = 'basketball') => {
    if (!preferences || !preferences.id) return;

    const sportProgress = preferences.progress[sport];
    const newProgress = Math.min(progress, sportProgress.dailyGoalTarget);
    const dailyGoalCompleted = newProgress >= sportProgress.dailyGoalTarget;

    const updatedSportProgress = {
      ...sportProgress,
      dailyGoalProgress: newProgress,
      dailyGoalCompleted,
    };

    // Create updated progress with the specific sport progress updated
    const updatedProgress = {
      ...preferences.progress,
      [sport]: updatedSportProgress
    };

    try {
      await updateDocument('userPreferences', preferences.id, { progress: updatedProgress });
      setPreferences({ ...preferences, progress: updatedProgress });

      if (dailyGoalCompleted) {
        completeDailyGoal(sport);
      }
    } catch (error) {
      console.error('Error updating daily goal progress:', error);
    }
  };

  // Increment quizzes completed
  const incrementQuizzesCompleted = async (sport: 'basketball' | 'soccer' = 'basketball') => {
    if (!preferences || !preferences.id) return;

    const sportProgress = preferences.progress[sport];
    const updatedSportProgress = {
      ...sportProgress,
      quizzesCompleted: sportProgress.quizzesCompleted + 1,
    };

    // Create updated progress with the specific sport progress updated
    const updatedProgress = {
      ...preferences.progress,
      [sport]: updatedSportProgress
    };

    try {
      await updateDocument('userPreferences', preferences.id, { progress: updatedProgress });
      setPreferences({ ...preferences, progress: updatedProgress });

      // Update daily goal progress
      updateDailyGoalProgress(sportProgress.dailyGoalProgress + 1, sport);
    } catch (error) {
      console.error('Error incrementing quizzes completed:', error);
    }
  };

  // Update streak
  const updateStreak = async (sport: 'basketball' | 'soccer' = 'basketball') => {
    if (!preferences || !preferences.id) return;

    const today = new Date().toISOString().split('T')[0];
    const sportProgress = preferences.progress[sport];
    const lastDate = sportProgress.lastStreakDate;
    
    let newStreakDays = sportProgress.streakDays;
    
    // If this is the first quiz or it's a new day
    if (!lastDate || lastDate !== today) {
      // Check if the last quiz was yesterday
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === yesterdayStr) {
          // Continuing the streak
          newStreakDays += 1;
        } else {
          // Streak broken, start a new one
          newStreakDays = 1;
        }
      } else {
        // First quiz ever, start streak at 1
        newStreakDays = 1;
      }
      
      const updatedSportProgress = {
        ...sportProgress,
        streakDays: newStreakDays,
        lastStreakDate: today,
      };

      // Create updated progress with the specific sport progress updated
      const updatedProgress = {
        ...preferences.progress,
        [sport]: updatedSportProgress
      };
      
      try {
        await updateDocument('userPreferences', preferences.id, { progress: updatedProgress });
        setPreferences({ ...preferences, progress: updatedProgress });
        
        // Check for streak achievements
        if (newStreakDays >= 3) {
          unlockAchievement('streak_3_days');
        }
        if (newStreakDays >= 7) {
          unlockAchievement('streak_7_days');
        }
        if (newStreakDays >= 30) {
          unlockAchievement('streak_30_days');
        }
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    }
  };

  // Update preferred sport
  const updatePreferredSport = async (sport: 'basketball' | 'soccer') => {
    if (!preferences || !user) return;

    try {
      // Update the preferred sport in the preferences
      const updatedPreferences = {
        ...preferences,
        preferredSport: sport,
      };

      // Update the document in Firestore
      if (preferences.id) {
        await updateDocument('userPreferences', preferences.id, {
          preferredSport: sport,
        });
      }

      // Update the local state
      setPreferences(updatedPreferences);
      
      console.log(`Preferred sport updated to ${sport}`);
      
      // The UI colors will update automatically based on this preference
      // since the components observe this value through the context
    } catch (error) {
      console.error('Error updating preferred sport:', error);
    }
  };

  // Get progress for a specific sport
  const getProgressForSport = (sport: 'basketball' | 'soccer'): UserProgress | null => {
    if (!preferences || !preferences.progress) return null;
    return preferences.progress[sport];
  };

  // Reset daily goal (called at the start of a new day)
  const resetDailyGoal = async () => {
    if (!preferences || !preferences.id) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedProgress = { ...preferences.progress };
    
    // Reset daily goals for both sports
    Object.keys(updatedProgress).forEach(sportKey => {
      const sport = sportKey as 'basketball' | 'soccer';
      const sportProgress = updatedProgress[sport];
      
      if (sportProgress.lastQuizDate !== today) {
        updatedProgress[sport] = {
          ...sportProgress,
          dailyGoalProgress: 0,
          dailyGoalCompleted: false,
          lastQuizDate: today,
        };
      }
    });

    try {
      await updateDocument('userPreferences', preferences.id, { progress: updatedProgress });
      setPreferences({ ...preferences, progress: updatedProgress });
    } catch (error) {
      console.error('Error resetting daily goal:', error);
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        updateCategories,
        updateDifficulty,
        addQuestionToHistory,
        updatePreferredSport,
        getProgressForSport,
        addXP,
        completeDailyGoal,
        resetDailyGoal,
        incrementQuizzesCompleted,
        updateStreak,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}

export default UserPreferencesContext; 