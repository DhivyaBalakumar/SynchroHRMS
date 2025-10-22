import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface AIFeedbackDisplayProps {
  feedback: {
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: string;
    recommendation_reasoning?: string;
  };
  scores: {
    communication_score?: number;
    technical_score?: number;
    cultural_fit_score?: number;
    confidence_score?: number;
  };
  questionAnalysis?: Array<{
    question: string;
    answer_quality: number;
    feedback: string;
  }>;
  sentimentAnalysis?: {
    overall_sentiment?: string;
  };
}

export const AIFeedbackDisplay = ({
  feedback,
  scores,
  questionAnalysis,
  sentimentAnalysis,
}: AIFeedbackDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSentimentBadge = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-500',
      neutral: 'bg-gray-500',
      negative: 'bg-red-500',
    };
    return colors[sentiment] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI-Generated Feedback</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive analysis powered by AI
            </p>
          </div>
        </div>

        {feedback.summary && (
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Summary
            </h3>
            <p className="text-sm">{feedback.summary}</p>
          </div>
        )}
      </Card>

      {/* Scores */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Performance Scores</h3>
        <div className="grid grid-cols-2 gap-4">
          {scores.communication_score !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Communication</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(
                    scores.communication_score
                  )}`}
                >
                  {scores.communication_score}/100
                </span>
              </div>
              <Progress
                value={scores.communication_score}
                className="h-2"
              />
            </div>
          )}

          {scores.technical_score !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Technical Skills</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(
                    scores.technical_score
                  )}`}
                >
                  {scores.technical_score}/100
                </span>
              </div>
              <Progress value={scores.technical_score} className="h-2" />
            </div>
          )}

          {scores.cultural_fit_score !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cultural Fit</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(
                    scores.cultural_fit_score
                  )}`}
                >
                  {scores.cultural_fit_score}/100
                </span>
              </div>
              <Progress value={scores.cultural_fit_score} className="h-2" />
            </div>
          )}

          {scores.confidence_score !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <span
                  className={`text-sm font-bold ${getScoreColor(
                    scores.confidence_score
                  )}`}
                >
                  {scores.confidence_score}/100
                </span>
              </div>
              <Progress value={scores.confidence_score} className="h-2" />
            </div>
          )}
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {feedback.strengths && feedback.strengths.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {feedback.weaknesses && feedback.weaknesses.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-600">
              <TrendingDown className="h-5 w-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Question Analysis */}
      {questionAnalysis && questionAnalysis.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Question-by-Question Analysis</h3>
          <div className="space-y-4">
            {questionAnalysis.map((qa, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <p className="font-medium text-sm mb-2">{qa.question}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-muted-foreground">
                    Answer Quality:
                  </span>
                  <Badge
                    variant="outline"
                    className={getScoreBg(qa.answer_quality)}
                  >
                    {qa.answer_quality}/100
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{qa.feedback}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendation */}
      {feedback.recommendation && (
        <Card className="p-6 bg-primary/5 border-primary">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Final Recommendation
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge
                className={
                  feedback.recommendation.toLowerCase().includes('strong')
                    ? 'bg-green-600'
                    : feedback.recommendation.toLowerCase().includes('hire')
                    ? 'bg-blue-600'
                    : feedback.recommendation.toLowerCase().includes('maybe')
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }
              >
                {feedback.recommendation}
              </Badge>
              {sentimentAnalysis?.overall_sentiment && (
                <Badge className={getSentimentBadge(sentimentAnalysis.overall_sentiment)}>
                  {sentimentAnalysis.overall_sentiment} sentiment
                </Badge>
              )}
            </div>
            {feedback.recommendation_reasoning && (
              <p className="text-sm">{feedback.recommendation_reasoning}</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
