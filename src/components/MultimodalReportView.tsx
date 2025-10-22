import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, Video, TrendingUp, TrendingDown, Minus, Eye, MessageSquare } from 'lucide-react';

interface MultimodalReportProps {
  audioAnalysis: any;
  videoAnalysis: any;
}

export const MultimodalReportView = ({ audioAnalysis, videoAnalysis }: MultimodalReportProps) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'negative': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: 'bg-green-500',
      confidence: 'bg-blue-500',
      enthusiasm: 'bg-purple-500',
      nervousness: 'bg-yellow-500',
      anxiety: 'bg-orange-500',
      neutral: 'bg-gray-500',
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Audio Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Audio & Speech Analysis</h3>
        </div>

        {/* Audio Sentiment */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h4 className="font-semibold">Audio Sentiment</h4>
            </div>
            {getSentimentIcon(audioAnalysis?.audio_sentiment?.overall)}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {audioAnalysis?.audio_sentiment?.overall}
              </Badge>
              <span className={`text-2xl font-bold ${getSentimentColor(audioAnalysis?.audio_sentiment?.score)}`}>
                {(audioAnalysis?.audio_sentiment?.score * 100).toFixed(0)}%
              </span>
              <Badge variant="secondary">
                {audioAnalysis?.audio_sentiment?.confidence}% confidence
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium mb-2 text-green-600">Positive Indicators</p>
                <ul className="text-sm space-y-1">
                  {audioAnalysis?.audio_sentiment?.details?.positive_indicators?.map((indicator: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-red-600">Areas to Improve</p>
                <ul className="text-sm space-y-1">
                  {audioAnalysis?.audio_sentiment?.details?.negative_indicators?.map((indicator: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Audio Emotions */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Detected Emotions (Audio)</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium">Dominant:</span>
              <Badge className={getEmotionColor(audioAnalysis?.audio_emotions?.dominant_emotion)}>
                {audioAnalysis?.audio_emotions?.dominant_emotion}
              </Badge>
            </div>

            {audioAnalysis?.audio_emotions?.detected?.map((emotion: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {emotion.emotion}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({emotion.timestamp})</span>
                  </div>
                  <span className="text-sm font-medium">{emotion.intensity}%</span>
                </div>
                <Progress value={emotion.intensity} className="h-2" />
                {emotion.indicators && (
                  <p className="text-xs text-muted-foreground ml-2">
                    {emotion.indicators.join(', ')}
                  </p>
                )}
              </div>
            ))}

            {audioAnalysis?.audio_emotions?.emotional_trajectory && (
              <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Emotional Journey: </span>
                  {audioAnalysis.audio_emotions.emotional_trajectory}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Speech Patterns */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Speech Patterns</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pace</p>
              <p className="text-lg font-semibold">{audioAnalysis?.speech_patterns?.estimated_pace} WPM</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clarity</p>
              <div className="flex items-center gap-2">
                <Progress value={audioAnalysis?.speech_patterns?.clarity_score} className="flex-1" />
                <span className="text-sm font-medium">{audioAnalysis?.speech_patterns?.clarity_score}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confidence</p>
              <div className="flex items-center gap-2">
                <Progress value={audioAnalysis?.speech_patterns?.confidence_level} className="flex-1" />
                <span className="text-sm font-medium">{audioAnalysis?.speech_patterns?.confidence_level}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filler Words</p>
              <p className="text-lg font-semibold">{audioAnalysis?.speech_patterns?.filler_words}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Video Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">Video & Visual Analysis</h3>
        </div>

        {/* Video Sentiment */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <h4 className="font-semibold">Video Sentiment</h4>
            </div>
            {getSentimentIcon(videoAnalysis?.video_sentiment?.overall)}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {videoAnalysis?.video_sentiment?.overall}
              </Badge>
              <span className={`text-2xl font-bold ${getSentimentColor(videoAnalysis?.video_sentiment?.score)}`}>
                {(videoAnalysis?.video_sentiment?.score * 100).toFixed(0)}%
              </span>
              <Badge variant="secondary">
                {videoAnalysis?.video_sentiment?.confidence}% confidence
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium mb-2 text-green-600">Positive Visual Cues</p>
                <ul className="text-sm space-y-1">
                  {videoAnalysis?.video_sentiment?.details?.positive_visual_cues?.map((cue: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-red-600">Areas to Improve</p>
                <ul className="text-sm space-y-1">
                  {videoAnalysis?.video_sentiment?.details?.negative_visual_cues?.map((cue: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Video Emotions */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Detected Emotions (Video)</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium">Dominant:</span>
              <Badge className={getEmotionColor(videoAnalysis?.video_emotions?.dominant_emotion)}>
                {videoAnalysis?.video_emotions?.dominant_emotion}
              </Badge>
            </div>

            {videoAnalysis?.video_emotions?.detected?.map((emotion: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {emotion.emotion}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({emotion.timestamp})</span>
                  </div>
                  <span className="text-sm font-medium">{emotion.intensity}%</span>
                </div>
                <Progress value={emotion.intensity} className="h-2" />
                {emotion.visual_indicators && (
                  <p className="text-xs text-muted-foreground ml-2">
                    {emotion.visual_indicators.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Visual Engagement */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Visual Engagement Metrics</h4>
          <div className="space-y-3">
            {Object.entries(videoAnalysis?.visual_engagement || {}).map(([key, value]) => {
              if (typeof value === 'number') {
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                );
              } else if (typeof value === 'string') {
                return (
                  <div key={key} className="p-2 bg-secondary/20 rounded">
                    <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                    <span className="text-sm">{value}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
