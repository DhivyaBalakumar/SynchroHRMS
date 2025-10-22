-- Add automation tracking fields to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_scheduled_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interview_completed_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS automation_enabled BOOLEAN DEFAULT TRUE;

-- Add scheduling fields to interviews table
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_link TEXT,
ADD COLUMN IF NOT EXISTS completed_notification_sent BOOLEAN DEFAULT FALSE;

-- Create audit log table for pipeline transitions
CREATE TABLE IF NOT EXISTS public.pipeline_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  automation_triggered BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Enable RLS on audit logs
ALTER TABLE public.pipeline_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit logs
CREATE POLICY "HR can view all audit logs"
ON public.pipeline_audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "System can insert audit logs"
ON public.pipeline_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create email queue table for delayed sending
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  email_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on email queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for email queue
CREATE POLICY "HR can view all email queue"
ON public.email_queue
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "System can manage email queue"
ON public.email_queue
FOR ALL
TO authenticated
USING (true);

-- Add index for scheduled emails
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled 
ON public.email_queue(scheduled_for, status) 
WHERE status = 'pending';

-- Add index for pipeline audit logs
CREATE INDEX IF NOT EXISTS idx_pipeline_audit_resume 
ON public.pipeline_audit_logs(resume_id, changed_at DESC);

COMMENT ON TABLE public.pipeline_audit_logs IS 'Tracks all candidate pipeline stage transitions with automation flags';
COMMENT ON TABLE public.email_queue IS 'Queue for scheduled and delayed email sending with retry logic';