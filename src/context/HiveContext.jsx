import { createContext, useState, useContext } from 'react';

const HiveContext = createContext();

export const HiveProvider = ({ children }) => {
  const [isThinking, setIsThinking] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [activeTone, setActiveTone] = useState('Moderate'); // Default

  return (
    <HiveContext.Provider value={{ 
      isThinking, setIsThinking, 
      currentChatId, setCurrentChatId,
      activeTone, setActiveTone 
    }}>
      {children}
    </HiveContext.Provider>
  );
};

export const useHive = () => useContext(HiveContext);