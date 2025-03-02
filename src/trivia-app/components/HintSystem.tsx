import React, { useState } from 'react';
import { FaLightbulb, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface HintSystemProps {
  question: string;
  correctAnswer: string;
  options: string[];
  darkMode: boolean;
  hintsUsed: number;
  onUseHint: (hintText: string) => void;
}

const HintSystem: React.FC<HintSystemProps> = ({
  question,
  correctAnswer,
  options,
  darkMode,
  hintsUsed,
  onUseHint,
}) => {
  const [showHintOptions, setShowHintOptions] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  const generateHint = (type: 'general' | 'elimination' | 'clue') => {
    setIsGeneratingHint(true);
    
    // Simulate hint generation delay
    setTimeout(() => {
      let hintText = '';
      
      switch (type) {
        case 'general':
          hintText = `This question is about ${question.split(' ').slice(0, 3).join(' ')}...`;
          break;
        case 'elimination':
          // Find a wrong answer to eliminate
          const wrongOptions = options.filter(option => option !== correctAnswer);
          const eliminatedOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
          hintText = `You can eliminate "${eliminatedOption}" as a possible answer.`;
          break;
        case 'clue':
          // Give a clue about the correct answer without revealing it
          hintText = `The correct answer contains the letter "${correctAnswer.charAt(Math.floor(Math.random() * correctAnswer.length))}".`;
          break;
      }
      
      setIsGeneratingHint(false);
      setShowHintOptions(false);
      onUseHint(hintText);
    }, 1000);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHintOptions(!showHintOptions)}
        className={`flex items-center justify-center p-2 rounded-full ${
          darkMode ? 'bg-amber-700 text-amber-200' : 'bg-amber-200 text-amber-700'
        } hover:bg-opacity-80`}
        aria-label="Hint"
      >
        <FaLightbulb size={20} />
      </motion.button>

      <AnimatePresence>
        {showHintOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 p-4 rounded-lg shadow-lg z-20 w-64 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Hint Options</h3>
              <button
                onClick={() => setShowHintOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-sm mb-3">
              Using a hint will cost 5 points. You've used {hintsUsed} hints so far.
            </p>
            
            {isGeneratingHint ? (
              <div className="flex justify-center items-center py-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                <span className="ml-2">Generating hint...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => generateHint('general')}
                  className={`w-full py-2 px-3 rounded text-left text-sm ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  General Hint
                </button>
                <button
                  onClick={() => generateHint('elimination')}
                  className={`w-full py-2 px-3 rounded text-left text-sm ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Eliminate an Answer
                </button>
                <button
                  onClick={() => generateHint('clue')}
                  className={`w-full py-2 px-3 rounded text-left text-sm ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Letter Clue
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintSystem; 