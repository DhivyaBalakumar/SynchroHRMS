-- Create job_roles table for managing open positions
CREATE TABLE IF NOT EXISTS public.job_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  description text,
  requirements jsonb DEFAULT '[]'::jsonb,
  vacancies integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  urgency text NOT NULL DEFAULT 'hiring' CHECK (urgency IN ('urgent_hiring', 'hiring', 'hiring_can_wait')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Update resumes table structure for better tracking
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS job_role_id uuid REFERENCES public.job_roles(id),
ADD COLUMN IF NOT EXISTS screening_status text DEFAULT 'pending' CHECK (screening_status IN ('pending', 'ai_reviewed', 'hr_reviewed', 'selected', 'rejected')),
ADD COLUMN IF NOT EXISTS manual_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hr_notes text,
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'screening' CHECK (pipeline_stage IN ('screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer', 'hired', 'rejected')),
ADD COLUMN IF NOT EXISTS ai_analysis jsonb DEFAULT '{}'::jsonb;

-- Create candidates table for unified candidate management
CREATE TABLE IF NOT EXISTS public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_role_id uuid REFERENCES public.job_roles(id),
  stage text NOT NULL DEFAULT 'screening' CHECK (stage IN ('screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer', 'hired', 'rejected')),
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  hr_decision text CHECK (hr_decision IN ('pending', 'selected', 'rejected')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create resume_uploads table for tracking bulk upload operations
CREATE TABLE IF NOT EXISTS public.resume_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES auth.users(id),
  job_role_id uuid REFERENCES public.job_roles(id),
  total_files integer NOT NULL DEFAULT 0,
  processed_files integer NOT NULL DEFAULT 0,
  failed_files integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_log jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on new tables
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_roles
CREATE POLICY "HR can manage all job roles"
  ON public.job_roles FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can view job roles"
  ON public.job_roles FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'senior_manager'::app_role));

-- RLS Policies for candidates
CREATE POLICY "HR can manage all candidates"
  ON public.candidates FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "Managers can view candidates"
  ON public.candidates FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'senior_manager'::app_role));

-- RLS Policies for resume_uploads
CREATE POLICY "HR can manage all upload operations"
  ON public.resume_uploads FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_job_role ON public.resumes(job_role_id);
CREATE INDEX IF NOT EXISTS idx_resumes_screening_status ON public.resumes(screening_status);
CREATE INDEX IF NOT EXISTS idx_resumes_pipeline_stage ON public.resumes(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_candidates_job_role ON public.candidates(job_role_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);
CREATE INDEX IF NOT EXISTS idx_job_roles_status ON public.job_roles(status);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
CREATE POLICY "HR can upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    has_role(auth.uid(), 'hr'::app_role)
  );

CREATE POLICY "HR can view resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    has_role(auth.uid(), 'hr'::app_role)
  );

CREATE POLICY "HR can delete resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes' AND
    has_role(auth.uid(), 'hr'::app_role)
  );

-- Trigger for updating timestamps
CREATE TRIGGER update_job_roles_updated_at
  BEFORE UPDATE ON public.job_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();