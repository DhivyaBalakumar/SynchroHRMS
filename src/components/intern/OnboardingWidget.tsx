import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const OnboardingWidget = () => {
  const { user } = useAuth();

  // Fetch employee and workflow data
  const { data: workflowData, refetch } = useQuery({
    queryKey: ['onboarding-workflow', user?.id],
    queryFn: async () => {
      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!employee) return null;

      // Get workflow
      const { data: workflow } = await supabase
        .from('onboarding_workflows')
        .select('*, onboarding_tasks(*)')
        .eq('employee_id', employee.id)
        .single();

      return workflow;
    },
    enabled: !!user,
  });

  const tasks = workflowData?.onboarding_tasks || [];
  const progress = workflowData?.progress_percentage || 0;

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    const { error } = await supabase
      .from('onboarding_tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update task');
      return;
    }

    toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
    refetch();
  };

  if (!workflowData) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p>No onboarding workflow found. Contact HR to set up your onboarding.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Onboarding Progress</h3>
        <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
      </div>
      
      <Progress value={progress} className="mb-6" />

      <div className="space-y-3">
        {tasks
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((task: any, idx: number) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  task.status === 'completed' 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : task.status === 'in_progress'
                    ? 'bg-primary/10 border-2 border-primary'
                    : isOverdue
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-muted'
                }`}
                onClick={() => handleTaskToggle(task.id, task.status)}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 animate-pulse" />
                ) : isOverdue ? (
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                  {task.due_date && (
                    <p className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center"
        >
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-500">Onboarding Complete! 🎉</p>
          <p className="text-sm text-muted-foreground">You've completed all onboarding tasks</p>
        </motion.div>
      )}
    </Card>
  );
};

export default OnboardingWidget;
