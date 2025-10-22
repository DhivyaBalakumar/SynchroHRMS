import { renderHook } from '@testing-library/react';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import { ReactNode } from 'react';

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

describe('useDemoModeFilter Hook', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DemoModeProvider>{children}</DemoModeProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('should filter out demo data in production mode', () => {
    localStorage.setItem('synchrohr_demo_mode', JSON.stringify(false));

    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    const testData = [
      { id: '1', name: 'Real User', source: 'real' },
      { id: '2', name: 'Demo User', source: 'demo' },
      { id: '3', name: 'Real User 2', source: 'real' },
    ];

    const filtered = result.current.applyFilter(testData);

    expect(filtered).toHaveLength(2);
    expect(filtered.every(item => item.source !== 'demo')).toBe(true);
  });

  it('should include all data in demo mode', () => {
    localStorage.setItem('synchrohr_demo_mode', JSON.stringify(true));

    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    const testData = [
      { id: '1', name: 'Real User', source: 'real' },
      { id: '2', name: 'Demo User', source: 'demo' },
      { id: '3', name: 'Real User 2', source: 'real' },
    ];

    const filtered = result.current.applyFilter(testData);

    expect(filtered).toHaveLength(3);
  });

  it('should handle null data', () => {
    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    const filtered = result.current.applyFilter(null);

    expect(filtered).toEqual([]);
  });

  it('should handle empty array', () => {
    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    const filtered = result.current.applyFilter([]);

    expect(filtered).toEqual([]);
  });

  it('should return correct query filter for production mode', () => {
    localStorage.setItem('synchrohr_demo_mode', JSON.stringify(false));

    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    const queryFilter = result.current.getQueryFilter();

    expect(queryFilter).toEqual({ source: 'real' });
  });

  it('should return null query filter for demo mode', () => {
    localStorage.setItem('synchrohr_demo_mode', JSON.stringify(true));

    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    const queryFilter = result.current.getQueryFilter();

    expect(queryFilter).toBeNull();
  });

  it('should reflect isDemoMode state correctly', () => {
    localStorage.setItem('synchrohr_demo_mode', JSON.stringify(false));

    const { result } = renderHook(() => useDemoModeFilter(), { wrapper });

    expect(result.current.isDemoMode).toBe(false);
  });
});
