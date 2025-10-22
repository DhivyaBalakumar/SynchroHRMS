-- Add missing columns to interviews table for storing recordings
ALTER TABLE public.interviews 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS combined_url TEXT,
ADD COLUMN IF NOT EXISTS ai_score NUMERIC,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Add comments to explain the columns
COMMENT ON COLUMN public.interviews.video_url IS 'URL to the video-only recording of the interview';
COMMENT ON COLUMN public.interviews.audio_url IS 'URL to the audio-only recording of the interview';
COMMENT ON COLUMN public.interviews.combined_url IS 'URL to the combined video+audio recording of the interview';
COMMENT ON COLUMN public.interviews.ai_score IS 'AI-generated score for the interview performance';
COMMENT ON COLUMN public.interviews.ai_summary IS 'AI-generated summary of interview responses';
COMMENT ON COLUMN public.interviews.duration_seconds IS 'Total duration of the interview in seconds';