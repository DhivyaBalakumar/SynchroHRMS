import { useDemoMode } from '@/contexts/DemoModeContext';

/**
 * Hook to filter data based on demo mode
 * In production mode, excludes any data with source='demo'
 * In demo mode, includes all data
 */
export const useDemoModeFilter = () => {
  const { isDemoMode } = useDemoMode();

  const applyFilter = <T extends { source?: string }>(data: T[] | null): T[] => {
    if (!data) return [];
    
    // In production mode, filter out demo data
    if (!isDemoMode) {
      return data.filter(item => item.source !== 'demo');
    }
    
    // In demo mode, show all data
    return data;
  };

  const getQueryFilter = () => {
    // Return Supabase query filter for production mode
    if (!isDemoMode) {
      return { source: 'real' };
    }
    return null;
  };

  return {
    applyFilter,
    getQueryFilter,
    isDemoMode,
  };
};
