-- Create attendance tracking table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  sign_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sign_out_time TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'late')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leave requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'earned', 'unpaid', 'maternity', 'paternity')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leave balance table
CREATE TABLE public.leave_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  sick_leave INTEGER NOT NULL DEFAULT 12,
  casual_leave INTEGER NOT NULL DEFAULT 12,
  earned_leave INTEGER NOT NULL DEFAULT 18,
  unpaid_leave INTEGER NOT NULL DEFAULT 0,
  maternity_leave INTEGER NOT NULL DEFAULT 0,
  paternity_leave INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_leader_id UUID REFERENCES public.employees(id),
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  left_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, employee_id, is_active)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID REFERENCES public.teams(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create salary records table
CREATE TABLE public.salary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  base_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  increment_amount DECIMAL(10, 2),
  increment_percentage DECIMAL(5, 2),
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payslips table
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  salary_record_id UUID REFERENCES public.salary_records(id),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  gross_salary DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  payment_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Create performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('attendance', 'project_completion', 'quality', 'teamwork', 'innovation', 'overall')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  evaluated_by UUID REFERENCES auth.users(id),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'team_message', 'deadline', 'hr_update', 'system')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create feedback tickets table
CREATE TABLE public.feedback_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hr_query', 'technical_issue', 'feedback', 'complaint', 'suggestion')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create training modules table
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration_hours INTEGER,
  url TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee training progress table
CREATE TABLE public.employee_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'certified')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, training_module_id)
);

-- Create employee activity audit logs table
CREATE TABLE public.employee_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('attendance', 'leave', 'profile', 'training', 'performance', 'system')),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
CREATE POLICY "Employees can view their own attendance"
  ON public.attendance FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all attendance"
  ON public.attendance FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for leave_requests
CREATE POLICY "Employees can view their own leave requests"
  ON public.leave_requests FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can create their own leave requests"
  ON public.leave_requests FOR INSERT
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all leave requests"
  ON public.leave_requests FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for leave_balance
CREATE POLICY "Employees can view their own leave balance"
  ON public.leave_balance FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all leave balances"
  ON public.leave_balance FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for teams
CREATE POLICY "Employees can view their teams"
  ON public.teams FOR SELECT
  USING (id IN (SELECT team_id FROM public.team_members WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())));

CREATE POLICY "HR can manage all teams"
  ON public.teams FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for team_members
CREATE POLICY "Employees can view their team members"
  ON public.team_members FOR SELECT
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())));

CREATE POLICY "HR can manage all team members"
  ON public.team_members FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for projects
CREATE POLICY "Employees can view their team projects"
  ON public.projects FOR SELECT
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())));

CREATE POLICY "HR can manage all projects"
  ON public.projects FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for salary_records
CREATE POLICY "Employees can view their own salary records"
  ON public.salary_records FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all salary records"
  ON public.salary_records FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for payslips
CREATE POLICY "Employees can view their own payslips"
  ON public.payslips FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all payslips"
  ON public.payslips FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for performance_metrics
CREATE POLICY "Employees can view their own performance metrics"
  ON public.performance_metrics FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all performance metrics"
  ON public.performance_metrics FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for notifications
CREATE POLICY "Employees can view their own notifications"
  ON public.notifications FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all notifications"
  ON public.notifications FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for feedback_tickets
CREATE POLICY "Employees can view their own feedback tickets"
  ON public.feedback_tickets FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can create their own feedback tickets"
  ON public.feedback_tickets FOR INSERT
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all feedback tickets"
  ON public.feedback_tickets FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for training_modules
CREATE POLICY "Everyone can view training modules"
  ON public.training_modules FOR SELECT
  USING (true);

CREATE POLICY "HR can manage training modules"
  ON public.training_modules FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for employee_training
CREATE POLICY "Employees can view their own training progress"
  ON public.employee_training FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees can update their own training progress"
  ON public.employee_training FOR UPDATE
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all employee training"
  ON public.employee_training FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for employee_audit_logs
CREATE POLICY "Employees can view their own audit logs"
  ON public.employee_audit_logs FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can view all audit logs"
  ON public.employee_audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'hr'::app_role));

-- Create indexes for performance
CREATE INDEX idx_attendance_employee_date ON public.attendance(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_balance_employee_year ON public.leave_balance(employee_id, year);
CREATE INDEX idx_team_members_employee ON public.team_members(employee_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_projects_team ON public.projects(team_id);
CREATE INDEX idx_salary_records_employee ON public.salary_records(employee_id);
CREATE INDEX idx_payslips_employee ON public.payslips(employee_id);
CREATE INDEX idx_performance_metrics_employee ON public.performance_metrics(employee_id);
CREATE INDEX idx_notifications_employee ON public.notifications(employee_id);
CREATE INDEX idx_feedback_tickets_employee ON public.feedback_tickets(employee_id);
CREATE INDEX idx_employee_training_employee ON public.employee_training(employee_id);
CREATE INDEX idx_employee_audit_logs_employee ON public.employee_audit_logs(employee_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balance_updated_at
  BEFORE UPDATE ON public.leave_balance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_tickets_updated_at
  BEFORE UPDATE ON public.feedback_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_training_updated_at
  BEFORE UPDATE ON public.employee_training
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();