import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const OnboardingWidget = () => {
  const tasks = [
    { id: 1, title: 'Complete profile setup', status: 'completed', dueDate: '2025-10-15' },
    { id: 2, title: 'Meet your mentor', status: 'completed', dueDate: '2025-10-16' },
    { id: 3, title: 'Review company policies', status: 'in-progress', dueDate: '2025-10-20' },
    { id: 4, title: 'Complete security training', status: 'pending', dueDate: '2025-10-22' },
    { id: 5, title: 'Set up development environment', status: 'pending', dueDate: '2025-10-25' },
  ];

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Onboarding Progress</h3>
        <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
      </div>
      
      <Progress value={progress} className="mb-6" />

      <div className="space-y-3">
        {tasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              task.status === 'completed' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : task.status === 'in-progress'
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-muted'
            }`}
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : task.status === 'in-progress' ? (
              <Clock className="h-5 w-5 text-primary flex-shrink-0 animate-pulse" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{task.title}</p>
              <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default OnboardingWidget;
