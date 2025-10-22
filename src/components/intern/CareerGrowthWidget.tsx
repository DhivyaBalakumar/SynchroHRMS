import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Award, Users, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const CareerGrowthWidget = () => {
  const opportunities = [
    {
      title: 'Junior Frontend Developer',
      department: 'Engineering',
      type: 'Full-time',
      posted: '2 days ago',
      match: 95
    },
    {
      title: 'Product Designer Intern',
      department: 'Design',
      type: 'Internship Extension',
      posted: '1 week ago',
      match: 78
    },
  ];

  const events = [
    {
      title: 'Tech Career Fair 2025',
      date: '2025-11-15',
      attendees: 150,
      registered: false
    },
    {
      title: 'Women in Tech Meetup',
      date: '2025-10-28',
      attendees: 45,
      registered: true
    },
  ];

  const skills = [
    { name: 'React', level: 'Advanced' },
    { name: 'TypeScript', level: 'Intermediate' },
    { name: 'Git', level: 'Advanced' },
    { name: 'API Design', level: 'Beginner' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Career Growth</h3>

      {/* Profile Skills */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Your Skills Profile
        </h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Badge variant="secondary" className="gap-2">
                {skill.name}
                <span className="text-xs opacity-70">• {skill.level}</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Job Opportunities */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Internal Opportunities
        </h4>
        <div className="space-y-3">
          {opportunities.map((job, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-semibold">{job.title}</h5>
                  <p className="text-sm text-muted-foreground">{job.department} • {job.type}</p>
                </div>
                <Badge 
                  variant="default" 
                  className={job.match >= 90 ? 'bg-green-500' : 'bg-primary'}
                >
                  {job.match}% Match
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{job.posted}</p>
              <Button size="sm" className="w-full gap-2">
                View & Apply
                <ExternalLink className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Networking Events */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Networking Events
        </h4>
        <div className="space-y-3">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-lg border ${
                event.registered 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                {event.registered && (
                  <Badge variant="default" className="bg-green-500">Registered</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{event.attendees} attendees</p>
              {!event.registered && (
                <Button size="sm" variant="outline" className="w-full">
                  Sign Up
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CareerGrowthWidget;
