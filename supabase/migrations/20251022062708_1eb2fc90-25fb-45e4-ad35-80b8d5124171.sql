-- Create interview_analysis table to store all AI analysis results
CREATE TABLE IF NOT EXISTS public.interview_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  
  -- Transcript data
  audio_transcript TEXT,
  transcript_confidence NUMERIC,
  
  -- Sentiment analysis
  overall_sentiment TEXT, -- positive, negative, neutral
  sentiment_score NUMERIC, -- -1 to 1
  sentiment_details JSONB DEFAULT '{}',
  
  -- Emotion analysis
  detected_emotions JSONB DEFAULT '[]', -- array of emotions with timestamps
  dominant_emotion TEXT,
  emotion_timeline JSONB DEFAULT '[]',
  
  -- Speech analysis
  speech_pace NUMERIC, -- words per minute
  speech_clarity NUMERIC, -- 0-100
  filler_words_count INTEGER DEFAULT 0,
  pause_analysis JSONB DEFAULT '{}',
  
  -- Video analysis
  facial_expressions JSONB DEFAULT '[]',
  body_language_notes TEXT,
  engagement_score NUMERIC, -- 0-100
  
  -- Summary
  ai_summary TEXT,
  key_insights TEXT[],
  strengths TEXT[],
  areas_of_improvement TEXT[],
  
  -- Overall scores
  communication_score NUMERIC, -- 0-100
  confidence_score NUMERIC, -- 0-100
  professionalism_score NUMERIC, -- 0-100
  overall_rating NUMERIC, -- 0-100
  
  -- Metadata
  analysis_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_analysis_interview_id ON public.interview_analysis(interview_id);

-- Enable RLS
ALTER TABLE public.interview_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interview analysis
CREATE POLICY "Authenticated users can view interview analysis"
  ON public.interview_analysis
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage interview analysis"
  ON public.interview_analysis
  FOR ALL
  TO service_role
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_interview_analysis_updated_at
  BEFORE UPDATE ON public.interview_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();