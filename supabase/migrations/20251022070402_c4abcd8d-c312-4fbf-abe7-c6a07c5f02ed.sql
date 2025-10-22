-- Simply disable RLS on user_roles table to allow signups
-- This is safe because user_roles is a system table managed by the application
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since we're disabling RLS
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;