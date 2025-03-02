import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getDocuments, addDocument, updateDocument } from '../firebase/firebaseUtils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  sport: 'basketball' | 'soccer' | 'general';
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  hasAchievement: (id: string) => boolean;
  getRecentAchievements: (count?: number) => Achievement[];
  getSportAchievements: (sport: 'basketball' | 'soccer' | 'general') => Achievement[];
  resetAchievements: () => void;
  loading: boolean;
}

// Interface for the achievement document stored in Firestore
interface AchievementDocument {
  id: string;
  userId: string;
  achievements: Achievement[];
}

export const defaultAchievements: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎮',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get all questions correct in a quiz',
    icon: '💯',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Get a streak of 3 correct answers',
    icon: '🔥',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'streak_5',
    title: 'Unstoppable',
    description: 'Get a streak of 5 correct answers',
    icon: '⚡',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'streak_10',
    title: 'Legendary',
    description: 'Get a streak of 10 correct answers',
    icon: '👑',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'fast_answer',
    title: 'Quick Thinker',
    description: 'Answer correctly in less than 5 seconds',
    icon: '⏱️',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'five_quizzes',
    title: 'Getting Started',
    description: 'Complete 5 quizzes',
    icon: '🏁',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'ten_quizzes',
    title: 'Dedicated',
    description: 'Complete 10 quizzes',
    icon: '🏆',
    unlocked: false,
    sport: 'general'
  },
  {
    id: 'twenty_quizzes',
    title: 'Trivia Master',
    description: 'Complete 20 quizzes',
    icon: '🎓',
    unlocked: false,
    sport: 'general'
  },
  // Basketball achievements
  {
    id: 'basketball_leaderboard_top3',
    title: 'All-Star',
    description: 'Reach the top 3 on the basketball leaderboard',
    icon: '🏀🥉',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'basketball_leaderboard_top1',
    title: 'MVP',
    description: 'Reach the #1 spot on the basketball leaderboard',
    icon: '🏀🏆',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'five_basketball_quizzes',
    title: 'Rookie',
    description: 'Complete 5 basketball quizzes',
    icon: '🏀🔄',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'ten_basketball_quizzes',
    title: 'Veteran',
    description: 'Complete 10 basketball quizzes',
    icon: '🏀⭐',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'twenty_basketball_quizzes',
    title: 'Hall of Fame',
    description: 'Complete 20 basketball quizzes',
    icon: '🏀👑',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'basketball_perfect_score',
    title: 'Nothing But Net',
    description: 'Get a perfect score on a basketball quiz',
    icon: '🏀💯',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'basketball_streak_7',
    title: 'Hot Hand',
    description: 'Get a streak of 7 correct answers in basketball',
    icon: '🏀🔥',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'basketball_fast_quiz',
    title: 'Fast Break',
    description: 'Complete a basketball quiz in under 2 minutes',
    icon: '🏀⏱️',
    unlocked: false,
    sport: 'basketball'
  },
  {
    id: 'basketball_three_perfect',
    title: 'Triple Double',
    description: 'Get 3 perfect scores on basketball quizzes',
    icon: '🏀🏆🏆🏆',
    unlocked: false,
    sport: 'basketball'
  },
  // Soccer achievements
  {
    id: 'soccer_leaderboard_top3',
    title: 'World Class',
    description: 'Reach the top 3 on the soccer leaderboard',
    icon: '⚽🥉',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'soccer_leaderboard_top1',
    title: 'Golden Ball',
    description: 'Reach the #1 spot on the soccer leaderboard',
    icon: '⚽🏆',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'five_soccer_quizzes',
    title: 'Academy Player',
    description: 'Complete 5 soccer quizzes',
    icon: '⚽🔄',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'ten_soccer_quizzes',
    title: 'Professional',
    description: 'Complete 10 soccer quizzes',
    icon: '⚽⭐',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'twenty_soccer_quizzes',
    title: 'Legend',
    description: 'Complete 20 soccer quizzes',
    icon: '⚽👑',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'soccer_perfect_score',
    title: 'Top Corner',
    description: 'Get a perfect score on a soccer quiz',
    icon: '⚽💯',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'soccer_streak_7',
    title: 'Goal Streak',
    description: 'Get a streak of 7 correct answers in soccer',
    icon: '⚽🔥',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'soccer_fast_quiz',
    title: 'Counter Attack',
    description: 'Complete a soccer quiz in under 2 minutes',
    icon: '⚽⏱️',
    unlocked: false,
    sport: 'soccer'
  },
  {
    id: 'soccer_three_perfect',
    title: 'Golden Boot',
    description: 'Get 3 perfect scores on soccer quizzes',
    icon: '⚽🏆🏆🏆',
    unlocked: false,
    sport: 'soccer'
  }
];

