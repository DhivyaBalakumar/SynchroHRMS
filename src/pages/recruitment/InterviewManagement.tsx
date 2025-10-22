import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Video, FileText, Brain, Clock, CheckCircle2, XCircle, Play, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InterviewDetailView } from '@/components/InterviewDetailView';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';
import { DemoModeToggle } from '@/components/DemoModeToggle';

export const InterviewManagement = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const { toast } = useToast();
  const { isDemoMode } = useDemoModeFilter();

  useEffect(() => {
    loadData();
  }, [selectedJobRole, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    
    // Load job roles
    const { data: rolesData } = await supabase
      .from('job_roles')
      .select('*')
      .eq('status', 'active');
    
    if (rolesData) setJobRoles(rolesData);

    // Load interviews with resume and job role info
    let query = supabase
      .from('interviews')
      .select('*, resumes(id, candidate_name, email, job_role_id, source, job_roles(title, department))')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as 'cancelled' | 'completed' | 'in_progress' | 'scheduled');
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load interviews',
        variant: 'destructive',
      });
    } else {
      let filteredData = data || [];
      
      // Filter out demo interviews in production mode
      if (!isDemoMode) {
        filteredData = filteredData.filter(
          (interview: any) => interview.resumes?.source !== 'demo'
        );
      }
      
      if (selectedJobRole !== 'all') {
        filteredData = filteredData.filter(
          (interview: any) => interview.resumes?.job_role_id === selectedJobRole
        );
      }
      
      setInterviews(filteredData);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      scheduled: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return variants[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Interview Management</h1>
              <p className="text-muted-foreground">
                View and manage all AI video interviews
              </p>
            </div>
            <DemoModeToggle />
          </div>
          
          {/* Production Mode Banner */}
          {!isDemoMode && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3 mb-6">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                  Production mode is active.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Only real interviews from actual applicants will be displayed. Demo interviews are hidden.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {jobRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title} - {role.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : interviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No interviews found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Card key={interview.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">
                        {interview.candidate_name || interview.resumes?.candidate_name}
                      </h3>
                      <Badge className={getStatusBadge(interview.status)}>
                        {interview.status}
                      </Badge>
                      {interview.ai_score && (
                        <Badge variant="outline">
                          AI Score: {interview.ai_score}/100
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      <p>{interview.resumes?.email}</p>
                      <p>Position: {interview.resumes?.job_roles?.title}</p>
                      <p className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {interview.scheduled_at ? 
                          new Date(interview.scheduled_at).toLocaleString() : 
                          new Date(interview.created_at).toLocaleString()
                        }
                      </p>
                    </div>

                    {interview.ai_summary && (
                      <div className="bg-secondary/20 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">AI Summary</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {interview.ai_summary}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {interview.video_url && (
                        <Badge variant="secondary">
                          <Video className="h-3 w-3 mr-1" />
                          Video Available
                        </Badge>
                      )}
                      {interview.transcript && (
                        <Badge variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          Transcript Available
                        </Badge>
                      )}
                      {interview.duration_seconds && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(interview.duration_seconds / 60)}m {interview.duration_seconds % 60}s
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => setSelectedInterview(interview)}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedInterview && (
        <InterviewDetailView
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

export default InterviewManagement;
