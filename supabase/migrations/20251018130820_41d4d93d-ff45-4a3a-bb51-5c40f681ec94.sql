-- Create interview_tokens table for secure temporary candidate access
CREATE TABLE IF NOT EXISTS public.interview_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  interview_completed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.interview_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: HR can manage all tokens
CREATE POLICY "HR can manage all tokens"
ON public.interview_tokens
FOR ALL
USING (has_role(auth.uid(), 'hr'::app_role));

-- Add index for faster token lookup
CREATE INDEX idx_interview_tokens_token ON public.interview_tokens(token);
CREATE INDEX idx_interview_tokens_resume_id ON public.interview_tokens(resume_id);

-- Update resumes table to add more pipeline tracking
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS selection_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rejection_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interview_invitation_sent BOOLEAN DEFAULT false;

-- Update interviews table to support video interview data
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS transcript_text TEXT,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;

-- Create function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_interview_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a secure random token (32 bytes = 64 hex characters)
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$;

-- Create function to validate interview token
CREATE OR REPLACE FUNCTION public.validate_interview_token(input_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  resume_id UUID,
  candidate_name TEXT,
  job_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (t.expires_at > now() AND t.used_at IS NULL) as is_valid,
    r.id as resume_id,
    r.candidate_name,
    jr.title as job_title
  FROM public.interview_tokens t
  JOIN public.resumes r ON t.resume_id = r.id
  LEFT JOIN public.job_roles jr ON r.job_role_id = jr.id
  WHERE t.token = input_token
  LIMIT 1;
END;
$$;