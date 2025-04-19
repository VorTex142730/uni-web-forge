import React, { createContext, useState, useContext } from 'react';

type SidebarContextType = {
  expanded: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  toggleSidebar: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <SidebarContext.Provider value={{ expanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
