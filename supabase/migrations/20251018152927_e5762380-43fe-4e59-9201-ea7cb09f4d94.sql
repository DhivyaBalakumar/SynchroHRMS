-- Add AI feedback and analytics fields to interviews table
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS ai_feedback JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS sentiment_analysis JSONB,
ADD COLUMN IF NOT EXISTS communication_score INTEGER,
ADD COLUMN IF NOT EXISTS technical_score INTEGER,
ADD COLUMN IF NOT EXISTS cultural_fit_score INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score INTEGER,
ADD COLUMN IF NOT EXISTS question_analysis JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_analytics JSONB,
ADD COLUMN IF NOT EXISTS emotion_analysis JSONB,
ADD COLUMN IF NOT EXISTS engagement_metrics JSONB;

-- Create interview feedback table for post-interview feedback
CREATE TABLE IF NOT EXISTS public.interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('hr', 'candidate')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
  technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  overall_impression TEXT,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on interview feedback
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview feedback
CREATE POLICY "HR can view all feedback"
ON public.interview_feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Users can submit feedback"
ON public.interview_feedback
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own feedback"
ON public.interview_feedback
FOR SELECT
TO authenticated
USING (submitted_by = auth.uid());

-- Create calendar integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on calendar integrations
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar integrations
CREATE POLICY "Users can manage their own calendar integrations"
ON public.calendar_integrations
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create interview slots table for calendar scheduling
CREATE TABLE IF NOT EXISTS public.interview_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewer_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  interview_id UUID REFERENCES public.interviews(id),
  calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS on interview slots
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview slots
CREATE POLICY "HR can manage all interview slots"
ON public.interview_slots
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Users can view available slots"
ON public.interview_slots
FOR SELECT
TO authenticated
USING (is_booked = false OR interviewer_id = auth.uid());

-- Add pipeline stage enum and expand resumes table
DO $$ BEGIN
  CREATE TYPE pipeline_stage_enum AS ENUM (
    'screening',
    'selected',
    'interview_scheduled',
    'interviewed',
    'hr_round',
    'technical_round',
    'final_round',
    'offer_pending',
    'offer_sent',
    'accepted',
    'rejected',
    'withdrawn'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create error logs table for automation failures
CREATE TABLE IF NOT EXISTS public.automation_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context JSONB,
  resume_id UUID REFERENCES public.resumes(id),
  interview_id UUID REFERENCES public.interviews(id),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on error logs
ALTER TABLE public.automation_error_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for error logs
CREATE POLICY "HR can view all error logs"
ON public.automation_error_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview 
ON public.interview_feedback(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_slots_time 
ON public.interview_slots(start_time, end_time) 
WHERE is_booked = false;

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user 
ON public.calendar_integrations(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_automation_errors_unresolved 
ON public.automation_error_logs(created_at DESC) 
WHERE resolved = false;

COMMENT ON TABLE public.interview_feedback IS 'Stores post-interview feedback from HR and candidates';
COMMENT ON TABLE public.calendar_integrations IS 'Manages calendar integrations for automated scheduling';
COMMENT ON TABLE public.interview_slots IS 'Available time slots for interview scheduling';
COMMENT ON TABLE public.automation_error_logs IS 'Centralized error logging for automation workflows';