import { useState, useEffect } from 'react';

interface UseDarkModeReturn {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

/**
 * Custom hook for managing dark mode state across the application
 * Syncs with localStorage and system preferences
 */
export function useDarkMode(): UseDarkModeReturn {
  // Use state to track dark mode preference
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    // Check for user preference in localStorage
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };

    // Add listener for system preference changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'darkMode',
      newValue: String(newMode)
    }));
  };

  // Function to set dark mode to a specific value
  const setDarkModeValue = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('darkMode', String(value));
    
    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'darkMode',
      newValue: String(value)
    }));
  };

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode: setDarkModeValue
  };
}

export default useDarkMode; 