import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  Star,
  TrendingUp,
  Filter,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ResumeScreening = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedJobRole, setSelectedJobRole] = useState<string>('all');
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedJobRole, activeTab]);

  const loadData = async () => {
    setLoading(true);
    
    // Load job roles
    const { data: rolesData } = await supabase
      .from('job_roles')
      .select('*')
      .eq('status', 'active');
    
    if (rolesData) setJobRoles(rolesData);

    // Load resumes based on filters with interview tokens
    let query = supabase
      .from('resumes')
      .select('*, job_roles(title, department), interview_tokens(token, expires_at, interview_completed)')
      .order('created_at', { ascending: false });

    if (selectedJobRole !== 'all') {
      query = query.eq('job_role_id', selectedJobRole);
    }

    if (activeTab === 'pending') {
      query = query.eq('screening_status', 'pending');
    } else if (activeTab === 'selected') {
      query = query.eq('screening_status', 'selected');
    } else if (activeTab === 'rejected') {
      query = query.eq('screening_status', 'rejected');
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load resumes',
        variant: 'destructive',
      });
    } else {
      setResumes(data || []);
    }

    setLoading(false);
  };

  const runAIScreening = async (resumeId: string) => {
    setProcessing(resumeId);

    try {
      const resume = resumes.find(r => r.id === resumeId);

      // Skip AI screening for demo data
      if (resume?.source === 'demo') {
        toast({
          title: 'Demo Data',
          description: 'Cannot process demo applicants. Only real applicants are screened.',
          variant: 'destructive',
        });
        setProcessing(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-resume-screening', {
        body: {
          resume_id: resumeId,
          job_role_id: resume?.job_role_id,
        },
      });

      if (error) throw error;

      toast({
        title: data.status === 'selected' ? 'Candidate Selected!' : 'Candidate Rejected',
        description: `AI Score: ${data.analysis.ai_score} | ATS: ${data.analysis.ats_score} | Email sent automatically`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: 'Screening Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleManualDecision = async (resumeId: string, decision: 'selected' | 'rejected') => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;

    // Skip email sending for demo data
    if (resume.source === 'demo') {
      toast({
        title: 'Demo Data',
        description: 'Cannot process demo applicants. Only real applicants can be selected/rejected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Update resume status
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          screening_status: decision,
          manual_override: true,
          pipeline_stage: decision === 'selected' ? 'selected' : 'rejected',
        })
        .eq('id', resumeId);

      if (updateError) throw updateError;

      // Log pipeline transition
      await supabase.from('pipeline_audit_logs').insert({
        action: `Manual ${decision} by HR`,
        details: { from_stage: 'screening', to_stage: decision === 'selected' ? 'selected' : 'rejected' }
      });

      // If selected, send immediate selection confirmation email
      if (decision === 'selected') {
        // Send selection email immediately
        const { error: selectionEmailError } = await supabase.functions.invoke(
          'send-selection-email',
          {
            body: {
              candidateName: resume.candidate_name,
              candidateEmail: resume.email,
              jobTitle: resume.job_roles?.title || resume.position_applied,
            },
          }
        );

        if (selectionEmailError) throw selectionEmailError;

        // Mark selection email as sent
        await supabase
          .from('resumes')
          .update({ selection_email_sent: true })
          .eq('id', resumeId);

        // Then trigger automated interview scheduling with 1 hour delay
        const { error: scheduleError } = await supabase.functions.invoke(
          'schedule-automated-interview',
          {
            body: {
              resumeId,
              candidateName: resume.candidate_name,
              candidateEmail: resume.email,
              jobTitle: resume.job_roles?.title || resume.position_applied,
              delayHours: 1, // 1 hour delay before sending interview invitation
            },
          }
        );

        if (scheduleError) throw scheduleError;

        toast({
          title: 'Candidate Selected',
          description: 'Selection confirmation email sent. AI interview invitation will be sent in 1 hour.',
        });
      } else {
        // Send rejection email immediately
        await supabase.functions.invoke('send-rejection-email', {
          body: {
            candidateName: resume.candidate_name,
            candidateEmail: resume.email,
            jobTitle: resume.job_roles?.title || resume.position_applied,
          },
        });

        // Mark as sent - using selection_email_sent for now
        await supabase
          .from('resumes')
          .update({ selection_email_sent: true })
          .eq('id', resumeId);

        toast({
          title: 'Candidate Rejected',
          description: 'Rejection email sent',
        });
      }

      loadData();
    } catch (error: any) {
      console.error('Decision error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process decision',
        variant: 'destructive',
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (recommendation: string) => {
    const colors: any = {
      strongly_recommended: 'bg-green-500',
      recommended: 'bg-blue-500',
      maybe: 'bg-yellow-500',
      not_recommended: 'bg-red-500',
    };
    return colors[recommendation] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resume Screening</h1>
          <p className="text-muted-foreground">
            Fully automated AI-driven screening & evaluation
          </p>
        </div>

        <div className="mb-6 flex gap-4 items-center">
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="selected">Selected</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resumes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No resumes found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{resume.candidate_name}</h3>
                      {resume.source === 'real' && (
                        <Badge variant="default" className="bg-blue-600">
                          Real Applicant
                        </Badge>
                      )}
                      {resume.ai_score && (
                        <Badge className={getScoreColor(resume.ai_score)}>
                          <Star className="h-4 w-4 mr-1" />
                          AI Score: {resume.ai_score}/100
                        </Badge>
                      )}
                      {resume.ai_analysis?.ats_score && (
                        <Badge variant="secondary" className="bg-purple-600 text-white">
                          ATS: {resume.ai_analysis.ats_score}/100
                        </Badge>
                      )}
                      {resume.screening_status === 'selected' && (
                        <Badge variant="default" className="bg-green-600">
                          Auto-Selected
                        </Badge>
                      )}
                      {resume.screening_status === 'rejected' && (
                        <Badge variant="destructive">
                          Auto-Rejected
                        </Badge>
                      )}
                      {resume.interview_tokens?.length > 0 && (
                        <Badge variant="secondary">
                          {resume.interview_tokens[0].interview_completed ? 
                            'Interview Completed' : 
                            'Interview Invited'
                          }
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      <p>{resume.email}</p>
                      <p>Applied for: {resume.job_roles?.title} - {resume.job_roles?.department}</p>
                    </div>

                    {resume.ai_analysis && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Recommendation:
                          </span>
                          <Badge className={getRecommendationBadge(resume.ai_analysis.recommendation)}>
                            {resume.ai_analysis.recommendation?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {resume.ai_analysis.summary}
                        </p>
                        {resume.ai_analysis.key_strengths && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {resume.ai_analysis.key_strengths.map((strength: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {resume.screening_status === 'pending' && (
                      <Button
                        onClick={() => runAIScreening(resume.id)}
                        disabled={processing === resume.id}
                        size="sm"
                      >
                        {processing === resume.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            AI Screening...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Run AI Screening
                          </>
                        )}
                      </Button>
                    )}

                    {resume.interview_tokens?.length > 0 && resume.interview_tokens[0].interview_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/recruitment/interviews')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        View Interview
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resume.file_url, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScreening;
