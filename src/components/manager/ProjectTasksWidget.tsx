import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Kanban, Calendar, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';

interface ProjectTasksWidgetProps {
  teamId: string;
}

export const ProjectTasksWidget = ({ teamId }: ProjectTasksWidgetProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const { applyFilter } = useDemoModeFilter();

  useEffect(() => {
    loadProjectData();
  }, [teamId]);

  const loadProjectData = async () => {
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('manager_id', teamId)
      .order('created_at', { ascending: false });

    const filteredProjects = applyFilter(projectsData || []);
    setProjects(filteredProjects);

    if (filteredProjects && filteredProjects.length > 0) {
      const { data: tasksData } = await supabase
        .from('project_tasks')
        .select('*, employees(*)')
        .in('project_id', filteredProjects.map(p => p.id))
        .order('due_date', { ascending: true });

      const filteredTasks = applyFilter(tasksData || []);
      setTasks(filteredTasks);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'review': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done')
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Kanban className="h-5 w-5 text-primary" />
            Projects & Tasks
          </CardTitle>
          <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Projects */}
        <div className="grid grid-cols-2 gap-3">
          {projects.slice(0, 2).map((project) => (
            <div key={project.id} className="bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm truncate">{project.name}</h4>
                <Badge variant="outline" className="text-xs capitalize">
                  {project.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="space-y-3">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium capitalize">{status.replace('_', ' ')}</h4>
                <Badge variant="secondary" className="text-xs">{statusTasks.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {statusTasks.slice(0, 2).map((task) => (
                  <div 
                    key={task.id}
                    className="bg-secondary/40 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate">{task.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), 'MMM d')}
                            </div>
                          )}
                          {task.employees && (
                            <span className="text-xs text-muted-foreground truncate">
                              {task.employees.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Critical Alerts */}
        {tasks.some(t => t.status === 'blocked') && (
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Blocked Tasks Alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tasks.filter(t => t.status === 'blocked').length} task(s) require immediate attention
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
