import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaTrophy, FaUserFriends, FaShareAlt, FaEnvelope, FaLink, FaTwitter, FaFacebook, FaTimes, FaCheck, FaCopy } from 'react-icons/fa';

interface SocialFeaturesProps {
  darkMode: boolean;
  score?: number;
  onClose: () => void;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  darkMode: boolean;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, darkMode, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 flex items-center justify-center transition-colors duration-200 relative ${
      active
        ? darkMode
          ? 'text-orange-400'
          : 'text-orange-500'
        : darkMode
        ? 'text-gray-400 hover:text-gray-200'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <span className="flex items-center">
      <span className="mr-2">{icon}</span>
      <span className="font-medium">{label}</span>
    </span>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

const SocialFeatures: React.FC<SocialFeaturesProps> = ({ darkMode, score, onClose }) => {
  const [activeTab, setActiveTab] = useState<'challenge' | 'teams' | 'share'>('challenge');
  const [email, setEmail] = useState('');
  const [challengeMessage, setChallengeMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamCreated, setTeamCreated] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Handle friend challenge
  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        setChallengeMessage('');
      }, 3000);
    }, 1500);
  };

  // Handle team creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    setIsCreatingTeam(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreatingTeam(false);
      setTeamCreated(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setTeamCreated(false);
        setTeamName('');
        setTeamDescription('');
      }, 3000);
    }, 1500);
  };

  // Handle copy link
  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(`Check out my score of ${score} on Basketball Trivia! ${shareUrl}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Handle share via email
  const handleEmailShare = () => {
    const subject = "Check out my Basketball Trivia score!";
    const body = `I scored ${score} points on Basketball Trivia! Can you beat my score?`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // Handle social media shares
  const handleTwitterShare = () => {
    const text = `I scored ${score} points on Basketball Trivia! Can you beat my score?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
  };

  const handleFacebookShare = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <FaUsers className="text-orange-500 mr-2 text-xl" />
            <h2 className="text-xl font-bold">Share with a friend</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 ${darkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-500'}`}
            aria-label="Close"
          >
            <FaTimes size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <TabButton 
            active={activeTab === 'challenge'} 
            onClick={() => setActiveTab('challenge')} 
            darkMode={darkMode}
            icon={<FaUserFriends />}
            label="Challenge Friends"
          />
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')} 
            darkMode={darkMode}
            icon={<FaTrophy />}
            label="Teams"
          />
          <TabButton 
            active={activeTab === 'share'} 
            onClick={() => setActiveTab('share')} 
            darkMode={darkMode}
            icon={<FaShareAlt />}
            label="Share"
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {activeTab === 'challenge' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Challenge a Friend</h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Send a challenge to a friend and see who can get the highest score!
                </p>
                
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-4 rounded-lg flex items-center ${darkMode ? 'bg-green-800/30' : 'bg-green-100'} ${darkMode ? 'text-green-200' : 'text-green-800'}`}
                  >
                    <FaCheck className="mr-2" /> Challenge sent successfully!
                  </motion.div>
                ) : (
                  <form onSubmit={handleChallenge}>
                    <div className="mb-4">
                      <label className="block mb-2 font-medium">Friend's Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="friend@example.com"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block mb-2 font-medium">Message (Optional)</label>
                      <textarea
                        value={challengeMessage}
                        onChange={(e) => setChallengeMessage(e.target.value)}
                        className={`w-full p-3 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="I challenge you to beat my score!"
                        rows={3}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSending}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        darkMode
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      } ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSending ? 'Sending Challenge...' : 'Send Challenge'}
                    </motion.button>
                  </form>
                )}
                
                <div className="mt-8">
                  <h4 className="font-bold mb-2">Upcoming Challenges</h4>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    You don't have any active challenges yet. Send a challenge to get started!
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'teams' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Teams</h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Create or join a team to compete together and climb the leaderboard!
                </p>
                
                {teamCreated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-4 rounded-lg flex items-center ${darkMode ? 'bg-green-800/30' : 'bg-green-100'} ${darkMode ? 'text-green-200' : 'text-green-800'}`}
                  >
                    <FaCheck className="mr-2" /> Team created successfully!
                  </motion.div>
                ) : (
                  <form onSubmit={handleCreateTeam}>
                    <div className="mb-4">
                      <label className="block mb-2 font-medium">Team Name</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className={`w-full p-3 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Basketball Wizards"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block mb-2 font-medium">Team Description</label>
                      <textarea
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        className={`w-full p-3 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                        placeholder="A team of basketball trivia enthusiasts!"
                        rows={3}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isCreatingTeam}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        darkMode
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      } ${isCreatingTeam ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isCreatingTeam ? 'Creating Team...' : 'Create Team'}
                    </motion.button>
                  </form>
                )}
                
                <div className="mt-8">
                  <h4 className="font-bold mb-2">Your Teams</h4>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    You haven't joined any teams yet. Create a team or join an existing one!
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'share' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Share Your Score</h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Share your score of <span className="font-bold text-orange-500">{score}</span> with friends and family!
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTwitterShare}
                    className={`p-3 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                    }`}
                  >
                    <FaTwitter className="mr-2" /> Twitter
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFacebookShare}
                    className={`p-3 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-blue-900 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <FaFacebook className="mr-2" /> Facebook
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEmailShare}
                    className={`p-3 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <FaEnvelope className="mr-2" /> Email
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className={`p-3 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                    } ${linkCopied ? 'bg-green-500 text-white' : ''}`}
                  >
                    {linkCopied ? (
                      <>
                        <FaCheck className="mr-2" /> Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy className="mr-2" /> Copy Link
                      </>
                    )}
                  </motion.button>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <p className="mb-2 font-medium">Share this message:</p>
                  <p className={`italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    "I scored {score} points on Basketball Trivia! Can you beat my score?"
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SocialFeatures; 