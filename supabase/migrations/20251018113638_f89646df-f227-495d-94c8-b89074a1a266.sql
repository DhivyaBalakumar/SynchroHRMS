-- Add source tracking to resumes (test vs real applicants)
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'real' CHECK (source IN ('test', 'real'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_resumes_source ON public.resumes(source);
CREATE INDEX IF NOT EXISTS idx_resumes_screening_status ON public.resumes(screening_status);

-- Add more detailed fields for job applications
ALTER TABLE public.job_roles
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS experience_required text,
ADD COLUMN IF NOT EXISTS salary_range text;

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  head_employee_id uuid REFERENCES public.employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update employees table to reference departments
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- HR can manage departments
CREATE POLICY "HR can manage departments"
ON public.departments
FOR ALL
USING (has_role(auth.uid(), 'hr'));

-- Managers can view departments
CREATE POLICY "Managers can view departments"
ON public.departments
FOR SELECT
USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'senior_manager'));

-- Everyone can view active job roles (for public job listings)
CREATE POLICY "Anyone can view active job roles"
ON public.job_roles
FOR SELECT
USING (status = 'active');

-- Create trigger for departments updated_at
CREATE OR REPLACE FUNCTION update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION update_departments_updated_at();