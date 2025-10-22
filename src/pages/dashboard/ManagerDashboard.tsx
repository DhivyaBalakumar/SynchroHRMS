import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare, BarChart3, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { TeamRosterWidget } from '@/components/manager/TeamRosterWidget';
import { PerformanceAnalyticsWidget } from '@/components/manager/PerformanceAnalyticsWidget';
import { SalaryInsightsWidget } from '@/components/manager/SalaryInsightsWidget';
import { SkillsManagementWidget } from '@/components/manager/SkillsManagementWidget';
import { ProjectTasksWidget } from '@/components/manager/ProjectTasksWidget';
import { AIInsightsWidget } from '@/components/manager/AIInsightsWidget';
import { FloatingChatbot } from '@/components/FloatingChatbot';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const ManagerDashboard = () => {
  const { user, signOut } = useAuth();
  const [managerId, setManagerId] = useState<string | null>(null);
  
  // Fetch manager profile
  const { data: manager, isLoading: loadingManager } = useQuery({
    queryKey: ['manager-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, email, position, departments(name)')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setManagerId(data.id);
      return data;
    },
    enabled: !!user?.id
  });

  // Real-time updates for team changes
  useEffect(() => {
    if (!managerId) return;

    const channel = supabase
      .channel('manager-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `manager_id=eq.${managerId}`
        },
        () => {
          // Trigger re-fetch of team data
          console.log('Team member update detected');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        () => {
          console.log('Employee update detected');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [managerId]);

  if (loadingManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-20 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Use sample data if no manager record found
  const displayManager = manager || {
    id: user?.id || 'sample',
    full_name: user?.email?.split('@')[0] || 'Manager',
    position: 'Engineering Manager',
    email: user?.email || 'manager@synchrohr.com',
    departments: { name: 'Engineering' }
  };

  const displayManagerId = managerId || user?.id || 'sample';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {displayManager.position || 'Manager'} Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              {displayManager.full_name} • {displayManager.departments?.name || 'Department'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Team Chat</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Reports</span>
            </Button>
            <Button onClick={signOut} variant="outline" size="sm" className="text-xs md:text-sm">
              <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - 2 cols */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TeamRosterWidget teamId={displayManagerId} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PerformanceAnalyticsWidget teamId={displayManagerId} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SalaryInsightsWidget teamId={displayManagerId} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ProjectTasksWidget managerId={displayManagerId} />
            </motion.div>
          </div>

          {/* Right Column - 1 col */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AIInsightsWidget managerId={displayManagerId} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SkillsManagementWidget teamId={displayManagerId} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default ManagerDashboard;
