import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckSquare, MessageCircle, TrendingUp, Award, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import OnboardingWidget from '@/components/intern/OnboardingWidget';
import LearningPathWidget from '@/components/intern/LearningPathWidget';
import TaskProjectWidget from '@/components/intern/TaskProjectWidget';
import MentorshipWidget from '@/components/intern/MentorshipWidget';
import TimeTrackingWidget from '@/components/intern/TimeTrackingWidget';
import PerformanceWidget from '@/components/intern/PerformanceWidget';
import CareerGrowthWidget from '@/components/intern/CareerGrowthWidget';
import RecognitionWidget from '@/components/intern/RecognitionWidget';
import { FloatingChatbot } from '@/components/FloatingChatbot';

const InternDashboard = () => {
  const { user, signOut } = useAuth();

  const stats = [
    { label: 'Onboarding Progress', value: '75%', Icon: CheckSquare, color: 'text-primary' },
    { label: 'Active Tasks', value: '3', Icon: MessageCircle, color: 'text-secondary' },
    { label: 'Learning Modules', value: '12', Icon: TrendingUp, color: 'text-accent' },
    { label: 'Points Earned', value: '2,720', Icon: Award, color: 'text-primary-glow' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Intern Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Your personalized learning journey 🚀</p>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.Icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all border-primary/10 hover:border-primary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10`}>
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OnboardingWidget />
          <LearningPathWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TaskProjectWidget />
          </div>
          <TimeTrackingWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MentorshipWidget />
          <PerformanceWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CareerGrowthWidget />
          <RecognitionWidget />
        </div>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default InternDashboard;