export function useAchievements(): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load achievements from Firebase or localStorage based on authentication status
  useEffect(() => {
    const loadAchievements = async () => {
      setLoading(true);
      
      if (user) {
        // User is authenticated, load from Firebase
        try {
          // Get all documents from the achievements collection
          const userAchievements = await getDocuments('achievements') as AchievementDocument[];
          
          // Filter for the current user's achievements
          const currentUserAchievements = userAchievements.filter(
            doc => doc.userId === user.uid
          );
          
          if (currentUserAchievements && currentUserAchievements.length > 0) {
            // User has achievements in Firebase
            setAchievements(currentUserAchievements[0].achievements || defaultAchievements);
          } else {
            // First time user, initialize with default achievements
            const newUserAchievements = {
              userId: user.uid,
              achievements: defaultAchievements
            };
            await addDocument('achievements', newUserAchievements);
            setAchievements(defaultAchievements);
          }
        } catch (error) {
          console.error('Failed to load achievements from Firebase:', error);
          // Fallback to defaults
          setAchievements(defaultAchievements);
        }
      } else {
        // User is not authenticated, use localStorage for temporary storage
        const savedAchievements = localStorage.getItem('guest_achievements');
        if (savedAchievements) {
          try {
            const parsed = JSON.parse(savedAchievements);
            setAchievements(parsed);
          } catch (error) {
            console.error('Failed to parse achievements:', error);
            setAchievements(defaultAchievements);
          }
        } else {
          setAchievements(defaultAchievements);
        }
      }
      
      setLoading(false);
    };
    
    loadAchievements();
  }, [user]);

  // Save achievements when they change
  useEffect(() => {
    if (achievements.length > 0) {
      if (user) {
        // Save to Firebase for authenticated users
        const saveToFirebase = async () => {
          try {
            // Get all documents from the achievements collection
            const userAchievements = await getDocuments('achievements') as AchievementDocument[];
            
            // Filter for the current user's achievements
            const currentUserAchievements = userAchievements.filter(
              doc => doc.userId === user.uid
            );
            
            if (currentUserAchievements && currentUserAchievements.length > 0) {
              await updateDocument('achievements', currentUserAchievements[0].id, {
                achievements: achievements
              });
            }
          } catch (error) {
            console.error('Failed to save achievements to Firebase:', error);
          }
        };
        
        saveToFirebase();
      } else {
        // Save to localStorage for guests
        localStorage.setItem('guest_achievements', JSON.stringify(achievements));
      }
    }
  }, [achievements, user]);

  // Unlock an achievement by ID
  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((achievement) =>
        achievement.id === id && !achievement.unlocked
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    );
  };

  // Check if an achievement is unlocked
  const hasAchievement = (id: string): boolean => {
    return achievements.some((a) => a.id === id && a.unlocked);
  };

  // Get the most recently unlocked achievements
  const getRecentAchievements = (count = 3): Achievement[] => {
    return [...achievements]
      .filter((a) => a.unlocked && a.unlockedAt)
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, count);
  };

  // Get achievements for a specific sport
  const getSportAchievements = (sport: 'basketball' | 'soccer' | 'general'): Achievement[] => {
    // For general, only return general achievements
    if (sport === 'general') {
      return achievements.filter(a => a.sport === 'general');
    } 
    // For specific sports, only return achievements for that sport
    else {
      // Filter achievements that specifically belong to the selected sport
      const sportAchievements = achievements.filter(a => a.sport === sport);
      
      // Sort achievements by unlocked status (unlocked first)
      const sortedAchievements = [
        ...sportAchievements.filter(a => a.unlocked),
        ...sportAchievements.filter(a => !a.unlocked)
      ];
      
      return sortedAchievements;
    }
  };

  // Reset all achievements
  const resetAchievements = () => {
    setAchievements(defaultAchievements);
    
    if (user) {
      // Update Firebase for authenticated users
      const resetInFirebase = async () => {
        try {
          // Get all documents from the achievements collection
          const userAchievements = await getDocuments('achievements') as AchievementDocument[];
          
          // Filter for the current user's achievements
          const currentUserAchievements = userAchievements.filter(
            doc => doc.userId === user.uid
          );
          
          if (currentUserAchievements && currentUserAchievements.length > 0) {
            await updateDocument('achievements', currentUserAchievements[0].id, {
              achievements: defaultAchievements
            });
          }
        } catch (error) {
          console.error('Failed to reset achievements in Firebase:', error);
        }
      };
      
      resetInFirebase();
    } else {
      // Reset localStorage for guests
      localStorage.removeItem('guest_achievements');
    }
  };

  return {
    achievements,
    unlockAchievement,
    hasAchievement,
    getRecentAchievements,
    getSportAchievements,
    resetAchievements,
    loading,
  };
}

export default useAchievements; 