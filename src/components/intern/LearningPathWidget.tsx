import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PlayCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const LearningPathWidget = () => {
  const modules = [
    { 
      id: 1, 
      title: 'React Fundamentals', 
      progress: 85, 
      status: 'in-progress',
      lessons: 12,
      completed: 10
    },
    { 
      id: 2, 
      title: 'Git & Version Control', 
      progress: 100, 
      status: 'completed',
      lessons: 8,
      completed: 8
    },
    { 
      id: 3, 
      title: 'TypeScript Basics', 
      progress: 60, 
      status: 'in-progress',
      lessons: 10,
      completed: 6
    },
    { 
      id: 4, 
      title: 'API Integration', 
      progress: 0, 
      status: 'locked',
      lessons: 15,
      completed: 0
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Learning Path</h3>
        <Badge variant="secondary" className="gap-1">
          <Award className="h-3 w-3" />
          3 Certificates
        </Badge>
      </div>

      <div className="space-y-4">
        {modules.map((module, idx) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg border transition-all ${
              module.status === 'completed'
                ? 'bg-green-500/5 border-green-500/20'
                : module.status === 'in-progress'
                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                : 'bg-muted/50 border-muted opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  module.status === 'completed' ? 'bg-green-500/20' :
                  module.status === 'in-progress' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <BookOpen className={`h-5 w-5 ${
                    module.status === 'completed' ? 'text-green-500' :
                    module.status === 'in-progress' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {module.completed}/{module.lessons} lessons
                  </p>
                </div>
              </div>
              {module.status === 'completed' && (
                <Badge variant="default" className="bg-green-500">Completed</Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${module.progress}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`h-full rounded-full ${
                    module.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                  }`}
                />
              </div>
              <span className="text-sm font-medium">{module.progress}%</span>
            </div>

            {module.status !== 'locked' && (
              <Button 
                variant={module.status === 'in-progress' ? 'default' : 'outline'} 
                size="sm" 
                className="w-full mt-3 gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {module.status === 'completed' ? 'Review' : 'Continue Learning'}
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default LearningPathWidget;
