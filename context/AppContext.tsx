import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of your context data
interface AppContextType {
  userName: string;
}

// Create the context with a default value
export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// Create a provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userName, setUserName] = useState<string>('Guest');

  return (
    <AppContext.Provider value={{ userName }}>
      {children}
    </AppContext.Provider>
  );
};

