import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const NavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle page visibility changes (detects refresh/reload)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const wasReloaded = sessionStorage.getItem('navigation_check');
        
        // If this is a protected route and page was reloaded, go to home
        if (!wasReloaded && location.pathname !== '/' && 
            !location.pathname.startsWith('/jobs') &&
            !location.pathname.startsWith('/interview') &&
            !location.pathname.startsWith('/demo')) {
          // Mark that we've checked
          sessionStorage.setItem('navigation_check', 'true');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set navigation check on mount
    sessionStorage.setItem('navigation_check', 'true');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, location]);

  return null;
};
