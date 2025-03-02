import { useState, useEffect } from 'react';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { questions } from '../../trivia-app/questions';

// Define question difficulty levels
const DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// Define the structure of a question with additional metadata
export interface EnhancedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  score?: number; // Recommendation score
}

// Categorize questions (this would ideally be done in the source data)
const categorizeQuestions = (): EnhancedQuestion[] => {
  return questions.map((q, index) => {
    const id = `q-${index}`;
    let category = 'players'; // Default category
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium'; // Default difficulty
    
    // Simple categorization based on question content
    if (q.question.includes('team') || q.question.includes('franchise')) {
      category = 'teams';
    } else if (q.question.includes('championship') || q.question.includes('title') || q.question.includes('Finals')) {
      category = 'championships';
    } else if (q.question.includes('draft') || q.question.includes('picked')) {
      category = 'draft';
    } else if (q.question.includes('record') || q.question.includes('most')) {
      category = 'records';
    } else if (q.question.includes('history') || q.question.includes('first')) {
      category = 'history';
    } else if (q.question.includes('stats') || q.question.includes('average') || q.question.includes('points')) {
      category = 'stats';
    }
    
    // Simple difficulty assignment based on question length
    if (q.question.length < 60) {
      difficulty = 'easy';
    } else if (q.question.length > 120) {
      difficulty = 'hard';
    }
    
    return {
      ...q,
      id,
      category,
      difficulty,
    };
  });
};

export function usePersonalizedTrivia(count: number = 10) {
  const { preferences } = useUserPreferences();
  const [recommendedQuestions, setRecommendedQuestions] = useState<EnhancedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categorizedQuestions, setCategorizedQuestions] = useState<EnhancedQuestion[]>([]);

  // Initialize categorized questions
  useEffect(() => {
    setCategorizedQuestions(categorizeQuestions());
  }, []);

  // Generate personalized recommendations when preferences change
  useEffect(() => {
    if (!preferences || categorizedQuestions.length === 0) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    // Get user's preferred categories and difficulty
    const userCategories = preferences.categories;
    const userDifficulty = preferences.difficulty;
    const questionHistory = preferences.questionHistory;
    
    // Calculate a score for each question based on user preferences
    const scoredQuestions = categorizedQuestions.map(question => {
      let score = 0;
      
      // Category match
      if (userCategories.includes(question.category || '')) {
        score += 5;
      }
      
      // Difficulty match
      if (question.difficulty === userDifficulty) {
        score += 3;
      } else if (
        (userDifficulty === 'medium' && question.difficulty === 'easy') ||
        (userDifficulty === 'hard' && question.difficulty === 'medium')
      ) {
        score += 1; // Slightly lower difficulty is still okay
      }
      
      // Avoid recently answered questions
      const recentlyAnswered = questionHistory.some(
        history => history.questionId === question.id && 
        Date.now() - history.timestamp < 7 * 24 * 60 * 60 * 1000 // 7 days
      );
      
      if (recentlyAnswered) {
        score -= 10; // Strongly avoid recently answered questions
      }
      
      // Prioritize questions the user got wrong before (for learning)
      const answeredWrong = questionHistory.some(
        history => history.questionId === question.id && !history.correct
      );
      
      if (answeredWrong) {
        score += 2; // Good to retry questions they got wrong
      }
      
      return {
        ...question,
        score,
      };
    });
    
    // Sort by score and select the top N questions
    const sortedQuestions = [...scoredQuestions].sort((a, b) => 
      (b.score || 0) - (a.score || 0)
    );
    
    // Select top questions but ensure variety
    const selected: EnhancedQuestion[] = [];
    const categoryCount: Record<string, number> = {};
    
    // First pass: add highest scored questions while maintaining category balance
    for (const question of sortedQuestions) {
      const category = question.category || 'unknown';
      
      // Initialize category count if not exists
      if (!categoryCount[category]) {
        categoryCount[category] = 0;
      }
      
      // Limit questions per category to ensure variety
      const maxPerCategory = Math.ceil(count / userCategories.length) + 1;
      
      if (categoryCount[category] < maxPerCategory && selected.length < count) {
        selected.push(question);
        categoryCount[category]++;
      }
      
      if (selected.length >= count) break;
    }
    
    // Second pass: if we still need more questions, add the highest scored remaining ones
    if (selected.length < count) {
      const remainingQuestions = sortedQuestions.filter(
        q => !selected.includes(q)
      );
      
      selected.push(...remainingQuestions.slice(0, count - selected.length));
    }
    
    // Shuffle the final selection to avoid predictability
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    
    setRecommendedQuestions(shuffled);
    setIsLoading(false);
  }, [preferences, categorizedQuestions, count]);

  return {
    recommendedQuestions,
    isLoading,
  };
}

export default usePersonalizedTrivia; 