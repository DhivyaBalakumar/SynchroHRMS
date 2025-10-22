import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const OnboardingManagementWidget = () => {
  const { data: stats } = useQuery({
    queryKey: ['onboarding-stats'],
    queryFn: async () => {
      const { data: workflows } = await supabase
        .from('onboarding_workflows')
        .select(`
          *,
          employees (
            full_name,
            position,
            hire_date
          ),
          onboarding_tasks (
            id,
            status
          )
        `);

      if (!workflows) return null;

      const total = workflows.length;
      const completed = workflows.filter(w => w.status === 'completed').length;
      const inProgress = workflows.filter(w => w.status === 'in_progress').length;
      const notStarted = workflows.filter(w => w.status === 'not_started').length;

      // Calculate average completion time
      const completedWorkflows = workflows.filter(w => w.completed_at && w.started_at);
      const avgDays = completedWorkflows.length > 0
        ? completedWorkflows.reduce((sum, w) => {
            const days = Math.ceil(
              (new Date(w.completed_at).getTime() - new Date(w.started_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / completedWorkflows.length
        : 0;

      return {
        total,
        completed,
        inProgress,
        notStarted,
        avgCompletionDays: Math.round(avgDays),
        recentWorkflows: workflows.slice(0, 5)
      };
    }
  });

  const statCards = [
    { 
      icon: Users, 
      label: 'Total Onboarding', 
      value: stats?.total || 0, 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      icon: CheckCircle, 
      label: 'Completed', 
      value: stats?.completed || 0, 
      color: 'from-green-500 to-green-600' 
    },
    { 
      icon: Clock, 
      label: 'In Progress', 
      value: stats?.inProgress || 0, 
      color: 'from-yellow-500 to-yellow-600' 
    },
    { 
      icon: TrendingUp, 
      label: 'Avg. Completion', 
      value: `${stats?.avgCompletionDays || 0}d`, 
      color: 'from-purple-500 to-purple-600' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Onboarding Workflows */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Onboarding Workflows</h3>
        <div className="space-y-3">
          {stats?.recentWorkflows.map((workflow: any, index: number) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{workflow.employees?.full_name}</p>
                  <Badge variant={
                    workflow.status === 'completed' ? 'default' :
                    workflow.status === 'in_progress' ? 'secondary' :
                    'outline'
                  }>
                    {workflow.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {workflow.employees?.position} • Hired: {new Date(workflow.employees?.hire_date).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{workflow.progress_percentage}%</span>
                  </div>
                  <Progress value={workflow.progress_percentage} className="h-2" />
                </div>
              </div>
            </motion.div>
          ))}

          {(!stats?.recentWorkflows || stats.recentWorkflows.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No onboarding workflows yet</p>
              <p className="text-sm">New workflows are created automatically when employees are added</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingManagementWidget;