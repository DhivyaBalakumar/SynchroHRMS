import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  FileVideo,
  Mic
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AIInterviewWidget = () => {
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    inProgress: 0,
  });

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      // Get all interviews with resume data
      const { data: interviewsData, error } = await supabase
        .from('interviews')
        .select(`
          *,
          resumes (
            id,
            candidate_name,
            email,
            source,
            job_roles (title)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter only real candidates
      const realCandidateInterviews = (interviewsData || []).filter(
        (interview: any) => interview.resumes?.source === 'real'
      );

      setInterviews(realCandidateInterviews);

      // Calculate stats
      const scheduled = realCandidateInterviews.filter((i: any) => i.status === 'scheduled').length;
      const completed = realCandidateInterviews.filter((i: any) => i.status === 'completed').length;
      const inProgress = realCandidateInterviews.filter((i: any) => i.status === 'in_progress').length;

      setStats({ scheduled, completed, inProgress });
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interview data',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Interview Management</h3>
            <p className="text-sm text-muted-foreground">Automated video interviews</p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/recruitment/interviews'}
        >
          View All
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500/10 p-4 rounded-lg text-center">
          <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.scheduled}</p>
          <p className="text-xs text-muted-foreground">Scheduled</p>
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-lg text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">{stats.inProgress}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg text-center">
          <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground mb-3">
          Recent Interviews (Real Candidates Only)
        </h4>
        {interviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No interviews scheduled yet</p>
          </div>
        ) : (
          interviews.slice(0, 5).map((interview) => (
            <div
              key={interview.id}
              className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {interview.candidate_name || interview.resumes?.candidate_name}
                  </p>
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                  {interview.ai_score && (
                    <Badge variant="outline">
                      Score: {interview.ai_score}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {interview.resumes?.job_roles?.title || interview.position}
                </p>
                {interview.status === 'completed' && (
                  <div className="flex gap-2 mt-2">
                    {interview.video_url && (
                      <Badge variant="secondary" className="text-xs">
                        <FileVideo className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {interview.audio_url && (
                      <Badge variant="secondary" className="text-xs">
                        <Mic className="h-3 w-3 mr-1" />
                        Audio
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              {interview.status === 'completed' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.location.href = `/recruitment/interviews`}
                >
                  <PlayCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
