import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { usePersonalizedTrivia } from '../../lib/hooks/usePersonalizedTrivia';

interface PersonalizedRecommendationsProps {
  darkMode: boolean;
  onStartQuiz: (questions: any[]) => void;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  darkMode,
  onStartQuiz,
}) => {
  const { recommendedQuestions, isLoading } = usePersonalizedTrivia(10);

  // Difficulty color mapping
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return darkMode ? 'text-green-400' : 'text-green-600';
      case 'medium':
        return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'hard':
        return darkMode ? 'text-red-400' : 'text-red-600';
      default:
        return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  // Category icon mapping
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'players':
        return '🏀';
      case 'teams':
        return '👥';
      case 'history':
        return '📜';
      case 'stats':
        return '📊';
      case 'championships':
        return '🏆';
      case 'draft':
        return '🎓';
      case 'records':
        return '🏅';
      case 'current_events':
        return '📰';
      default:
        return '❓';
    }
  };

  // Start a personalized quiz
  const handleStartPersonalizedQuiz = () => {
    if (recommendedQuestions.length > 0) {
      onStartQuiz(recommendedQuestions);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg p-6 shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <FaLightbulb className="mr-2 text-yellow-500" /> Recommended For You
        </h3>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <FaSpinner className="animate-spin text-3xl text-orange-500 mb-4" />
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Personalizing your trivia experience...
          </p>
        </div>
      ) : recommendedQuestions.length === 0 ? (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Complete more quizzes to get personalized recommendations!
          </p>
        </div>
      ) : (
        <>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Based on your interests and quiz history, we've curated these trivia questions just for you.
          </p>

          <div className="mb-6">
            <div className={`grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2 ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              {recommendedQuestions.slice(0, 5).map((question, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                >
                  <div className="flex items-start">
                    <div className="text-xl mr-3">{getCategoryIcon(question.category)}</div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{question.question}</p>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty?.toUpperCase()}
                        </span>
                        <span className={`mx-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {question.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartPersonalizedQuiz}
            className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center ${
              darkMode
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Start Personalized Quiz <FaArrowRight className="ml-2" />
          </motion.button>
        </>
      )}
    </motion.div>
  );
};

export default PersonalizedRecommendations; 