// DarkModeContext.tsx
import React, { createContext, useState, useContext } from 'react';

const DarkModeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
