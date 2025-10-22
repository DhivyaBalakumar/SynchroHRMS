import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  TrendingUp,
  Brain,
  Mic,
  Video,
  BarChart3,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InterviewReportDetail } from './InterviewReportDetail';

export const InterviewReportsSection = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Get all completed interviews with analysis
      const { data: interviews, error } = await supabase
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
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Filter only interviews with AI scores
      const analyzedInterviews = (interviews || []).filter(
        (interview: any) => interview.ai_score != null
      );

      setReports(analyzedInterviews);
    } catch (error: any) {
      console.error('Error loading reports:', error);
      // Don't show error toast if it's just no data
      if (error.message && !error.message.includes('no rows')) {
        toast({
          title: 'Error',
          description: 'Failed to load interview reports',
          variant: 'destructive',
        });
      }
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.5) return 'text-green-500';
    if (score >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Interview Analysis Reports</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive AI-powered analysis with sentiment & emotion detection
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No completed interview analyses yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((interview) => (
              <div
                key={interview.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReport(interview)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg">
                        {interview.candidate_name || interview.resumes?.candidate_name}
                      </h4>
                      {interview.ai_score && (
                        <Badge className={getScoreColor(interview.ai_score)}>
                          Score: {Math.round(interview.ai_score)}/100
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {interview.resumes?.job_roles?.title || interview.position}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      Completed: {new Date(interview.completed_at || interview.created_at).toLocaleString()}
                    </p>

                    {interview.ai_summary && (
                      <p className="text-sm mb-3 line-clamp-2">{interview.ai_summary}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {interview.video_url && (
                        <Badge variant="secondary" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video Analysis
                        </Badge>
                      )}
                      {interview.audio_url && (
                        <Badge variant="secondary" className="text-xs">
                          <Mic className="h-3 w-3 mr-1" />
                          Audio Analysis
                        </Badge>
                      )}
                      {interview.transcript && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Transcript
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        Emotion Analysis
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Sentiment Analysis
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedReport && (
        <InterviewReportDetail
          interview={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
};
