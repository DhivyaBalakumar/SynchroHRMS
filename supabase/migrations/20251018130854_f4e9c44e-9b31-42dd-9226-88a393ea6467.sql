-- Fix security warnings: Add search_path to functions
DROP FUNCTION IF EXISTS public.generate_interview_token();
CREATE OR REPLACE FUNCTION public.generate_interview_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a secure random token (32 bytes = 64 hex characters)
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$;

DROP FUNCTION IF EXISTS public.validate_interview_token(TEXT);
CREATE OR REPLACE FUNCTION public.validate_interview_token(input_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  resume_id UUID,
  candidate_name TEXT,
  job_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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