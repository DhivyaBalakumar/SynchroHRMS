import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Brain,
  TrendingUp,
  AlertCircle,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Resume {
  id: string;
  candidate_name: string;
  email: string;
  phone?: string;
  position_applied: string;
  job_role_id?: string;
  screening_status: string;
  ai_score?: number;
  ai_analysis?: any;
  file_url?: string;
  source: string;
  created_at: string;
}

const EnhancedScreening = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedJobRole, setSelectedJobRole] = useState<string>('all');
  const [jobRoles, setJobRoles] = useState<any[]>([]);

  useEffect(() => {
    const roleId = searchParams.get('role');
    if (roleId) setSelectedJobRole(roleId);
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

    // Load resumes with filters
    let query = supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedJobRole !== 'all') {
      query = query.eq('job_role_id', selectedJobRole);
    }

    if (activeTab !== 'all') {
      query = query.eq('screening_status', activeTab);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error loading resumes',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setResumes(data);
    }
    setLoading(false);
  };

  const runBatchAIScreening = async () => {
    setProcessing(true);
    const pendingResumes = resumes.filter(r => r.screening_status === 'pending');

    toast({
      title: 'AI Screening Started',
      description: `Processing ${pendingResumes.length} resumes with AI...`,
    });

    // Real AI batch screening using edge function
    let successCount = 0;
    let errorCount = 0;

    for (const resume of pendingResumes) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-resume-screening', {
          body: { 
            resume_id: resume.id,
            job_role_id: resume.job_role_id 
          }
        });

        if (error) {
          console.error('AI screening error for resume:', resume.id, error);
          errorCount++;
        } else if (data?.success) {
          successCount++;
        }
      } catch (err) {
        console.error('Exception during AI screening:', err);
        errorCount++;
      }
    }

    setProcessing(false);
    
    if (errorCount === 0) {
      toast({
        title: 'AI Screening Complete',
        description: `Successfully analyzed ${successCount} resumes`,
      });
    } else {
      toast({
        title: 'AI Screening Completed with Issues',
        description: `Analyzed ${successCount} resumes, ${errorCount} failed`,
        variant: 'destructive',
      });
    }
    
    loadData();
  };

  const handleDecision = async (resumeId: string, decision: 'selected' | 'rejected') => {
    const { error } = await supabase
      .from('resumes')
      .update({ screening_status: decision })
      .eq('id', resumeId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: decision === 'selected' ? 'Candidate Selected' : 'Candidate Rejected',
        description: 'Status updated successfully',
      });
      loadData();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/hr')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">AI-Powered Resume Screening</h1>
              <p className="text-muted-foreground">AI assists - You decide</p>
            </div>
            <Button 
              onClick={runBatchAIScreening}
              disabled={processing || resumes.filter(r => r.screening_status === 'pending').length === 0}
              size="lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              {processing ? 'Processing...' : 'Run AI Screening'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <select
              value={selectedJobRole}
              onChange={(e) => setSelectedJobRole(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">All Roles</option>
              {jobRoles.map(role => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({resumes.filter(r => r.screening_status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="selected">
              Selected ({resumes.filter(r => r.screening_status === 'selected').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({resumes.filter(r => r.screening_status === 'rejected').length})
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No resumes found</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {resumes.map((resume, idx) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{resume.candidate_name}</h3>
                            <Badge variant={resume.source === 'test' ? 'outline' : 'default'}>
                              {resume.source === 'test' ? 'Test Data' : 'Real Applicant'}
                            </Badge>
                            {resume.ai_score && (
                              <Badge className={getScoreBgColor(resume.ai_score)}>
                                <Target className="h-3 w-3 mr-1" />
                                <span className={getScoreColor(resume.ai_score)}>
                                  {resume.ai_score}/100
                                </span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {resume.email} • {resume.position_applied}
                          </p>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {resume.ai_score && resume.ai_analysis && (
                        <div className="space-y-4 mb-6 p-4 bg-secondary/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-primary" />
                            <h4 className="font-bold">AI Analysis</h4>
                            <Badge>{resume.ai_analysis.recommendation}</Badge>
                          </div>

                          {/* Skill Match Meters */}
                          <div className="grid grid-cols-3 gap-4">
                            {['skills_match', 'experience_match', 'education_match'].map((key) => (
                              <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="capitalize">{key.replace('_', ' ')}</span>
                                  <span className="font-bold">{resume.ai_analysis[key]}%</span>
                                </div>
                                <Progress value={resume.ai_analysis[key]} />
                              </div>
                            ))}
                          </div>

                          {/* Key Strengths */}
                          {resume.ai_analysis.key_strengths?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Key Strengths
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {resume.ai_analysis.key_strengths.map((strength: string, idx: number) => (
                                  <Badge key={idx} variant="secondary">{strength}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Areas of Concern */}
                          {resume.ai_analysis.areas_of_concern?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                Areas to Explore
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {resume.ai_analysis.areas_of_concern.map((concern: string, idx: number) => (
                                  <Badge key={idx} variant="outline">{concern}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detailed Analysis */}
                          {resume.ai_analysis.detailed_analysis && (
                            <p className="text-sm text-muted-foreground italic">
                              {resume.ai_analysis.detailed_analysis}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        {resume.file_url && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(resume.file_url, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </Button>
                        )}
                        
                        {resume.screening_status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleDecision(resume.id, 'selected')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Select
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDecision(resume.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedScreening;
