import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Video, FileText, Calendar, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useDemoModeFilter } from '@/hooks/useDemoModeFilter';
import { DemoModeToggle } from '@/components/DemoModeToggle';

type PipelineStage = 'applicants' | 'selected' | 'rejected';

export const PipelineView = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Record<PipelineStage, any[]>>({
    applicants: [],
    selected: [],
    rejected: [],
  });
  const { toast } = useToast();
  const { applyFilter, isDemoMode } = useDemoModeFilter();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);

    let query = supabase
      .from('resumes')
      .select('*, job_roles(title, department), interview_tokens(token, expires_at, interview_completed)')
      .order('created_at', { ascending: false });

    // Filter out demo data in production mode
    if (!isDemoMode) {
      query = query.neq('source', 'demo');
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load candidates',
        variant: 'destructive',
      });
    } else {
      // Apply additional client-side filter for safety
      const filteredData = applyFilter(data || []);
      
      const grouped: Record<PipelineStage, any[]> = {
        applicants: [],
        selected: [],
        rejected: [],
      };

      filteredData.forEach((candidate: any) => {
        if (candidate.screening_status === 'rejected') {
          grouped.rejected.push(candidate);
        } else if (candidate.screening_status === 'selected') {
          grouped.selected.push(candidate);
        } else {
          grouped.applicants.push(candidate);
        }
      });

      setCandidates(grouped);
    }

    setLoading(false);
  };

  const getStageColor = (stage: PipelineStage) => {
    const colors = {
      applicants: 'border-blue-500',
      selected: 'border-green-500',
      rejected: 'border-red-500',
    };
    return colors[stage];
  };

  const getStageTitle = (stage: PipelineStage) => {
    const titles = {
      applicants: 'Applicants',
      selected: 'Selected / Active',
      rejected: 'Rejected / Inactive',
    };
    return titles[stage];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Candidate Pipeline</h1>
              <p className="text-muted-foreground">
                Visual overview of candidate journey
              </p>
            </div>
            <DemoModeToggle />
          </div>
          
          {/* Production Mode Banner */}
          {!isDemoMode && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                  Production mode is active.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Only real data from your database will be displayed. All demo/sample data is hidden.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(candidates) as PipelineStage[]).map((stage) => (
            <div key={stage} className="space-y-4">
              <Card className={`p-4 border-t-4 ${getStageColor(stage)}`}>
                <h2 className="text-xl font-bold mb-1">{getStageTitle(stage)}</h2>
                <p className="text-sm text-muted-foreground">
                  {candidates[stage].length} candidate{candidates[stage].length !== 1 ? 's' : ''}
                </p>
              </Card>

              <div className="space-y-3">
                {candidates[stage].map((candidate, idx) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer">
                      <h3 className="font-bold mb-2">{candidate.candidate_name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {candidate.job_roles?.title}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {candidate.source === 'real' && (
                          <Badge variant="default" className="bg-blue-600">
                            Real Applicant
                          </Badge>
                        )}
                        {candidate.ai_score && (
                          <Badge variant="outline">
                            Score: {candidate.ai_score}/100
                          </Badge>
                        )}
                        {candidate.selection_email_sent && (
                          <Badge variant="default" className="bg-green-600">
                            <Mail className="h-3 w-3 mr-1" />
                            Selection Sent
                          </Badge>
                        )}
                        {candidate.interview_scheduled_email_sent && (
                          <Badge variant="default" className="bg-blue-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            Interview Scheduled
                          </Badge>
                        )}
                        {candidate.rejection_email_sent && (
                          <Badge variant="destructive">
                            <Mail className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        {candidate.interview_tokens?.length > 0 && (
                          <Badge variant="secondary">
                            <Video className="h-3 w-3 mr-1" />
                            {candidate.interview_tokens[0].interview_completed ? 'Completed' : 'Invited'}
                          </Badge>
                        )}
                        {candidate.file_url && (
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            Resume
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Applied: {new Date(candidate.created_at).toLocaleDateString()}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineView;
