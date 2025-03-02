'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaTimes, FaArrowRight, FaRedo, FaHome, FaRegClock, FaFire, FaRegLightbulb } from 'react-icons/fa';
import { useUserPreferences } from '../../lib/contexts/UserPreferencesContext';
import { useAchievementsContext } from '../../lib/contexts/AchievementsContext';
import confetti from 'canvas-confetti';
import HintSystem from './HintSystem';
import { basketballQuestions } from '../basketball-questions';
import { soccerQuestions } from '../soccer-questions';
import { saveScore } from '../utils';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaTrophy, FaHourglassHalf, FaCog, FaUsers, FaLightbulb, FaStar, FaBolt, FaLock, FaUser, FaDollarSign, FaCreditCard } from 'react-icons/fa';
import AchievementsDisplay from './AchievementsDisplay';
import UserProgress from './UserProgress';
import SocialFeatures from './SocialFeatures';
import UserPreferencesComponent from './UserPreferences';

interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  sport: 'basketball' | 'soccer';
}

interface QuizProps {
  onRestart: () => void;
  darkMode?: boolean;
  initialQuestions?: Question[];
  sport?: 'basketball' | 'soccer';
}

const Quiz: React.FC<QuizProps> = ({ onRestart, darkMode = false, initialQuestions, sport = 'basketball' }) => {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<string | null>>([]);
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [quizComplete, setQuizComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerTime, setAnswerTime] = useState<number | null>(null);
  const [quizCount, setQuizCount] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showPerfectScoreAnimation, setShowPerfectScoreAnimation] = useState(false);
  const [streakAnimationText, setStreakAnimationText] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSocialFeatures, setShowSocialFeatures] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const { data: session, status } = useSession();
  const { unlockAchievement, hasAchievement } = useAchievementsContext();
  const { preferences, addQuestionToHistory, incrementQuizzesCompleted, updateStreak, addXP, completeDailyGoal } = useUserPreferences();
  const streakControls = useAnimation();
  const correctAnswerControls = useAnimation();
  const perfectScoreControls = useAnimation();
  const [hint, setHint] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintCooldown, setHintCooldown] = useState(false);
  const controls = useAnimation();
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [guestUsername, setGuestUsername] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [guestScoreSubmitted, setGuestScoreSubmitted] = useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);

  // Load quiz count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('quizCount');
    if (savedCount) {
      setQuizCount(parseInt(savedCount, 10));
    }
  }, []);

  // Function to select 10 random questions and shuffle them
  const selectRandomQuestions = () => {
    // If initialQuestions are provided, use them
    if (initialQuestions && initialQuestions.length > 0) {
      setIsPersonalized(true);
      return initialQuestions;
    }

    // Otherwise, use the default questions filtered by sport
    const allQuestions = [...basketballQuestions, ...soccerQuestions];
    const sportQuestions = allQuestions.filter(q => q.sport === sport) as Question[];
    const shuffledQuestions = [...sportQuestions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
    }
    return shuffledQuestions.slice(0, 10);
  };

  useEffect(() => {
    const selected = selectRandomQuestions();
    setSelectedQuestions(selected);
    setUserAnswers(new Array(selected.length).fill(null));
    
    // Start timer
    startTimer();
    
    // Unlock first quiz achievement
    unlockAchievement('first_quiz');
    
    // Set loading to false once questions are loaded
    setIsLoading(false);
    
    // Set quiz start time
    setQuizStartTime(Date.now());
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [unlockAchievement]);
  
  const startTimer = () => {
    setTimeLeft(30);
    startTimeRef.current = Date.now();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, move to next question
          if (selectedAnswer === null) {
            handleNextQuestion(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function to pause the timer
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Function to resume the timer with the current time left
  const resumeTimer = () => {
    if (!timerRef.current && !quizComplete && !showFeedback) {
      startTimer();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return; // Prevent selecting during feedback
    
    setSelectedAnswer(answer);
    const updatedUserAnswers = [...userAnswers];
    updatedUserAnswers[currentQuestion] = answer;
    setUserAnswers(updatedUserAnswers);
    
    // Calculate answer time
    const currentTime = Date.now();
    const timeTaken = Math.floor((currentTime - startTimeRef.current) / 1000);
    setAnswerTime(timeTaken);
  };

  const calculateScore = () => {
    // Simply count the number of correct answers (1 point each)
    return userAnswers.filter((answer, index) => 
      answer === selectedQuestions[index]?.correctAnswer
    ).length;
  };

  // Enhanced confetti for correct answers
  const triggerCorrectAnswerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: sport === 'basketball' 
        ? ['#f97316', '#ea580c', '#fdba74'] // Orange colors for basketball
        : ['#22c55e', '#16a34a', '#86efac']  // Green colors for soccer
    });
  };

  // Enhanced confetti for streaks
  const triggerStreakConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: sport === 'basketball' 
        ? ['#f97316', '#ea580c', '#fdba74', '#fbbf24'] // Orange colors for basketball
        : ['#22c55e', '#16a34a', '#86efac', '#4ade80']  // Green colors for soccer
    });
  };

  // Enhanced confetti for perfect score
  const triggerPerfectScoreConfetti = () => {
    // First burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: sport === 'basketball' 
        ? ['#f97316', '#ea580c', '#fdba74', '#fbbf24'] // Orange colors for basketball
        : ['#22c55e', '#16a34a', '#86efac', '#4ade80']  // Green colors for soccer
    });
    
    // Second burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.6 },
        colors: sport === 'basketball' 
          ? ['#f97316', '#ea580c', '#fdba74', '#fbbf24'] // Orange colors for basketball
          : ['#22c55e', '#16a34a', '#86efac', '#4ade80']  // Green colors for soccer
      });
      
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.6 },
        colors: sport === 'basketball' 
          ? ['#f97316', '#ea580c', '#fdba74', '#fbbf24'] // Orange colors for basketball
          : ['#22c55e', '#16a34a', '#86efac', '#4ade80']  // Green colors for soccer
      });
    }, 300);
    
    // Final burst with stars
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.5, x: 0.5 },
        shapes: ['star'],
        colors: sport === 'basketball' 
          ? ['#fbbf24', '#f59e0b', '#ffffff'] // Gold and white for basketball
          : ['#4ade80', '#10b981', '#ffffff']  // Green and white for soccer
      });
    }, 600);
  };

  // Animate correct answer
  const animateCorrectAnswer = () => {
    // Only trigger confetti, no popup animation
    triggerCorrectAnswerConfetti();
  };

  // Animate streak
  const animateStreak = () => {
    setShowStreakAnimation(true);
    
    // Set streak message based on streak count
    if (streak === 3) {
      setStreakAnimationText("Three in a row! 🔥");
    } else if (streak === 5) {
      setStreakAnimationText("You're on fire! 🔥🔥");
    } else if (streak >= 7) {
      setStreakAnimationText("UNSTOPPABLE! 🔥🔥🔥");
    }
    
    streakControls.start({
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
      transition: { duration: 0.7, ease: "easeInOut" }
    });
    
    // Trigger streak confetti
    if (streak >= 3) {
      triggerStreakConfetti();
    }
    
    const timer = setTimeout(() => {
      setShowStreakAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  };

  // Animate perfect score
  const animatePerfectScore = () => {
    setShowPerfectScoreAnimation(true);
    perfectScoreControls.start({
      scale: [1, 1.3, 1],
      rotate: [0, 5, -5, 5, 0],
      transition: { duration: 1.2, ease: "easeInOut" }
    });
    
    // Trigger perfect score confetti
    triggerPerfectScoreConfetti();
    
    const timer = setTimeout(() => {
      setShowPerfectScoreAnimation(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  };

  // Save score to leaderboard
  const saveScoreToLeaderboard = async (username: string, finalScore: number) => {
    await saveScore(username, finalScore, sport);
    if (!session) {
      setGuestScoreSubmitted(true);
    }
  };

  // Check for achievements
  const checkAchievements = async () => {
    // First quiz achievement
    if (!hasAchievement('first_quiz')) {
      unlockAchievement('first_quiz');
    }

    // Perfect score achievement
    if (score === selectedQuestions.length && !hasAchievement('perfect_score')) {
      unlockAchievement('perfect_score');
      triggerPerfectScoreConfetti();
    }

    // Streak achievements
    if (streak >= 3 && !hasAchievement('streak_3')) {
      unlockAchievement('streak_3');
    }
    if (streak >= 5 && !hasAchievement('streak_5')) {
      unlockAchievement('streak_5');
    }
    if (streak >= 10 && !hasAchievement('streak_10')) {
      unlockAchievement('streak_10');
    }

    // Fast answer achievement
    if (answerTime !== null && answerTime < 5 && !hasAchievement('fast_answer')) {
      unlockAchievement('fast_answer');
    }

    // Track quiz completion time
    const quizCompletionTime = (Date.now() - startTimeRef.current) / 1000 / 60; // in minutes

    // Sport-specific achievements
    if (sport === 'basketball') {
      // Basketball quizzes completed achievements
      if (quizCount >= 5 && !hasAchievement('five_basketball_quizzes')) {
        unlockAchievement('five_basketball_quizzes');
      }
      if (quizCount >= 10 && !hasAchievement('ten_basketball_quizzes')) {
        unlockAchievement('ten_basketball_quizzes');
      }
      if (quizCount >= 20 && !hasAchievement('twenty_basketball_quizzes')) {
        unlockAchievement('twenty_basketball_quizzes');
      }
      
      // Basketball perfect score achievement
      if (score === selectedQuestions.length && !hasAchievement('basketball_perfect_score')) {
        unlockAchievement('basketball_perfect_score');
      }
      
      // Basketball streak achievement
      if (streak >= 7 && !hasAchievement('basketball_streak_7')) {
        unlockAchievement('basketball_streak_7');
      }
      
      // Basketball fast quiz achievement
      if (quizCompletionTime < 2 && !hasAchievement('basketball_fast_quiz')) {
        unlockAchievement('basketball_fast_quiz');
      }
      
      // Check for triple double (3 perfect scores)
      if (score === selectedQuestions.length) {
        const perfectScoreCount = localStorage.getItem('basketball_perfect_scores') || '0';
        const newPerfectScoreCount = parseInt(perfectScoreCount) + 1;
        localStorage.setItem('basketball_perfect_scores', newPerfectScoreCount.toString());
        
        if (newPerfectScoreCount >= 3 && !hasAchievement('basketball_three_perfect')) {
          unlockAchievement('basketball_three_perfect');
        }
      }
    } else if (sport === 'soccer') {
      // Soccer quizzes completed achievements
      if (quizCount >= 5 && !hasAchievement('five_soccer_quizzes')) {
        unlockAchievement('five_soccer_quizzes');
      }
      if (quizCount >= 10 && !hasAchievement('ten_soccer_quizzes')) {
        unlockAchievement('ten_soccer_quizzes');
      }
      if (quizCount >= 20 && !hasAchievement('twenty_soccer_quizzes')) {
        unlockAchievement('twenty_soccer_quizzes');
      }
      
      // Soccer perfect score achievement
      if (score === selectedQuestions.length && !hasAchievement('soccer_perfect_score')) {
        unlockAchievement('soccer_perfect_score');
      }
      
      // Soccer streak achievement
      if (streak >= 7 && !hasAchievement('soccer_streak_7')) {
        unlockAchievement('soccer_streak_7');
      }
      
      // Soccer fast quiz achievement
      if (quizCompletionTime < 2 && !hasAchievement('soccer_fast_quiz')) {
        unlockAchievement('soccer_fast_quiz');
      }
      
      // Check for golden boot (3 perfect scores)
      if (score === selectedQuestions.length) {
        const perfectScoreCount = localStorage.getItem('soccer_perfect_scores') || '0';
        const newPerfectScoreCount = parseInt(perfectScoreCount) + 1;
        localStorage.setItem('soccer_perfect_scores', newPerfectScoreCount.toString());
        
        if (newPerfectScoreCount >= 3 && !hasAchievement('soccer_three_perfect')) {
          unlockAchievement('soccer_three_perfect');
        }
      }
    }

    // Save score to leaderboard if user is logged in
    if (session?.user?.name) {
      await saveScoreToLeaderboard(session.user.name, score);
    }
  };

  // Handle next question with enhanced animations
  const handleNextQuestion = async (timeUp = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (selectedAnswer === null && !timeUp) {
      return;
    }

    setShowFeedback(true);
    
    const currentQ = selectedQuestions[currentQuestion] || { correctAnswer: '', id: '' };
    const correct = selectedAnswer === currentQ.correctAnswer;
    setIsCorrect(correct);
    
    // Track question in user history if we have a question ID
    if (currentQ.id && preferences) {
      addQuestionToHistory(currentQ.id, correct, sport);
    }
    
    // Update score and streak
    if (correct) {
      setScore(prevScore => prevScore + 1);
      setStreak(prevStreak => prevStreak + 1);
    } else {
      setIncorrectAnswers((prevIncorrect) => prevIncorrect + 1);
      setStreak(0);
    }
    
    // Delay before showing next question
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowFeedback(false);
    setSelectedAnswer(null);
    setTimeLeft(30);
    
    // Move to next question or end quiz
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
      startTimer();
    } else {
      // Quiz completed
      setQuizComplete(true);
      
      // Update user progress
      if (preferences) {
        // Update sport-specific progress
        updateStreak(sport);
        incrementQuizzesCompleted(sport);
        completeDailyGoal(sport);
        
        // Add XP based on score
        addXP(score * 10, sport);
      }
      
      // Always check achievements when quiz is completed
      checkAchievements();
    }
  };

  const getStreakMessage = () => {
    if (streak === 3) return "Three in a row! Keep it up!";
    if (streak === 5) return "You're on fire! 🔥";
    if (streak >= 7) return "UNSTOPPABLE! 🔥🔥🔥";
    return "";
  };

  // Handle using a hint
  const handleUseHint = (hintText: string) => {
    setHintsUsed(prev => prev + 1);
    // Deduct points for using a hint
    setScore(Math.max(0, score - 5));
    // Track hint usage for analytics
    if (typeof window !== 'undefined') {
      const hintUsage = JSON.parse(localStorage.getItem('hintUsage') || '0');
      localStorage.setItem('hintUsage', JSON.stringify(hintUsage + 1));
    }
    // Set the hint text to display
    setHint(hintText);
    
    // Hide hint after 10 seconds
    setTimeout(() => {
      setHint(null);
    }, 10000);
  };

  // Get theme colors based on selected sport
  const getThemeColors = () => {
    return sport === 'basketball' 
      ? {
          primary: 'bg-orange-500',
          hover: 'hover:bg-orange-600',
          darkPrimary: 'bg-orange-600',
          darkHover: 'hover:bg-orange-700',
          accent: 'text-orange-500',
          progressBar: 'bg-orange-500',
          buttonLight: 'bg-orange-500 hover:bg-orange-600',
          buttonDark: 'bg-orange-600 hover:bg-orange-700'
        }
      : {
          primary: 'bg-green-500',
          hover: 'hover:bg-green-600',
          darkPrimary: 'bg-green-600',
          darkHover: 'hover:bg-green-700',
          accent: 'text-green-500',
          progressBar: 'bg-green-500',
          buttonLight: 'bg-green-500 hover:bg-green-600',
          buttonDark: 'bg-green-600 hover:bg-green-700'
        };
  };

  const colors = getThemeColors();

  if (isLoading || selectedQuestions.length === 0) {
    return (
      <div className={`max-w-2xl mx-auto p-6 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className={`w-16 h-16 border-4 ${sport === 'basketball' ? 'border-orange-500' : 'border-green-500'} border-t-transparent rounded-full animate-spin mb-4`}></div>
          <p className="text-lg font-medium">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    // If user is logged in, show normal completion screen
    if (session) {
      return (
        <div className={`max-w-4xl mx-auto p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6">
              <FaTrophy className="text-yellow-500 text-6xl mx-auto" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Quiz Complete!
            </h2>
            
            <p className="text-xl mb-8">
              You scored <span className={`font-bold ${colors.accent}`}>{score}</span> out of {selectedQuestions.length}
            </p>
            
            <div className={`p-6 rounded-lg mb-8 ${darkMode ? 'bg-gray-700' : 'bg-orange-100'} max-w-md w-full`}>
              <h3 className="text-xl font-semibold mb-4">Performance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold text-green-500 mb-2`}>
                    {score}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Correct</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold text-red-500 mb-2`}>
                    {incorrectAnswers}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Incorrect</div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {showAchievements ? 'Hide Achievements' : 'View Achievements'}
              </button>
              
              {showAchievements && (
                <div className="mt-4">
                  <AchievementsDisplay sport="all" showAll={true} maxDisplay={20} />
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onRestart}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                <FaHome className="mr-2" /> Return Home
              </button>
              
              <button
                onClick={() => {
                  setQuizComplete(false);
                  setCurrentQuestion(0);
                  setScore(0);
                  setIncorrectAnswers(0);
                  setStreak(0);
                  setIsCorrect(null);
                  setHintsUsed(0);
                  const selected = selectRandomQuestions();
                  setSelectedQuestions(selected);
                  setUserAnswers(new Array(selected.length).fill(null));
                  startTimer();
                }}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? colors.buttonDark : colors.buttonLight
                } text-white`}
              >
                Play Again
              </button>
            </div>
            
            {/* Social Sharing Button */}
            <button
              onClick={() => setShowSocialFeatures(true)}
              className={`mt-6 px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              <FaUsers className="mr-2" /> Share with a friend
            </button>
          </div>
          
          {/* Modals */}
          {showSocialFeatures && (
            <SocialFeatures 
              darkMode={darkMode} 
              score={score} 
              onClose={() => setShowSocialFeatures(false)} 
            />
          )}
        </div>
      );
    } else {
      // Guest user flow
      return (
        <div className={`max-w-4xl mx-auto p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6">
              <FaTrophy className="text-yellow-500 text-6xl mx-auto" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Quiz Complete!
            </h2>
            
            <p className="text-xl mb-8">
              You scored <span className={`font-bold ${colors.accent}`}>{score}</span> out of {selectedQuestions.length}
            </p>
            
            <div className={`p-6 rounded-lg mb-8 ${darkMode ? 'bg-gray-700' : 'bg-orange-100'} max-w-md w-full`}>
              <h3 className="text-xl font-semibold mb-4">Performance Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold text-green-500 mb-2`}>
                    {score}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Correct</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold text-red-500 mb-2`}>
                    {incorrectAnswers}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Incorrect</div>
                </div>
              </div>
            </div>
            
            {!guestScoreSubmitted && !showPaywall ? (
              <div className={`p-6 rounded-lg mb-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} max-w-md w-full`}>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaUser className="mr-2" /> Enter Your Username
                </h3>
                <p className="mb-4 text-sm">
                  Enter a username to save your score to the leaderboard.
                </p>
                <div className="mb-4">
                  <input
                    type="text"
                    value={guestUsername}
                    onChange={(e) => setGuestUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  />
                </div>
                <button
                  onClick={() => {
                    if (guestUsername.trim()) {
                      setShowPaywall(true);
                    }
                  }}
                  disabled={!guestUsername.trim()}
                  className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                    !guestUsername.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Continue <FaArrowRight className="ml-2" />
                </button>
              </div>
            ) : showPaywall && !paymentComplete ? (
              <div className={`p-6 rounded-lg mb-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} max-w-md w-full`}>
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 text-white p-3 rounded-full">
                    <FaLock size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Join the Leaderboard</h3>
                <p className="mb-6 text-center text-sm">
                  Pay $2 to add your score to the leaderboard without creating an account.
                </p>
                
                <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-600' : 'bg-white'} border ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className="flex justify-between mb-2">
                    <span>Username:</span>
                    <span className="font-semibold">{guestUsername}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Score:</span>
                    <span className="font-semibold">{score} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">$2.00</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setPaymentProcessing(true);
                    // Simulate payment processing
                    setTimeout(() => {
                      setPaymentProcessing(false);
                      setPaymentComplete(true);
                      // Save score to leaderboard
                      saveScoreToLeaderboard(guestUsername, score);
                    }, 1500);
                  }}
                  disabled={paymentProcessing}
                  className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                    paymentProcessing
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" /> Pay $2.00
                    </>
                  )}
                </button>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Skip payment and just save score
                      saveScoreToLeaderboard(guestUsername, score);
                    }}
                    className={`w-full px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Skip and save score
                  </button>
                </div>
              </div>
            ) : paymentComplete || guestScoreSubmitted ? (
              <div className={`p-6 rounded-lg mb-8 ${darkMode ? 'bg-gray-700' : 'bg-green-100'} max-w-md w-full`}>
                <div className="flex justify-center mb-4">
                  <div className="bg-green-500 text-white p-3 rounded-full">
                    <FaCheck size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Score Saved!</h3>
                <p className="mb-4 text-center">
                  Your score has been added to the leaderboard as <span className="font-semibold">{guestUsername}</span>.
                </p>
                {paymentComplete && (
                  <p className="text-center text-sm mb-4">
                    Thank you for your payment. Your score is now visible on the leaderboard.
                  </p>
                )}
              </div>
            ) : null}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onRestart}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                <FaHome className="mr-2" /> Return Home
              </button>
              
              <button
                onClick={() => {
                  setQuizComplete(false);
                  setCurrentQuestion(0);
                  setScore(0);
                  setIncorrectAnswers(0);
                  setStreak(0);
                  setIsCorrect(null);
                  setHintsUsed(0);
                  setGuestUsername('');
                  setShowPaywall(false);
                  setGuestScoreSubmitted(false);
                  setPaymentProcessing(false);
                  setPaymentComplete(false);
                  const selected = selectRandomQuestions();
                  setSelectedQuestions(selected);
                  setUserAnswers(new Array(selected.length).fill(null));
                  startTimer();
                }}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? colors.buttonDark : colors.buttonLight
                } text-white`}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  const renderProgressModal = () => {
    if (!showProgress) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative w-full max-w-md p-4">
          <button
            onClick={() => setShowProgress(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
          <UserProgress darkMode={darkMode} sport={sport} />
        </div>
      </div>
    );
  };

  // Render streak animation
  const renderStreakAnimation = () => {
    if (!showStreakAnimation) return null;
    
    return (
      <motion.div
        animate={streakControls}
        className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none`}
      >
        <div className={`px-8 py-4 rounded-lg shadow-lg ${
          sport === 'basketball'
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
            : 'bg-gradient-to-r from-emerald-400 to-green-500'
        } text-white font-bold text-xl text-center`}>
          <div className="flex items-center justify-center">
            <FaFire className="mr-2 text-yellow-200" />
            {streakAnimationText}
            <FaFire className="ml-2 text-yellow-200" />
          </div>
        </div>
      </motion.div>
    );
  };

  // Render correct answer animation
  const renderCorrectAnswerAnimation = () => {
    // Return null to effectively remove the animation
    return null;
  };

  // Render perfect score animation
  const renderPerfectScoreAnimation = () => {
    if (!showPerfectScoreAnimation) return null;
    
    return (
      <motion.div
        animate={perfectScoreControls}
        className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className={`px-10 py-6 rounded-lg shadow-lg ${
          sport === 'basketball'
            ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
            : 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500'
        } text-white font-bold text-3xl text-center`}>
          <div className="flex items-center justify-center">
            <FaStar className="mr-3 text-yellow-200" />
            PERFECT SCORE!
            <FaStar className="ml-3 text-yellow-200" />
          </div>
          <div className="text-lg mt-2 font-normal">
            You got all {selectedQuestions.length} questions right!
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      {/* Animations */}
      {renderStreakAnimation()}
      {renderCorrectAnswerAnimation()}
      {renderPerfectScoreAnimation()}
      
      {/* Header with Timer and Settings */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center flex-1">
          <FaRegClock className={`mr-2 ${timeLeft < 10 ? 'text-red-500' : 'text-gray-500'}`} />
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div
              className={`h-4 rounded-full ${
                timeLeft > 20 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
          <span className={`ml-2 font-bold ${timeLeft < 10 ? 'text-red-500' : ''}`}>{timeLeft}s</span>
        </div>
        
        <div className="flex items-center ml-4">
          {/* Hint System Button */}
          <HintSystem
            question={selectedQuestions[currentQuestion]?.question || ''}
            correctAnswer={selectedQuestions[currentQuestion]?.correctAnswer || ''}
            options={selectedQuestions[currentQuestion]?.options || []}
            darkMode={darkMode}
            hintsUsed={hintsUsed}
            onUseHint={handleUseHint}
          />
          
          {/* Settings Button */}
          <button
            onClick={() => {
              // Pause the timer when settings are opened
              pauseTimer();
              setShowPreferences(true);
            }}
            className={`ml-2 flex items-center justify-center p-2 rounded-full ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-80`}
            aria-label="Settings"
          >
            <FaCog size={20} />
          </button>
        </div>
      </div>
      
      {/* Hint Display */}
      {hint && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center">
            <div className="bg-amber-200 p-2 rounded-full mr-3">
              <FaRegLightbulb className="text-amber-600" />
            </div>
            <div>
              <div className="font-bold text-sm uppercase text-amber-800">
                HINT
              </div>
              <div className="text-amber-800">
                {hint}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Question {currentQuestion + 1} of {selectedQuestions.length}</span>
          <span>Score: {score}/{selectedQuestions.length}</span>
        </div>
        <div className={`bg-gray-200 rounded-full h-2.5 dark:bg-gray-700`}>
          <div
            className={`${colors.progressBar} h-2.5 rounded-full`}
            style={{ width: `${((currentQuestion) / selectedQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Streak Message */}
      {streak >= 3 && (
        <div className={`mb-4 p-2 ${
          sport === 'basketball'
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
            : 'bg-gradient-to-r from-emerald-400 to-green-500'
        } text-white font-bold rounded-md text-center relative overflow-hidden`}>
          {getStreakMessage()}
          {streak >= 5 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <FaFire className={`text-4xl ${sport === 'basketball' ? 'text-yellow-300' : 'text-emerald-300'}`} />
            </div>
          )}
        </div>
      )}

      {/* Question Display */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}
          >
            {selectedQuestions[currentQuestion]?.question}
          </motion.h2>
        </AnimatePresence>
        
        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-3">
          {selectedQuestions[currentQuestion]?.options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 1 }}
              animate={{ 
                opacity: showFeedback && option !== selectedQuestions[currentQuestion]?.correctAnswer ? 0.5 : 1,
                scale: selectedAnswer === option && isCorrect ? [1, 1.05, 1] : 1,
                x: selectedAnswer === option && !isCorrect && showFeedback ? [0, -5, 5, -5, 5, 0] : 0
              }}
              transition={{ 
                duration: 0.5,
                scale: { duration: 0.3 },
                x: { duration: 0.5 }
              }}
            >
              <button
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`p-4 w-full rounded-lg text-left transition-all duration-200 ${
                  selectedAnswer === option
                    ? showFeedback
                      ? option === selectedQuestions[currentQuestion]?.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : darkMode
                      ? `${colors.darkPrimary} text-white`
                      : `${colors.primary} text-white`
                    : showFeedback && option === selectedQuestions[currentQuestion]?.correctAnswer
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showFeedback && option === selectedQuestions[currentQuestion]?.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <FaCheck className="text-white" />
                    </motion.div>
                  )}
                  {showFeedback && selectedAnswer === option && option !== selectedQuestions[currentQuestion]?.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaTimes className="text-white" />
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onRestart}
          className={`px-6 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <FaHome className="mr-2" /> Home
        </button>
        
        <button
          onClick={() => handleNextQuestion()}
          disabled={selectedAnswer === null || showFeedback}
          className={`px-6 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${
            selectedAnswer === null || showFeedback
              ? darkMode
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : darkMode
              ? `${colors.darkPrimary} ${colors.darkHover} text-white`
              : `${colors.primary} ${colors.hover} text-white`
          }`}
        >
          Next <FaArrowRight className="ml-2" />
        </button>
      </div>

      <div className="mt-4 text-lg font-semibold flex justify-between">
        <div className="flex items-center">
          <FaCheck className="text-green-500 mr-1" /> {score}
        </div>
        <div className="flex items-center">
          <FaTimes className="text-red-500 mr-1" /> {incorrectAnswers}
        </div>
      </div>

      {/* Modals */}
      {showPreferences && (
        <UserPreferencesComponent 
          darkMode={darkMode} 
          onClose={() => {
            setShowPreferences(false);
            // Resume the timer when settings are closed
            if (!quizComplete && !showFeedback) {
              resumeTimer();
            }
          }} 
        />
      )}

      {renderProgressModal()}
    </div>
  );
};

export default Quiz;
