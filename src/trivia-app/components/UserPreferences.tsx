import React, { useState } from 'react';
import { FaCog, FaCheck, FaBasketballBall, FaUsers, FaHistory, FaChartBar, FaTrophy, FaGraduationCap, FaMedal, FaNewspaper, FaTimes, FaFutbol } from 'react-icons/fa';
import { useUserPreferences, TRIVIA_CATEGORIES, SPORTS } from '../../lib/contexts/UserPreferencesContext';

interface UserPreferencesProps {
  darkMode: boolean;
  onClose: () => void;
}

// Map category IDs to icons
const categoryIcons: Record<string, React.ReactNode> = {
  players: <FaBasketballBall />,
  teams: <FaUsers />,
  history: <FaHistory />,
  stats: <FaChartBar />,
  championships: <FaTrophy />,
  draft: <FaGraduationCap />,
  records: <FaMedal />,
  current_events: <FaNewspaper />,
};

// Map sport IDs to icons
const sportIcons: Record<string, React.ReactNode> = {
  basketball: <FaBasketballBall />,
  soccer: <FaFutbol />,
};

const UserPreferencesComponent: React.FC<UserPreferencesProps> = ({ darkMode, onClose }) => {
  const { preferences, updateCategories, updateDifficulty, updatePreferredSport, isLoading } = useUserPreferences();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preferences?.categories || TRIVIA_CATEGORIES.map(cat => cat.id)
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    preferences?.difficulty || 'medium'
  );
  const [selectedSport, setSelectedSport] = useState<'basketball' | 'soccer'>(
    preferences?.preferredSport || 'basketball'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Don't allow deselecting if it would result in no categories selected
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
  };

  const handleSportChange = (sport: 'basketball' | 'soccer') => {
    setSelectedSport(sport);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (preferences) {
        await updateCategories(selectedCategories);
        await updateDifficulty(selectedDifficulty);
        await updatePreferredSport(selectedSport);
        onClose();
      } else {
        // If no preferences, just close the modal
        // In a real app, you might want to create default preferences here
        onClose();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black bg-opacity-70' : 'bg-gray-500 bg-opacity-50'}`}>
      <div className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <FaCog className={`mr-2 ${selectedSport === 'basketball' ? 'text-orange-500' : 'text-green-500'}`} /> Your Preferences
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-opacity-10 ${darkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-500'}`}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`w-12 h-12 border-4 ${selectedSport === 'basketball' ? 'border-orange-500' : 'border-green-500'} border-t-transparent rounded-full animate-spin mb-4`}></div>
              <p className="text-center">Loading your preferences...</p>
            </div>
          ) : error ? (
            <div className="py-8">
              <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'} mb-4`}>
                <p>{error}</p>
              </div>
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                }`}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Sport Selection */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">Preferred Sport</h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Choose your preferred sport for trivia questions.
                </p>
                <div className="flex space-x-3">
                  {SPORTS.map(sport => (
                    <button
                      key={sport.id}
                      onClick={() => handleSportChange(sport.id as 'basketball' | 'soccer')}
                      className={`flex-1 py-3 px-4 rounded-lg capitalize font-medium transition-colors flex items-center justify-center ${
                        selectedSport === sport.id
                          ? sport.id === 'basketball'
                            ? 'bg-orange-500 text-white'
                            : 'bg-green-500 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{sportIcons[sport.id]}</span>
                      {sport.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">Trivia Categories</h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Select the categories you're interested in. We'll personalize your trivia experience based on your choices.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TRIVIA_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-lg flex items-center justify-between transition-colors ${
                        selectedCategories.includes(category.id)
                          ? darkMode
                            ? selectedSport === 'basketball'
                              ? 'bg-orange-600 text-white'
                              : 'bg-green-600 text-white'
                            : selectedSport === 'basketball'
                              ? 'bg-orange-500 text-white'
                              : 'bg-green-500 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{categoryIcons[category.id]}</span>
                        <span>{category.name}</span>
                      </div>
                      {selectedCategories.includes(category.id) && (
                        <FaCheck className="text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">Difficulty Level</h4>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Choose your preferred difficulty level for trivia questions.
                </p>
                <div className="flex space-x-3">
                  {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => handleDifficultyChange(difficulty)}
                      className={`flex-1 py-2 px-4 rounded-lg capitalize font-medium transition-colors ${
                        selectedDifficulty === difficulty
                          ? difficulty === 'easy'
                            ? 'bg-green-500 text-white'
                            : difficulty === 'medium'
                            ? 'bg-blue-500 text-white'
                            : 'bg-red-500 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  darkMode
                    ? selectedSport === 'basketball'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    : selectedSport === 'basketball'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesComponent;