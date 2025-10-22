import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import AICareerCoach from '@/components/career/AICareerCoach';

const CareerCoachPage = () => {
  const navigate = useNavigate();
  const { user, signOut, userRole } = useAuth();

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'employee': return '/dashboard/employee';
      case 'intern': return '/dashboard/intern';
      case 'manager': return '/dashboard/manager';
      case 'hr': return '/dashboard/hr';
      case 'senior_manager': return '/dashboard/senior_manager';
      case 'admin': return '/dashboard/admin';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(getDashboardRoute())}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold">AI Career Coach</h1>
              <p className="text-muted-foreground">
                {user?.email} • Personalized Career Development
              </p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Career Coach Component */}
        <AICareerCoach />
      </div>
    </div>
  );
};

export default CareerCoachPage;