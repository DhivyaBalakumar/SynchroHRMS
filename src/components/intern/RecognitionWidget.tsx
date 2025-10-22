import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Star, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const RecognitionWidget = () => {
  const badges = [
    { id: 1, name: 'Quick Learner', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/20', earned: true },
    { id: 2, name: 'Team Player', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/20', earned: true },
    { id: 3, name: 'Code Master', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/20', earned: true },
    { id: 4, name: 'Goal Crusher', icon: Target, color: 'text-green-500', bg: 'bg-green-500/20', earned: false },
    { id: 5, name: 'Innovation Star', icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-500/20', earned: false },
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Kumar', points: 2850, avatar: 'AK' },
    { rank: 2, name: 'You', points: 2720, avatar: 'ME', isUser: true },
    { rank: 3, name: 'Emma Wilson', points: 2690, avatar: 'EW' },
    { rank: 4, name: 'David Lee', points: 2580, avatar: 'DL' },
    { rank: 5, name: 'Sarah Chen', points: 2450, avatar: 'SC' },
  ];

  const achievements = [
    { title: 'Completed 10 Tasks', date: '2025-10-18', points: 100 },
    { title: 'Perfect Attendance Week', date: '2025-10-15', points: 50 },
    { title: 'First Code Review', date: '2025-10-12', points: 75 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Recognition & Achievements</h3>
        <Badge variant="default" className="gap-1 text-lg px-3 py-1">
          <Trophy className="h-4 w-4" />
          2,720 pts
        </Badge>
      </div>

      {/* Badges Section */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Your Badges</h4>
        <div className="grid grid-cols-5 gap-3">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: idx * 0.1,
                  type: 'spring',
                  stiffness: 200 
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-lg ${
                  badge.earned 
                    ? `${badge.bg} border border-current` 
                    : 'bg-muted/50 opacity-40'
                }`}
              >
                <Icon className={`h-8 w-8 ${badge.earned ? badge.color : 'text-muted-foreground'}`} />
                <p className="text-xs font-medium text-center mt-1 leading-tight">
                  {badge.name}
                </p>
                {badge.earned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-xs"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Intern Leaderboard</h4>
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                entry.isUser
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-muted/50'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                entry.rank === 1 ? 'bg-yellow-500 text-yellow-950' :
                entry.rank === 2 ? 'bg-gray-400 text-gray-900' :
                entry.rank === 3 ? 'bg-amber-600 text-amber-950' :
                'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${entry.isUser ? 'text-primary' : ''}`}>
                  {entry.name}
                </p>
              </div>
              <Badge variant={entry.isUser ? 'default' : 'secondary'}>
                {entry.points} pts
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h4 className="font-semibold mb-3">Recent Achievements</h4>
        <div className="space-y-2">
          {achievements.map((achievement, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <div>
                <p className="font-medium text-sm">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.date}</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                +{achievement.points}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RecognitionWidget;
