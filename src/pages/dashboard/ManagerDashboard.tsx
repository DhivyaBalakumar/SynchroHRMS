import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare, BarChart3, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { TeamRosterWidget } from '@/components/manager/TeamRosterWidget';
import { PerformanceAnalyticsWidget } from '@/components/manager/PerformanceAnalyticsWidget';
import { SalaryInsightsWidget } from '@/components/manager/SalaryInsightsWidget';
import { SkillsManagementWidget } from '@/components/manager/SkillsManagementWidget';
import { ProjectTasksWidget } from '@/components/manager/ProjectTasksWidget';
import { AIInsightsWidget } from '@/components/manager/AIInsightsWidget';
import { FloatingChatbot } from '@/components/FloatingChatbot';

const ManagerDashboard = () => {
  const { user, signOut } = useAuth();
  
  // Dummy data for display
  const manager = {
    id: 'dummy-manager-1',
    full_name: 'John Manager',
    email: user?.email || 'manager@company.com',
    position: 'Team Lead',
    department: 'Engineering'
  };

  const team = {
    id: 'dummy-team-1',
    name: 'Alpha Engineering Team',
    team_leader_id: manager.id
  };

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
              Team Lead Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              {manager.full_name} • {team.name}
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
              <TeamRosterWidget teamId={team.id} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PerformanceAnalyticsWidget teamId={team.id} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SalaryInsightsWidget teamId={team.id} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ProjectTasksWidget teamId={team.id} />
            </motion.div>
          </div>

          {/* Right Column - 1 col */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AIInsightsWidget managerId={manager.id} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SkillsManagementWidget teamId={team.id} />
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
