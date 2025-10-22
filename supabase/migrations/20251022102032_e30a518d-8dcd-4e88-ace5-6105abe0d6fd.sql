-- Add missing fields to job_roles table
ALTER TABLE public.job_roles 
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'hiring',
ADD COLUMN IF NOT EXISTS vacancies INTEGER DEFAULT 1;

-- Update existing records with default values
UPDATE public.job_roles 
SET urgency = 'hiring', vacancies = 1
WHERE urgency IS NULL OR vacancies IS NULL;