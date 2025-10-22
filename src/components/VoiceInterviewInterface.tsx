import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Volume2, VolumeX, Loader2, MessageSquare } from 'lucide-react';

interface VoiceInterviewInterfaceProps {
  interviewContext: {
    candidateName: string;
    jobTitle: string;
    resumeData: any;
  };
  onTranscript?: (text: string, speaker: 'ai' | 'candidate') => void;
  onComplete?: () => void;
}

export const VoiceInterviewInterface = ({
  interviewContext,
  onTranscript,
  onComplete,
}: VoiceInterviewInterfaceProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [volumeEnabled, setVolumeEnabled] = useState(true);
  const [transcript, setTranscript] = useState<
    Array<{ speaker: 'ai' | 'candidate'; text: string }>
  >([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice event:', event);

    if (event.type === 'response.audio_transcript.delta') {
      // AI speaking
      setIsSpeaking(true);
      const text = event.delta;
      setTranscript((prev) => {
        const newTranscript = [...prev];
        const lastItem = newTranscript[newTranscript.length - 1];
        if (lastItem && lastItem.speaker === 'ai') {
          lastItem.text += text;
        } else {
          newTranscript.push({ speaker: 'ai', text });
        }
        return newTranscript;
      });
      onTranscript?.(text, 'ai');
    } else if (event.type === 'response.audio_transcript.done') {
      setIsSpeaking(false);
    } else if (event.type === 'input_audio_transcription.completed') {
      // Candidate speaking
      const text = event.transcript;
      setTranscript((prev) => [...prev, { speaker: 'candidate', text }]);
      onTranscript?.(text, 'candidate');
    } else if (event.type === 'session.updated') {
      console.log('Session updated:', event);
    } else if (event.type === 'error') {
      console.error('Voice error:', event);
      toast({
        title: 'Error',
        description: event.error?.message || 'Voice error occurred',
        variant: 'destructive',
      });
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init(interviewContext);
      setIsConnected(true);

      toast({
        title: 'Connected',
        description: 'Voice interview is ready. Start speaking!',
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start voice interview',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    onComplete?.();
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">AI Voice Interview</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? 'Interview in progress - speak naturally'
                : 'Start the voice interview when ready'}
            </p>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Live' : 'Not Connected'}
          </Badge>
        </div>

        <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-secondary/20 rounded-lg p-4 space-y-3">
          {transcript.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Transcript will appear here...</p>
            </div>
          ) : (
            transcript.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${
                  item.speaker === 'ai' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    item.speaker === 'ai'
                      ? 'bg-primary/10 text-left'
                      : 'bg-primary text-primary-foreground text-right'
                  }`}
                >
                  <p className="text-xs font-medium mb-1">
                    {item.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                  </p>
                  <p className="text-sm">{item.text}</p>
                </div>
              </div>
            ))
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is speaking...
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              size="lg"
              className="min-w-[200px]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Voice Interview
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setMicEnabled(!micEnabled)}
                variant="outline"
                size="lg"
              >
                {micEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={() => setVolumeEnabled(!volumeEnabled)}
                variant="outline"
                size="lg"
              >
                {volumeEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={endConversation}
                variant="destructive"
                size="lg"
                className="min-w-[200px]"
              >
                End Interview
              </Button>
            </>
          )}
        </div>

        {isConnected && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 Speak clearly and take your time. The AI will ask follow-up
              questions.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
