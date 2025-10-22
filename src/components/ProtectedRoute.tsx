import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after loading is complete
    if (loading) return;
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    
    if (requiredRole && userRole && !requiredRole.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      navigate(`/dashboard/${userRole}`, { replace: true });
    }
  }, [user, userRole, loading, navigate, requiredRole]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user || (requiredRole && userRole && !requiredRole.includes(userRole))) {
    return null;
  }

  return <>{children}</>;
};
