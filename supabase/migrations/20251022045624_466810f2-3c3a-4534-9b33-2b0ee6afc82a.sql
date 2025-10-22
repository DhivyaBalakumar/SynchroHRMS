-- Add missing columns to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS interview_scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS interview_scheduled_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS interview_completed_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS selection_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'pending';

-- Create interview_tokens table for secure interview access
CREATE TABLE IF NOT EXISTS public.interview_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  interview_completed boolean DEFAULT false
);

-- Create candidates table (if needed for job applications)
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns to email_queue
ALTER TABLE public.email_queue
ADD COLUMN IF NOT EXISTS resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS email_type text,
ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS email_data jsonb DEFAULT '{}'::jsonb;

-- Drop old columns if they exist
ALTER TABLE public.email_queue
DROP COLUMN IF EXISTS body,
DROP COLUMN IF EXISTS subject,
DROP COLUMN IF EXISTS recipient_email,
DROP COLUMN IF EXISTS template_type;

-- Add missing columns to interviews
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS interview_link text,
ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Enable RLS on new tables
ALTER TABLE public.interview_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for interview_tokens
CREATE POLICY "Anyone can validate interview tokens"
ON public.interview_tokens FOR SELECT
USING (expires_at > now() AND used_at IS NULL);

-- Add RLS policies for candidates
CREATE POLICY "Public can insert candidates"
ON public.candidates FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view candidates"
ON public.candidates FOR SELECT
USING (auth.role() = 'authenticated');

-- Create database function for validating interview tokens
CREATE OR REPLACE FUNCTION public.validate_interview_token(_token text)
RETURNS TABLE(is_valid boolean, resume_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS (
      SELECT 1 
      FROM public.interview_tokens 
      WHERE token = _token 
        AND expires_at > now() 
        AND used_at IS NULL
    ) as is_valid,
    (SELECT interview_tokens.resume_id FROM public.interview_tokens WHERE token = _token) as resume_id
$$;