import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import AuthForm from '../../components/AuthForm';
import { FaTrophy, FaBasketballBall, FaUserCircle, FaMoon, FaSun, FaMedal, FaChartLine, FaArrowRight, FaFutbol, FaChevronDown, FaInfoCircle, FaTimes, FaSignOutAlt, FaCog, FaGoogle, FaUserPlus, FaEnvelope } from 'react-icons/fa';
import AchievementsDisplay from './AchievementsDisplay';
import { useAchievementsContext } from '../../lib/contexts/AchievementsContext';
import { useUserPreferences, SPORTS } from '../../lib/contexts/UserPreferencesContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface HomeProps {
  onStart: () => void;
  darkMode?: boolean;
  onDarkModeChange?: (mode: boolean) => void;
  selectedSport: 'basketball' | 'soccer';
  onSportChange: (sport: 'basketball' | 'soccer') => void;
  isAuthenticated?: boolean;
  user?: any;
  signInWithGoogle?: () => Promise<void>;
  signOut?: () => Promise<void>;
}

interface ScoreEntry {
  username: string;
  score: number;
}

const Home: React.FC<HomeProps> = ({ 
  onStart, 
  darkMode = false, 
  onDarkModeChange,
  selectedSport = 'basketball',
  onSportChange,
  isAuthenticated = false,
  user = null,
  signInWithGoogle = () => Promise.resolve(),
  signOut = () => Promise.resolve()
}) => {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);
  const { achievements, getRecentAchievements, unlockAchievement, loading: achievementsLoading } = useAchievementsContext();
  const { preferences, updatePreferredSport } = useUserPreferences();
  const [isHovering, setIsHovering] = useState(false);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showSportTooltip, setShowSportTooltip] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const currentUser = session?.user || user;
  const isUserAuthenticated = !!session || isAuthenticated;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSportDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile]);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSportTooltip(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(`/api/getScores?sport=${selectedSport}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
          
          // Check for leaderboard achievements
          if (currentUser) {
            const username = currentUser.name || currentUser.displayName;
            if (username) {
              const userRank = data.findIndex((entry: ScoreEntry) => entry.username === username);
              if (userRank === 0) {
                unlockAchievement(`${selectedSport}_leaderboard_top1`);
              } else if (userRank >= 0 && userRank < 3) {
                unlockAchievement(`${selectedSport}_leaderboard_top3`);
              }
            }
          }
        } else {
          console.error('Failed to fetch scores:', response.status);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [currentUser, unlockAchievement, selectedSport]);

  const toggleDarkMode = () => {
    if (onDarkModeChange) {
      onDarkModeChange(!darkMode);
    }
  };

  const handleSportChange = async (sport: 'basketball' | 'soccer') => {
    onSportChange(sport);
    setShowSportDropdown(false);
    if (preferences) {
      await updatePreferredSport(sport);
    }
  };

  // Get user's rank
  const getUserRank = () => {
    if (!currentUser) return null;
    const username = currentUser.name || currentUser.displayName;
    if (!username) return null;
    
    const userRank = leaderboard.findIndex(entry => entry.username === username);
    return userRank >= 0 ? userRank + 1 : null;
  };

  // Get user's best score
  const getUserScore = () => {
    if (!currentUser) return null;
    const username = currentUser.name || currentUser.displayName;
    if (!username) return null;
    
    const userEntry = leaderboard.find(entry => entry.username === username);
    return userEntry ? userEntry.score : null;
  };

  // Get recent achievements
  const recentAchievements = getRecentAchievements(3);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Sport icons
  const sportIcons = {
    basketball: <FaBasketballBall />,
    soccer: <FaFutbol />
  };

  // Get theme colors based on selected sport
  const getThemeColors = () => {
    return selectedSport === 'basketball' 
      ? {
          primary: 'from-orange-500 to-red-500',
          button: 'bg-orange-500 hover:bg-orange-600',
          buttonDark: 'bg-orange-600 hover:bg-orange-700',
          accent: 'text-orange-500',
          gradient: 'from-orange-100 to-orange-50',
          gradientDark: 'from-gray-800 to-gray-900',
          bgLight: 'bg-orange-50',
          bgDark: 'bg-gray-900',
          cardLight: 'bg-orange-100',
          cardDark: 'bg-gray-700'
        }
      : {
          primary: 'from-green-500 to-emerald-600',
          button: 'bg-green-500 hover:bg-green-600',
          buttonDark: 'bg-green-600 hover:bg-green-700',
          accent: 'text-green-500',
          gradient: 'from-green-100 to-green-50',
          gradientDark: 'from-gray-800 to-gray-900',
          bgLight: 'bg-green-50',
          bgDark: 'bg-gray-900',
          cardLight: 'bg-green-100',
          cardDark: 'bg-gray-700'
        };
  };

  const colors = getThemeColors();

  // Profile dropdown animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    setShowProfile(false);
  };

  // Navigation handlers
  const handleSignInClick = () => {
    router.push('/signin');
  };

  const handleSignUpClick = () => {
    router.push('/signup');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? colors.bgDark : colors.bgLight} text-black ${darkMode && 'text-white'}`}>
      {/* Header */}
      <header 
        className={`p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-300`}
      >
        {/* Logo with Dropdown */}
        <div 
          className="flex items-center space-x-2 relative"
          ref={dropdownRef}
        >
          <div className="relative">
            <div 
              onClick={() => setShowSportDropdown(!showSportDropdown)}
              className="cursor-pointer relative flex items-center"
              onMouseEnter={() => setShowSportTooltip(true)}
              onMouseLeave={() => setTimeout(() => setShowSportTooltip(false), 1000)}
            >
              <div className="relative">
                {selectedSport === 'basketball' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center hover:opacity-80 transition-all duration-300 group">
                    <FaBasketballBall className="text-white text-xl transition-transform duration-300 group-hover:animate-spin" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center hover:opacity-80 transition-all duration-300 group">
                    <FaFutbol className="text-white text-xl transition-transform duration-300 group-hover:animate-spin" />
                  </div>
                )}
                <div className="absolute -right-1 -bottom-1 bg-white dark:bg-gray-700 rounded-full p-0.5 shadow-sm">
                  <FaChevronDown className={`text-xs ${selectedSport === 'basketball' ? 'text-orange-500' : 'text-green-500'} transition-transform duration-300 ${showSportDropdown ? 'transform rotate-180' : ''}`} />
                </div>
              </div>
              <span className={`text-xl font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent ml-2`}>trivia.ai</span>
            </div>
            
            {/* Sport Selection Tooltip */}
            {showSportTooltip && !showSportDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 p-2 rounded-lg shadow-lg text-sm z-50 w-48 animate-fade-in">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-white">Click the ball to change sport</p>
                </div>
              </div>
            )}
            
            {/* Sport Selection Dropdown */}
            {showSportDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg z-50 w-48 animate-fade-in">
                <div className="p-2 border-b border-gray-700">
                  <p className="text-sm text-white">Select Sport</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSportChange('basketball')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                      selectedSport === 'basketball'
                        ? darkMode
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaBasketballBall className="inline-block mr-2" /> Basketball
                  </button>
                  <button
                    onClick={() => handleSportChange('soccer')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                      selectedSport === 'soccer'
                        ? darkMode
                          ? 'bg-green-600 text-white'
                          : 'bg-green-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaFutbol className="inline-block mr-2" /> Soccer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          
          {/* Profile Button (only if logged in) */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <motion.button
                onClick={() => setShowProfile(!showProfile)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  darkMode 
                    ? showProfile ? `${colors.buttonDark} text-white ring-2 ring-blue-400` : 'bg-gray-700 text-white hover:bg-gray-600' 
                    : showProfile ? `${colors.button} text-white ring-2 ring-blue-400` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                aria-label="View Profile"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaUserCircle className="text-xl" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Regular Sign in button */}
              <motion.button
                onClick={handleSignInClick}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaEnvelope className="mr-2 text-blue-500" />
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">In</span>
              </motion.button>
              
              {/* Sign in with Google button */}
              <motion.button
                onClick={signInWithGoogle}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaGoogle className="mr-2 text-red-500" />
                <span className="hidden sm:inline">Google</span>
                <span className="sm:hidden">G</span>
              </motion.button>
              
              {/* Sign up button */}
              <motion.button
                onClick={handleSignUpClick}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  darkMode 
                    ? `${colors.buttonDark} text-white` 
                    : `${colors.button} text-white`
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaUserPlus className="mr-2" />
                <span className="hidden sm:inline">Sign up</span>
                <span className="sm:hidden">Up</span>
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Section (only visible when toggled) */}
      <AnimatePresence>
        {showProfile && currentUser && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
            />
            
            <motion.div 
              className={`absolute right-4 top-16 w-full max-w-md z-20 overflow-hidden rounded-xl shadow-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative">
                {/* Header with close button */}
                <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className="text-xl font-bold">Your Profile</h2>
                  <button 
                    onClick={() => setShowProfile(false)}
                    className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    aria-label="Close profile"
                  >
                    <FaTimes className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="p-4">
                  {/* User Info */}
                  <div className="flex items-center mb-6">
                    <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mr-4`}>
                      <FaUserCircle className={`text-4xl ${colors.accent}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{currentUser?.name || currentUser?.displayName || 'User'}</h3>
                      <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getUserRank() ? `Rank #${getUserRank()}` : 'Not ranked yet'}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div 
                      className={`p-4 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}
                    >
                      <FaChartLine className={`text-2xl ${colors.accent} mx-auto mb-2`} />
                      <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Score</p>
                      <p className="text-xl font-bold">{getUserScore() || 0}</p>
                    </div>
                      
                    <div 
                      className={`p-4 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}
                    >
                      <FaMedal className="text-2xl text-yellow-500 mx-auto mb-2" />
                      <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Achievements</p>
                      {achievementsLoading ? (
                        <p className="text-xl font-bold">Loading...</p>
                      ) : (
                        <p className="text-xl font-bold">{unlockedCount}/{achievements.length}</p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Sport Selection */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Default Sport</h3>
                    <div className="flex space-x-2">
                      {SPORTS.map(sport => (
                        <button
                          key={sport.id}
                          onClick={() => handleSportChange(sport.id as 'basketball' | 'soccer')}
                          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center ${
                            preferences?.preferredSport === sport.id 
                              ? sport.id === 'basketball'
                                ? 'bg-orange-500 text-white'
                                : 'bg-green-500 text-white'
                              : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          } transition-colors duration-200`}
                        >
                          <span className="mr-2">
                            {sport.id === 'basketball' ? (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center animate-pulse-subtle">
                                <FaBasketballBall className="text-white text-xs" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center animate-pulse-subtle">
                                <FaFutbol className="text-white text-xs" />
                              </div>
                            )}
                          </span>
                          <span>{sport.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be your default sport when you open the app
                    </p>
                  </div>
                  
                  {/* Recent Achievements */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Recent Achievements</h3>
                    {achievementsLoading ? (
                      <p className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center text-sm`}>
                        Loading achievements...
                      </p>
                    ) : recentAchievements.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {recentAchievements.slice(0, 3).map((achievement, index) => (
                          <div 
                            key={achievement.id}
                            className={`p-3 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-100 hover:bg-gray-200'} text-center`}
                          >
                            <div className="text-2xl mb-1">{achievement.icon}</div>
                            <h4 className="font-bold text-sm">{achievement.title}</h4>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`p-3 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center text-sm`}>
                        No achievements unlocked yet. Start playing to earn some!
                      </p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`flex space-x-2 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => {
                        // Add settings functionality here
                        setShowProfile(false);
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } transition-colors duration-200`}
                    >
                      <FaCog className="mr-2" />
                      <span>Settings</span>
                    </button>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className={`w-full flex items-center p-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors duration-200`}
                    >
                      <FaSignOutAlt className="mr-3 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className={`py-16 px-4 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-b ' + colors.gradientDark : 'bg-gradient-to-b ' + colors.gradient}`}>
        <div className="max-w-4xl mx-auto text-center">
          {currentUser ? (
            <>
              <div 
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <FaUserCircle className={`text-6xl ${colors.accent}`} />
                </div>
              </div>
              <h1 
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Welcome back, <span className={colors.accent}>{currentUser.name || currentUser.displayName || 'User'}</span>!
              </h1>
            </>
          ) : (
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Test Your <span className={colors.accent}>{selectedSport === 'basketball' ? 'Basketball' : 'Soccer'}</span> Knowledge
            </h1>
          )}
          
          <p 
            className={`text-xl mb-8 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Challenge yourself with our AI-powered {selectedSport} trivia questions and see how you rank!
          </p>
          
          {!currentUser && (
            <p className={`text-md mb-6 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No account needed - play as a guest or sign in to save your progress!
            </p>
          )}
          
          <button
            onClick={onStart}
            className={`px-8 py-4 rounded-lg text-xl font-bold transition-colors duration-300 flex items-center justify-center mx-auto ${
              darkMode
                ? colors.buttonDark + ' text-white'
                : colors.button + ' text-white'
            }`}
          >
            Start Quiz <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl font-bold mb-12 text-center"
          >
            Why Play <span className={colors.accent}>Trivia.AI</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: selectedSport === 'basketball' ? (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto">
                    <FaBasketballBall className="text-white text-3xl animate-spin-slow" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto">
                    <FaFutbol className="text-white text-3xl animate-spin-slow" />
                  </div>
                ),
                title: selectedSport === 'basketball' ? "Basketball Trivia" : "Soccer Trivia",
                description: `Test your knowledge on ${selectedSport} with challenging questions for all levels.`
              },
              {
                icon: <FaTrophy className="text-4xl text-yellow-500" />,
                title: "Earn Achievements",
                description: "Unlock special achievements as you improve your trivia skills and knowledge."
              },
              {
                icon: <FaChartLine className="text-4xl text-blue-500" />,
                title: "Track Progress",
                description: "See your improvement over time with detailed stats and personalized insights."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : selectedSport === 'basketball' ? 'bg-orange-50' : 'bg-green-50'}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className={`py-16 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : selectedSport === 'basketball' ? 'bg-orange-100' : 'bg-green-100'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl font-bold mb-2 text-center"
          >
            <FaTrophy className="inline-block text-yellow-500 mr-2" /> Leaderboard
          </h2>
          
          <div className="flex justify-center mb-6">
            <div className={`inline-flex rounded-md shadow-sm`}>
              <button
                onClick={() => handleSportChange('basketball')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  selectedSport === 'basketball'
                    ? darkMode
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaBasketballBall className="inline-block mr-2" /> Basketball
              </button>
              <button
                onClick={() => handleSportChange('soccer')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  selectedSport === 'soccer'
                    ? darkMode
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaFutbol className="inline-block mr-2" /> Soccer
              </button>
            </div>
          </div>
          
          {leaderboard.length > 0 ? (
            <div 
              className={`rounded-lg overflow-hidden shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <table className="w-full">
                <thead className={`transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-white' : selectedSport === 'basketball' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                  <tr>
                    <th className="py-3 px-4 text-left">Rank</th>
                    <th className="py-3 px-4 text-left">Player</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <tr 
                      key={index}
                      className={`transition-colors duration-300 ${
                        currentUser && (currentUser.name === entry.username || currentUser.displayName === entry.username)
                          ? darkMode 
                            ? selectedSport === 'basketball' ? 'bg-orange-900/30' : 'bg-green-900/30' 
                            : selectedSport === 'basketball' ? 'bg-orange-100' : 'bg-green-100'
                          : index % 2 === 0
                          ? darkMode ? 'bg-gray-800' : 'bg-white'
                          : darkMode ? 'bg-gray-750' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        {index === 0 ? (
                          <span className="text-yellow-500 font-bold">🥇 1st</span>
                        ) : index === 1 ? (
                          <span className="text-gray-400 font-bold">🥈 2nd</span>
                        ) : index === 2 ? (
                          <span className="text-amber-600 font-bold">🥉 3rd</span>
                        ) : (
                          `${index + 1}th`
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {currentUser && (currentUser.name === entry.username || currentUser.displayName === entry.username) ? (
                          <span className={`font-bold ${colors.accent}`}>{entry.username} (You)</span>
                        ) : (
                          entry.username
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div 
              className={`p-8 rounded-lg text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <p className="text-lg">No scores yet. Be the first to play and get on the leaderboard!</p>
            </div>
          )}
        </div>
      </div>

      {/* Login/Register Section (only if not logged in) */}
      {!currentUser && (
        <div className={`py-16 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-md mx-auto">
            <h2 
              className="text-3xl font-bold mb-6 text-center"
            >
              Join <span className={colors.accent}>Trivia.AI</span>
            </h2>
            
            <p 
              className={`text-center mb-8 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Create an account to track your progress, earn achievements, and compete on the leaderboard.
            </p>
            
            <div className="space-y-4">
              {/* Play as Guest button */}
              <motion.button
                onClick={onStart}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  darkMode 
                    ? `${colors.buttonDark} text-white hover:opacity-90` 
                    : `${colors.button} text-white hover:opacity-90`
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaArrowRight className="mr-3" />
                Play as Guest
              </motion.button>
              
              <div className={`flex items-center my-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="mx-4 text-sm">or sign in to save progress</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              
              {/* Regular Sign in button */}
              <motion.button
                onClick={handleSignInClick}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEnvelope className="mr-3 text-blue-500" />
                Sign in with Email
              </motion.button>
              
              {/* Sign in with Google button */}
              <motion.button
                onClick={signInWithGoogle}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaGoogle className="mr-3 text-red-500" />
                Sign in with Google
              </motion.button>
              
              {/* Sign up button */}
              <motion.button
                onClick={handleSignUpClick}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  darkMode 
                    ? `${colors.buttonDark} text-white hover:opacity-90` 
                    : `${colors.button} text-white hover:opacity-90`
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaUserPlus className="mr-3" />
                Create an Account
              </motion.button>
              
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                By signing up, you agree to our <Link href="/terms" className={`${colors.accent} hover:underline`}>Terms of Service</Link> and <Link href="/privacy" className={`${colors.accent} hover:underline`}>Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className={`py-8 px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <p>© 2023 Trivia.AI - All rights reserved</p>
          <p className="mt-2 text-sm">
            <Link href="/privacy" className={`hover:${colors.accent} transition-colors duration-300`}>Privacy Policy</Link>
            {' • '}
            <Link href="/terms" className={`hover:${colors.accent} transition-colors duration-300`}>Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;