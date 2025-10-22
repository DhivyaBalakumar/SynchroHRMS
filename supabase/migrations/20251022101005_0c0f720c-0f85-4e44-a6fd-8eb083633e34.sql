-- Enable RLS on all HR dashboard tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for HR role to access all data
CREATE POLICY "HR can view all employees"
ON public.employees FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage all employees"
ON public.employees FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view all job roles"
ON public.job_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage job roles"
ON public.job_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view all resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage resumes"
ON public.resumes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view all interviews"
ON public.interviews FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage interviews"
ON public.interviews FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage departments"
ON public.departments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view leave requests"
ON public.leave_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can manage leave requests"
ON public.leave_requests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view leave balance"
ON public.leave_balance FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view salary records"
ON public.salary_records FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view project tasks"
ON public.project_tasks FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view team members"
ON public.team_members FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view skills"
ON public.skills FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view employee skills"
ON public.employee_skills FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view manager insights"
ON public.manager_insights FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view pipeline audit logs"
ON public.pipeline_audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view email queue"
ON public.email_queue FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can view automation errors"
ON public.automation_error_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'hr'));