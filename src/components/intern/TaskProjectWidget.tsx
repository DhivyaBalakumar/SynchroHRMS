import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Upload, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskProjectWidget = () => {
  const tasks = [
    {
      id: 1,
      title: 'Build User Authentication Flow',
      project: 'SynchroHR Mobile App',
      priority: 'high',
      dueDate: '2025-10-22',
      progress: 65,
      status: 'in-progress',
      feedback: 2
    },
    {
      id: 2,
      title: 'Design Database Schema',
      project: 'Inventory System',
      priority: 'medium',
      dueDate: '2025-10-25',
      progress: 30,
      status: 'in-progress',
      feedback: 0
    },
    {
      id: 3,
      title: 'Write API Documentation',
      project: 'SynchroHR API',
      priority: 'low',
      dueDate: '2025-10-28',
      progress: 0,
      status: 'pending',
      feedback: 0
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">My Tasks & Projects</h3>
        <Badge variant="secondary">{tasks.length} Active</Badge>
      </div>

      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{task.title}</h4>
                <p className="text-sm text-muted-foreground">{task.project}</p>
              </div>
              <Badge className={`${getPriorityColor(task.priority)} border`}>
                {task.priority}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-primary-glow"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due {task.dueDate}</span>
                </div>
                {task.feedback > 0 && (
                  <div className="flex items-center gap-1 text-primary">
                    <MessageSquare className="h-4 w-4" />
                    <span>{task.feedback} feedback</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Work
                </Button>
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default TaskProjectWidget;
