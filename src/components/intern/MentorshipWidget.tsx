import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Video, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MentorshipWidget = () => {
  const mentor = {
    name: 'Sarah Johnson',
    role: 'Senior Developer',
    avatar: 'SJ',
    status: 'online',
    nextSession: '2025-10-21 10:00 AM',
    unreadMessages: 3
  };

  const community = [
    { name: 'Tech Talks', members: 24, unread: 5 },
    { name: 'Project Help', members: 18, unread: 2 },
    { name: 'Career Advice', members: 31, unread: 0 },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Mentorship & Community</h3>

      {/* Mentor Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mb-6"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {mentor.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">{mentor.name}</h4>
            <p className="text-sm text-muted-foreground">{mentor.role}</p>
            {mentor.unreadMessages > 0 && (
              <Badge variant="default" className="mt-1">
                {mentor.unreadMessages} new messages
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Next check-in: {mentor.nextSession}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Video className="h-4 w-4" />
            Video Call
          </Button>
        </div>
      </motion.div>

      {/* Community Forums */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Intern Community
          </h4>
        </div>

        <div className="space-y-2">
          {community.map((forum, idx) => (
            <motion.div
              key={forum.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div>
                <p className="font-medium">{forum.name}</p>
                <p className="text-sm text-muted-foreground">{forum.members} members</p>
              </div>
              {forum.unread > 0 && (
                <Badge variant="default" className="bg-primary">
                  {forum.unread}
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MentorshipWidget;
