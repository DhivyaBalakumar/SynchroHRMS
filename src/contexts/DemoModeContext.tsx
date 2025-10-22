import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('synchrohr_demo_mode');
    return saved !== null ? JSON.parse(saved) : true; // Default to demo mode
  });

  const toggleDemoMode = () => {
    setIsDemoMode((prev: boolean) => {
      const newMode = !prev;
      localStorage.setItem('synchrohr_demo_mode', JSON.stringify(newMode));
      
      if (!newMode) {
        // Switched to production mode
        toast({
          title: "Production Mode Activated",
          description: "Now showing real data only. Demo data is hidden from all views.",
        });
      } else {
        // Switched to demo mode
        toast({
          title: "Demo Mode Activated",
          description: "Showing both demo and real data for testing purposes.",
        });
      }
      
      // Trigger page reload to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      return newMode;
    });
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
