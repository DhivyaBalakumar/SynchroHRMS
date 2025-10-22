import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TeamProjectsWidgetProps {
  teamId: string;
}

export const TeamProjectsWidget = ({ teamId }: TeamProjectsWidgetProps) => {
  // Demo project data for Team API
  const projects = [
    {
      id: '1',
      name: 'API Gateway v2.0',
      status: 'in_progress',
      progress: 68,
      deadline: '2025-11-15',
      priority: 'high',
      lead: 'Sarah Johnson',
      description: 'Redesign and implement new API gateway with improved rate limiting',
      milestones: [
        { name: 'Architecture Design', completed: true },
        { name: 'Core Implementation', completed: true },
        { name: 'Testing & Optimization', completed: false },
        { name: 'Production Deployment', completed: false }
      ]
    },
    {
      id: '2',
      name: 'Payment Integration Module',
      status: 'in_progress',
      progress: 85,
      deadline: '2025-10-28',
      priority: 'critical',
      lead: 'Mike Chen',
      description: 'Integrate Stripe and PayPal payment gateways with comprehensive error handling',
      milestones: [
        { name: 'API Integration', completed: true },
        { name: 'Error Handling', completed: true },
        { name: 'Security Audit', completed: true },
        { name: 'Final Testing', completed: false }
      ]
    },
    {
      id: '3',
      name: 'GraphQL Implementation',
      status: 'planning',
      progress: 25,
      deadline: '2025-12-20',
      priority: 'medium',
      lead: 'Tom Rodriguez',
      description: 'Add GraphQL endpoint alongside REST API for improved data fetching',
      milestones: [
        { name: 'Schema Design', completed: true },
        { name: 'Resolver Implementation', completed: false },
        { name: 'Integration Testing', completed: false },
        { name: 'Documentation', completed: false }
      ]
    },
    {
      id: '4',
      name: 'Monitoring Dashboard',
      status: 'completed',
      progress: 100,
      deadline: '2025-10-10',
      priority: 'medium',
      lead: 'Alex Kumar',
      description: 'Real-time API monitoring and alerting system',
      milestones: [
        { name: 'Dashboard UI', completed: true },
        { name: 'Alert System', completed: true },
        { name: 'Performance Metrics', completed: true },
        { name: 'Documentation', completed: true }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'planning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isUrgent = (deadline: string) => getDaysUntilDeadline(deadline) <= 7;

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Team Projects & Deadlines
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{projects.length} active projects</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent Deadlines Alert */}
        {projects.some(p => isUrgent(p.deadline) && p.status !== 'completed') && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-700 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-700">Urgent Deadlines</p>
              <p className="text-xs text-orange-600 mt-1">
                {projects.filter(p => isUrgent(p.deadline) && p.status !== 'completed').length} project(s) due within 7 days
              </p>
            </div>
          </div>
        )}

        {/* Project List */}
        {projects.map((project) => {
          const daysUntil = getDaysUntilDeadline(project.deadline);
          const isOverdue = daysUntil < 0;
          const completedMilestones = project.milestones.filter(m => m.completed).length;

          return (
            <div 
              key={project.id}
              className="bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-lg p-4 border border-border hover:border-primary/30 transition-all"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{project.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Badge variant="outline" className={`text-xs ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Overall Progress</span>
                  <span className="text-xs font-semibold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Milestones */}
              <div className="bg-secondary/50 rounded p-2 mb-3">
                <p className="text-xs font-medium mb-2 text-muted-foreground">
                  Milestones ({completedMilestones}/{project.milestones.length})
                </p>
                <div className="space-y-1">
                  {project.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 
                        className={`h-3 w-3 ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`} 
                      />
                      <span className={`text-xs ${milestone.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {milestone.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>Lead:</span>
                  <span className="font-medium">{project.lead}</span>
                </div>
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : isUrgent(project.deadline) ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">
                    {isOverdue ? 'Overdue' : `${daysUntil} days left`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
