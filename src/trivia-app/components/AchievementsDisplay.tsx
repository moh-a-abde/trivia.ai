import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBasketballBall, FaFutbol, FaTrophy } from 'react-icons/fa';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext';
import AchievementBadge from './AchievementBadge';

interface AchievementsDisplayProps {
  showAll?: boolean;
  maxDisplay?: number;
  sport?: 'basketball' | 'soccer' | 'general' | 'all';
}

const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({ 
  showAll = false, 
  maxDisplay = 6,
  sport: initialSport
}) => {
  const { achievements, getSportAchievements } = useAchievements();
  const { darkMode } = useTheme();
  const { preferences } = useUserPreferences();
  
  const [showAllAchievements, setShowAllAchievements] = useState(showAll);
  const [currentSport, setCurrentSport] = useState<'basketball' | 'soccer' | 'general' | 'all'>(
    initialSport || preferences?.preferredSport || 'basketball'
  );
  const [displayedAchievements, setDisplayedAchievements] = useState(achievements);
  
  // Update showAllAchievements when showAll prop changes
  useEffect(() => {
    setShowAllAchievements(showAll);
  }, [showAll]);
  
  // Update currentSport when initialSport prop changes
  useEffect(() => {
    if (initialSport) {
      setCurrentSport(initialSport);
    }
  }, [initialSport]);
  
  // Update displayed achievements when sport changes or achievements update
  useEffect(() => {
    let filteredAchievements;
    
    if (currentSport === 'all') {
      // Show all achievements, but sort them by sport and unlocked status
      const basketballAchievements = achievements.filter(a => a.sport === 'basketball');
      const soccerAchievements = achievements.filter(a => a.sport === 'soccer');
      const generalAchievements = achievements.filter(a => a.sport === 'general');
      
      // Sort each category by unlocked status
      const sortedBasketball = [
        ...basketballAchievements.filter(a => a.unlocked),
        ...basketballAchievements.filter(a => !a.unlocked)
      ];
      
      const sortedSoccer = [
        ...soccerAchievements.filter(a => a.unlocked),
        ...soccerAchievements.filter(a => !a.unlocked)
      ];
      
      const sortedGeneral = [
        ...generalAchievements.filter(a => a.unlocked),
        ...generalAchievements.filter(a => !a.unlocked)
      ];
      
      // Combine all achievements, prioritizing the current user's preferred sport
      if (preferences?.preferredSport === 'basketball') {
        filteredAchievements = [...sortedBasketball, ...sortedSoccer, ...sortedGeneral];
      } else if (preferences?.preferredSport === 'soccer') {
        filteredAchievements = [...sortedSoccer, ...sortedBasketball, ...sortedGeneral];
      } else {
        filteredAchievements = [...sortedGeneral, ...sortedBasketball, ...sortedSoccer];
      }
    } else {
      // Show only achievements for the selected sport
      filteredAchievements = getSportAchievements(currentSport);
    }
    
    setDisplayedAchievements(filteredAchievements);
  }, [achievements, currentSport, getSportAchievements, preferences?.preferredSport]);
  
  // Split achievements into unlocked and locked
  const unlockedAchievements = displayedAchievements.filter(a => a.unlocked);
  const lockedAchievements = displayedAchievements.filter(a => !a.unlocked);
  
  // Calculate progress percentage
  const progressPercentage = displayedAchievements.length > 0
    ? Math.round((unlockedAchievements.length / displayedAchievements.length) * 100)
    : 0;
  
  // Determine which achievements to display based on showAllAchievements
  const achievementsToDisplay = showAllAchievements 
    ? displayedAchievements 
    : [...unlockedAchievements, ...lockedAchievements].slice(0, maxDisplay);

  // Get sport-specific styling
  const getSportBadgeClasses = () => {
    switch (currentSport) {
      case 'basketball':
        return darkMode 
          ? 'bg-orange-900 text-orange-200' 
          : 'bg-orange-100 text-orange-800';
      case 'soccer':
        return darkMode 
          ? 'bg-green-900 text-green-200' 
          : 'bg-green-100 text-green-800';
      case 'all':
        return darkMode
          ? 'bg-purple-900 text-purple-200'
          : 'bg-purple-100 text-purple-800';
      case 'general':
      default:
        return darkMode 
          ? 'bg-blue-900 text-blue-200' 
          : 'bg-blue-100 text-blue-800';
    }
  };
  
  const getProgressBarColor = () => {
    switch (currentSport) {
      case 'basketball':
        return 'bg-orange-500';
      case 'soccer':
        return 'bg-green-500';
      case 'all':
        return 'bg-purple-500';
      case 'general':
      default:
        return 'bg-blue-500';
    }
  };
  
  return (
    <div className={`p-6 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" /> 
          {currentSport === 'all' ? 'All Achievements' : `${currentSport.charAt(0).toUpperCase() + currentSport.slice(1)} Achievements`}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentSport('all')}
            className={`p-3 rounded-md transition-colors flex items-center ${
              currentSport === 'all'
                ? darkMode ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-purple-500 text-white ring-2 ring-purple-300'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Show all achievements"
          >
            <FaTrophy className="mr-2" />
            <span className="hidden sm:inline">All</span>
          </button>
          <button
            onClick={() => setCurrentSport('general')}
            className={`p-3 rounded-md transition-colors flex items-center ${
              currentSport === 'general'
                ? darkMode ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-blue-500 text-white ring-2 ring-blue-300'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Show general achievements"
          >
            <FaTrophy className="mr-2" />
            <span className="hidden sm:inline">General</span>
          </button>
          <button
            onClick={() => setCurrentSport('basketball')}
            className={`p-3 rounded-md transition-colors flex items-center ${
              currentSport === 'basketball'
                ? darkMode ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-orange-500 text-white ring-2 ring-orange-300'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Show basketball achievements"
          >
            <FaBasketballBall className="mr-2" />
            <span className="hidden sm:inline">Basketball</span>
          </button>
          <button
            onClick={() => setCurrentSport('soccer')}
            className={`p-3 rounded-md transition-colors flex items-center ${
              currentSport === 'soccer'
                ? darkMode ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-green-500 text-white ring-2 ring-green-300'
                : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Show soccer achievements"
          >
            <FaFutbol className="mr-2" />
            <span className="hidden sm:inline">Soccer</span>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>{unlockedAchievements.length} unlocked</span>
          <span>{progressPercentage}% complete</span>
        </div>
        <div className={`h-3 w-full rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${getProgressBarColor()}`}
          />
        </div>
      </div>
      
      {/* Achievements grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {achievementsToDisplay.length > 0 ? (
          achievementsToDisplay.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="md"
              showDetails
              darkMode={darkMode}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No achievements found for this sport.</p>
          </div>
        )}
      </div>
      
      {/* Show more/less button */}
      {displayedAchievements.length > maxDisplay && (
        <button
          onClick={() => setShowAllAchievements(!showAllAchievements)}
          className={`w-full py-3 rounded-md transition-colors font-medium ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          {showAllAchievements ? 'Show Less' : `Show All (${displayedAchievements.length})`}
        </button>
      )}
    </div>
  );
};

export default AchievementsDisplay; 