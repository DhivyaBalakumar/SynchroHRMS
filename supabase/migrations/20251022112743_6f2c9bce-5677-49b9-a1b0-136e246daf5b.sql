-- Create onboarding workflows and automation tables
CREATE TABLE IF NOT EXISTS public.onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.onboarding_workflows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('document', 'training', 'meeting', 'system_access', 'equipment', 'orientation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  auto_trigger_days INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.onboarding_workflows(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.onboarding_tasks(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'approved', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_workflows
CREATE POLICY "Employees can view their own onboarding workflow"
  ON public.onboarding_workflows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = onboarding_workflows.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "HR can view all onboarding workflows"
  ON public.onboarding_workflows FOR SELECT
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "HR can manage onboarding workflows"
  ON public.onboarding_workflows FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for onboarding_tasks
CREATE POLICY "Employees can view their own onboarding tasks"
  ON public.onboarding_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.onboarding_workflows
      JOIN public.employees ON employees.id = onboarding_workflows.employee_id
      WHERE onboarding_workflows.id = onboarding_tasks.workflow_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their own onboarding task status"
  ON public.onboarding_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.onboarding_workflows
      JOIN public.employees ON employees.id = onboarding_workflows.employee_id
      WHERE onboarding_workflows.id = onboarding_tasks.workflow_id
      AND employees.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.onboarding_workflows
      JOIN public.employees ON employees.id = onboarding_workflows.employee_id
      WHERE onboarding_workflows.id = onboarding_tasks.workflow_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage all onboarding tasks"
  ON public.onboarding_tasks FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for onboarding_documents
CREATE POLICY "Employees can view their own onboarding documents"
  ON public.onboarding_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.onboarding_workflows
      JOIN public.employees ON employees.id = onboarding_workflows.employee_id
      WHERE onboarding_workflows.id = onboarding_documents.workflow_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "HR can manage all onboarding documents"
  ON public.onboarding_documents FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_onboarding_workflows_employee ON public.onboarding_workflows(employee_id);
CREATE INDEX idx_onboarding_workflows_status ON public.onboarding_workflows(status);
CREATE INDEX idx_onboarding_tasks_workflow ON public.onboarding_tasks(workflow_id);
CREATE INDEX idx_onboarding_tasks_status ON public.onboarding_tasks(status);
CREATE INDEX idx_onboarding_documents_workflow ON public.onboarding_documents(workflow_id);

-- Trigger to update workflow progress
CREATE OR REPLACE FUNCTION update_workflow_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
BEGIN
  -- Count total and completed tasks
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM public.onboarding_tasks
  WHERE workflow_id = COALESCE(NEW.workflow_id, OLD.workflow_id);
  
  -- Calculate progress percentage
  IF total_tasks > 0 THEN
    new_progress := (completed_tasks * 100 / total_tasks);
  ELSE
    new_progress := 0;
  END IF;
  
  -- Update workflow
  UPDATE public.onboarding_workflows
  SET 
    progress_percentage = new_progress,
    status = CASE 
      WHEN new_progress = 100 THEN 'completed'
      WHEN new_progress > 0 THEN 'in_progress'
      ELSE 'not_started'
    END,
    completed_at = CASE WHEN new_progress = 100 THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.workflow_id, OLD.workflow_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_workflow_progress
AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_tasks
FOR EACH ROW
EXECUTE FUNCTION update_workflow_progress();

-- Function to automatically create onboarding workflow for new employees
CREATE OR REPLACE FUNCTION create_default_onboarding_workflow()
RETURNS TRIGGER AS $$
DECLARE
  workflow_id UUID;
BEGIN
  -- Create onboarding workflow
  INSERT INTO public.onboarding_workflows (employee_id, status, started_at)
  VALUES (NEW.id, 'in_progress', NOW())
  RETURNING id INTO workflow_id;
  
  -- Create default onboarding tasks
  INSERT INTO public.onboarding_tasks (workflow_id, title, description, task_type, priority, due_date, order_index)
  VALUES
    (workflow_id, 'Complete profile setup', 'Fill in all required personal and professional information', 'document', 'high', NEW.hire_date, 1),
    (workflow_id, 'Review company policies', 'Read and acknowledge company policies and code of conduct', 'document', 'high', NEW.hire_date + INTERVAL '1 day', 2),
    (workflow_id, 'Complete security training', 'Complete mandatory security and compliance training modules', 'training', 'high', NEW.hire_date + INTERVAL '2 days', 3),
    (workflow_id, 'Set up development environment', 'Install required software and configure development tools', 'system_access', 'medium', NEW.hire_date + INTERVAL '3 days', 4),
    (workflow_id, 'Team introduction meeting', 'Meet with team members and understand team structure', 'meeting', 'medium', NEW.hire_date + INTERVAL '1 day', 5),
    (workflow_id, 'Manager 1:1 session', 'Initial one-on-one meeting with direct manager', 'meeting', 'high', NEW.hire_date + INTERVAL '1 day', 6),
    (workflow_id, 'Equipment setup', 'Receive and set up workstation, laptop, and other equipment', 'equipment', 'high', NEW.hire_date, 7),
    (workflow_id, 'Office orientation', 'Tour of office facilities and introduction to support staff', 'orientation', 'medium', NEW.hire_date, 8);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_onboarding_workflow
AFTER INSERT ON public.employees
FOR EACH ROW
EXECUTE FUNCTION create_default_onboarding_workflow();