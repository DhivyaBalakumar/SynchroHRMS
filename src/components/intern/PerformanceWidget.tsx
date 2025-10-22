import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PerformanceWidget = () => {
  const metrics = [
    { label: 'Task Completion', value: 92, target: 90, icon: Target, color: 'text-green-500' },
    { label: 'Punctuality', value: 98, target: 95, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Code Quality', value: 88, target: 85, icon: Star, color: 'text-purple-500' },
    { label: 'Learning Speed', value: 95, target: 80, icon: Zap, color: 'text-yellow-500' },
  ];

  const feedback = [
    {
      mentor: 'Sarah Johnson',
      date: '2025-10-18',
      rating: 5,
      comment: 'Excellent work on the authentication module. Shows great attention to detail!'
    },
    {
      mentor: 'Mike Chen',
      date: '2025-10-15',
      rating: 4,
      comment: 'Good progress. Focus more on code documentation for the next sprint.'
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Performance Analytics</h3>
        <Badge variant="default" className="gap-1">
          <Star className="h-3 w-3" />
          Top 10%
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const isAboveTarget = metric.value >= metric.target;
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-gradient-to-br from-card to-muted/30 border"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${metric.color}`} />
                <Badge variant={isAboveTarget ? 'default' : 'secondary'} className="text-xs">
                  {isAboveTarget ? '✓' : '!'} {metric.target}%
                </Badge>
              </div>
              <p className="text-2xl font-bold mb-1">{metric.value}%</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              
              <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`h-full rounded-full ${
                    isAboveTarget 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Feedback */}
      <div>
        <h4 className="font-semibold mb-3">Recent Mentor Feedback</h4>
        <div className="space-y-3">
          {feedback.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg bg-muted/50 border"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{item.mentor}</p>
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{item.comment}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PerformanceWidget;
