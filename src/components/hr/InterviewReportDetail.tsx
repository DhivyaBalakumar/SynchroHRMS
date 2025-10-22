import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  TrendingUp, 
  Smile,
  Brain,
  BarChart3,
  Mic,
  Video,
  Award,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface InterviewReportDetailProps {
  interview: any;
  onClose: () => void;
}

export const InterviewReportDetail = ({ interview, onClose }: InterviewReportDetailProps) => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [interview.id]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('interview_analysis')
        .select('*')
        .eq('interview_id', interview.id)
        .single();

      if (error) {
        // If no analysis exists, trigger analysis
        await triggerAnalysis();
      } else {
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      toast({
        title: 'Analyzing Interview',
        description: 'Running AI analysis on interview data...',
      });

      const { data, error } = await supabase.functions.invoke('analyze-interview', {
        body: {
          interviewId: interview.id,
          audioTranscript: interview.transcript,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'Interview analysis has been completed successfully',
      });
    } catch (error: any) {
      console.error('Error triggering analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Interview Analysis Report: {interview.candidate_name || interview.resumes?.candidate_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Position: {interview.resumes?.job_roles?.title || interview.position}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        ) : !analysis ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No analysis available</p>
            <Button onClick={triggerAnalysis}>Run Analysis</Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="emotions">Emotions</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">AI Summary</h3>
                </div>
                <p className="text-muted-foreground mb-4">{analysis.ai_summary}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <p className="text-3xl font-bold">{Math.round(analysis.overall_rating)}</p>
                    <p className="text-xs text-muted-foreground">Overall Rating</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <p className={`text-3xl font-bold ${getSentimentColor(analysis.overall_sentiment)}`}>
                      {analysis.overall_sentiment}
                    </p>
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <p className="text-3xl font-bold">{analysis.dominant_emotion}</p>
                    <p className="text-xs text-muted-foreground">Dominant Emotion</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <p className="text-3xl font-bold">{Math.round(analysis.engagement_score)}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">Key Strengths</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-semibold">Areas of Improvement</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.areas_of_improvement?.map((area: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-500 mt-1">!</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Key Insights</h3>
                </div>
                <div className="space-y-2">
                  {analysis.key_insights?.map((insight: string, idx: number) => (
                    <div key={idx} className="p-3 bg-secondary/20 rounded-lg text-sm">
                      {insight}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Transcript Tab */}
            <TabsContent value="transcript" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-bold">Interview Transcript</h3>
                  </div>
                  <Badge variant="outline">
                    Confidence: {Math.round(analysis.transcript_confidence || 85)}%
                  </Badge>
                </div>
                <div className="bg-secondary/20 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm">
                    {analysis.audio_transcript || interview.transcript || 'Transcript not available'}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="p-3 bg-secondary/20 rounded-lg text-center">
                    <Mic className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-semibold">{analysis.speech_pace} WPM</p>
                    <p className="text-xs text-muted-foreground">Speech Pace</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded-lg text-center">
                    <p className="text-sm font-semibold">{Math.round(analysis.speech_clarity)}%</p>
                    <p className="text-xs text-muted-foreground">Speech Clarity</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded-lg text-center">
                    <p className="text-sm font-semibold">{analysis.filler_words_count}</p>
                    <p className="text-xs text-muted-foreground">Filler Words</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Sentiment Tab */}
            <TabsContent value="sentiment" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Sentiment Analysis</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-secondary/20 rounded-lg">
                    <p className={`text-5xl font-bold mb-2 ${getSentimentColor(analysis.overall_sentiment)}`}>
                      {analysis.overall_sentiment?.toUpperCase()}
                    </p>
                    <p className="text-muted-foreground mb-4">Overall Sentiment</p>
                    <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-full ${
                          analysis.sentiment_score >= 0.5 ? 'bg-green-500' :
                          analysis.sentiment_score >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${((analysis.sentiment_score + 1) / 2) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm mt-2">Score: {analysis.sentiment_score?.toFixed(2)}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-500">Positive Aspects</h4>
                      <ul className="space-y-1">
                        {analysis.sentiment_details?.positive_aspects?.map((aspect: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-green-500">+</span>
                            {aspect}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-red-500">Negative Aspects</h4>
                      <ul className="space-y-1">
                        {analysis.sentiment_details?.negative_aspects?.map((aspect: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-red-500">-</span>
                            {aspect}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Emotions Tab */}
            <TabsContent value="emotions" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Smile className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Emotion Analysis</h3>
                </div>

                <div className="mb-6 p-6 bg-secondary/20 rounded-lg text-center">
                  <p className="text-4xl mb-2">😊</p>
                  <p className="text-2xl font-bold">{analysis.dominant_emotion}</p>
                  <p className="text-sm text-muted-foreground">Dominant Emotion</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Detected Emotions Throughout Interview</h4>
                  {analysis.detected_emotions?.map((emotion: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{emotion.emotion}</span>
                        <Badge variant="outline">{emotion.timestamp}</Badge>
                      </div>
                      <Progress value={emotion.intensity} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        Intensity: {emotion.intensity}%
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Body Language & Engagement</h4>
                  <p className="text-sm mb-3">{analysis.body_language_notes}</p>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Engagement Score:</span>
                    <span className="font-bold">{Math.round(analysis.engagement_score)}%</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Scores Tab */}
            <TabsContent value="scores" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Performance Scores</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Communication</span>
                      <span className={`font-bold ${getScoreColor(analysis.communication_score)}`}>
                        {Math.round(analysis.communication_score)}/100
                      </span>
                    </div>
                    <Progress value={analysis.communication_score} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Confidence</span>
                      <span className={`font-bold ${getScoreColor(analysis.confidence_score)}`}>
                        {Math.round(analysis.confidence_score)}/100
                      </span>
                    </div>
                    <Progress value={analysis.confidence_score} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Professionalism</span>
                      <span className={`font-bold ${getScoreColor(analysis.professionalism_score)}`}>
                        {Math.round(analysis.professionalism_score)}/100
                      </span>
                    </div>
                    <Progress value={analysis.professionalism_score} className="h-3" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold">Overall Rating</span>
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.overall_rating)}`}>
                        {Math.round(analysis.overall_rating)}/100
                      </span>
                    </div>
                    <Progress value={analysis.overall_rating} className="h-4" />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
