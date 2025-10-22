import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, FileText, Brain, Save, Download, BarChart3, Loader2 } from 'lucide-react';
import { MultimodalReportView } from './MultimodalReportView';

interface InterviewDetailViewProps {
  interview: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const InterviewDetailView = ({ interview, onClose, onUpdate }: InterviewDetailViewProps) => {
  const [hrNotes, setHrNotes] = useState(interview.feedback || '');
  const [saving, setSaving] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [multimodalAnalysis, setMultimodalAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const saveNotes = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('interviews')
      .update({ feedback: hrNotes })
      .eq('id', interview.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Saved',
        description: 'HR notes updated successfully',
      });
      onUpdate();
    }
    setSaving(false);
  };

  const downloadTranscript = () => {
    const transcript = JSON.stringify(interview.transcript, null, 2);
    const blob = new Blob([transcript], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${interview.candidate_name}.json`;
    a.click();
  };

  const generateMultimodalReport = async () => {
    setLoadingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('multimodal-analysis', {
        body: { interviewId: interview.id }
      });

      if (error) throw error;

      if (data?.analysis) {
        setMultimodalAnalysis(data.analysis);
        toast({
          title: 'Success',
          description: 'Multimodal analysis completed',
        });
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate multimodal report',
        variant: 'destructive',
      });
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Interview: {interview.candidate_name || interview.resumes?.candidate_name}
          </DialogTitle>
          <DialogDescription>
            Position: {interview.resumes?.job_roles?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge>Status: {interview.status}</Badge>
            {interview.ai_score && (
              <Badge variant="outline">AI Score: {interview.ai_score}/100</Badge>
            )}
            {interview.duration_seconds && (
              <Badge variant="secondary">
                Duration: {Math.floor(interview.duration_seconds / 60)}m {interview.duration_seconds % 60}s
              </Badge>
            )}
          </div>

          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger value="transcript">
                <FileText className="h-4 w-4 mr-2" />
                Transcript
              </TabsTrigger>
              <TabsTrigger value="ai-summary">
                <Brain className="h-4 w-4 mr-2" />
                AI Summary
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="notes">
                <FileText className="h-4 w-4 mr-2" />
                HR Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="space-y-4">
              {interview.video_url ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    controls 
                    className="w-full h-full"
                    src={interview.video_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-secondary/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No video recording available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              {interview.transcript ? (
                <div className="space-y-3">
                  <Button onClick={downloadTranscript} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Transcript
                  </Button>
                  <div className="bg-secondary/20 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {Array.isArray(interview.transcript) ? (
                      interview.transcript.map((entry: any, idx: number) => (
                        <div key={idx} className="mb-4 pb-4 border-b last:border-0">
                          <p className="font-medium text-sm mb-1">
                            {entry.speaker || `Speaker ${idx + 1}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.text || entry.content}
                          </p>
                          {entry.timestamp && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {entry.timestamp}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm">{interview.transcript_text || 'No transcript available'}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-secondary/20 p-8 rounded-lg text-center">
                  <p className="text-muted-foreground">No transcript available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-summary" className="space-y-4">
              {interview.ai_summary ? (
                <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {interview.ai_summary}
                    </p>
                  </div>
                  {interview.ai_score && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium">
                        Overall Score: <span className="text-2xl ml-2">{interview.ai_score}/100</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-secondary/20 p-8 rounded-lg text-center">
                  <p className="text-muted-foreground">No AI summary available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              {!multimodalAnalysis ? (
                <div className="bg-secondary/20 p-8 rounded-lg text-center space-y-4">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold mb-2">Generate Comprehensive Report</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate detailed sentiment and emotion analysis for both video and audio components
                    </p>
                    <Button onClick={generateMultimodalReport} disabled={loadingReport}>
                      {loadingReport ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <MultimodalReportView 
                  audioAnalysis={multimodalAnalysis.audio}
                  videoAnalysis={multimodalAnalysis.video}
                />
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">HR Notes</label>
                <Textarea
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                  placeholder="Add your notes about this interview..."
                  rows={10}
                  className="resize-none"
                />
              </div>
              <Button onClick={saveNotes} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
