import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Circle,
  Square,
  Upload,
  Download
} from 'lucide-react';

interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  autoStart?: boolean;
}

export const VideoRecorder = ({ onRecordingComplete, autoStart = false }: VideoRecorderProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [autoStart]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraEnabled(true);
      
      toast({
        title: 'Camera Ready',
        description: 'Camera and microphone are active',
      });
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Camera Access Denied',
        description: 'Please allow camera and microphone access',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraEnabled(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      toast({
        title: 'Camera Not Ready',
        description: 'Please enable camera first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };

      // Fallback for Safari
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks([...chunks]);
        onRecordingComplete?.(blob, recordingTime);
        
        toast({
          title: 'Recording Saved',
          description: `Duration: ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
        });
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: 'Recording Started',
        description: 'Your interview is being recorded',
      });
    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Video Preview */}
        <div className="aspect-video bg-secondary/20 rounded-lg overflow-hidden relative">
          {cameraEnabled ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                  <Circle className="h-3 w-3 fill-current animate-pulse" />
                  <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                {micEnabled ? (
                  <Badge variant="default" className="bg-green-500">
                    <Mic className="h-3 w-3 mr-1" />
                    Audio On
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <MicOff className="h-3 w-3 mr-1" />
                    Muted
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Camera not active</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          {!cameraEnabled ? (
            <Button onClick={startCamera} size="lg">
              <Video className="mr-2 h-5 w-5" />
              Enable Camera
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMicrophone}
                variant="outline"
                size="lg"
              >
                {micEnabled ? (
                  <><Mic className="mr-2 h-5 w-5" /> Microphone On</>
                ) : (
                  <><MicOff className="mr-2 h-5 w-5" /> Microphone Off</>
                )}
              </Button>

              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Circle className="mr-2 h-5 w-5 fill-current" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}

              {recordedChunks.length > 0 && (
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download
                </Button>
              )}

              <Button
                onClick={stopCamera}
                variant="outline"
                size="lg"
              >
                <VideoOff className="mr-2 h-5 w-5" />
                Stop Camera
              </Button>
            </>
          )}
        </div>

        {/* Recording Stats */}
        {isRecording && (
          <div className="bg-secondary/20 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recording Duration</span>
              <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
