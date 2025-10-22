import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, PlayCircle, Square, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const TimeTrackingWidget = () => {
  const [isClocked, setIsClocked] = useState(false);
  const [timeWorked, setTimeWorked] = useState('0:00');

  const weekData = [
    { day: 'Mon', hours: 8.5, status: 'complete' },
    { day: 'Tue', hours: 7.2, status: 'complete' },
    { day: 'Wed', hours: 8.0, status: 'complete' },
    { day: 'Thu', hours: 6.5, status: 'complete' },
    { day: 'Fri', hours: 3.2, status: 'current' },
  ];

  const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Time Tracking</h3>

      {/* Clock In/Out Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-6"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <motion.div
              animate={{ rotate: isClocked ? 360 : 0 }}
              transition={{ duration: 2, repeat: isClocked ? Infinity : 0, ease: "linear" }}
              className={`p-6 rounded-full ${
                isClocked ? 'bg-green-500/20' : 'bg-primary/20'
              }`}
            >
              <Clock className={`h-12 w-12 ${
                isClocked ? 'text-green-500' : 'text-primary'
              }`} />
            </motion.div>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-3xl font-bold">{timeWorked}</p>
          <p className="text-sm text-muted-foreground">Today's time</p>
        </div>

        <Button
          onClick={() => setIsClocked(!isClocked)}
          className={`w-full gap-2 ${
            isClocked 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isClocked ? (
            <>
              <Square className="h-5 w-5" />
              Clock Out
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5" />
              Clock In
            </>
          )}
        </Button>
      </motion.div>

      {/* Weekly Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            This Week
          </h4>
          <Badge variant="secondary">{totalHours.toFixed(1)} hrs</Badge>
        </div>

        <div className="space-y-2">
          {weekData.map((day, idx) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                day.status === 'current'
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50'
              }`}
            >
              <span className="font-medium w-12">{day.day}</span>
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(day.hours / 8) * 100}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
              <span className="font-semibold w-16 text-right">{day.hours}h</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TimeTrackingWidget;
