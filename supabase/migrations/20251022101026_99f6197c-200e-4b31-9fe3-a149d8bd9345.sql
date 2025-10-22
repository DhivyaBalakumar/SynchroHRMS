-- Enable RLS on remaining tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "HR can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

-- Policies for interview_feedback
CREATE POLICY "HR can view all interview feedback"
ON public.interview_feedback FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage interview feedback"
ON public.interview_feedback FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));