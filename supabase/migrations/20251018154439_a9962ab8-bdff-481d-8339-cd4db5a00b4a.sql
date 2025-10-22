-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee skills table
CREATE TABLE public.employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  certified BOOLEAN DEFAULT false,
  certification_url TEXT,
  last_assessed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, skill_id)
);

-- Create project tasks table
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.employees(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team messages table
CREATE TABLE public.team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'message' CHECK (message_type IN ('message', 'announcement', 'alert', 'poll')),
  metadata JSONB,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.team_messages(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, employee_id, reaction)
);

-- Create employee sentiment table
CREATE TABLE public.employee_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  survey_id UUID REFERENCES public.surveys(id),
  sentiment_score INTEGER CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  wellbeing_score INTEGER CHECK (wellbeing_score >= 0 AND wellbeing_score <= 100),
  feedback_text TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resource allocations table
CREATE TABLE public.resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  allocation_percentage INTEGER NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  start_date DATE NOT NULL,
  end_date DATE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create manager insights table for AI suggestions
CREATE TABLE public.manager_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'resource_allocation', 'risk', 'opportunity', 'training', 'wellbeing')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB,
  affected_employees UUID[],
  affected_projects UUID[],
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_read BOOLEAN DEFAULT false,
  is_actioned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills
CREATE POLICY "Everyone can view skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "HR can manage skills"
  ON public.skills FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for employee_skills
CREATE POLICY "Employees can view their own skills"
  ON public.employee_skills FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Managers can view team member skills"
  ON public.employee_skills FOR SELECT
  USING (employee_id IN (
    SELECT tm.employee_id 
    FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.team_leader_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  ));

CREATE POLICY "HR can manage all employee skills"
  ON public.employee_skills FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for project_tasks
CREATE POLICY "Employees can view tasks assigned to them or their team"
  ON public.project_tasks FOR SELECT
  USING (
    assigned_to IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Managers can manage team tasks"
  ON public.project_tasks FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.teams t ON p.team_id = t.id
      WHERE t.team_leader_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "HR can manage all tasks"
  ON public.project_tasks FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for team_messages
CREATE POLICY "Team members can view their team messages"
  ON public.team_messages FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  ));

CREATE POLICY "Team members can send messages"
  ON public.team_messages FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
    AND sender_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  );

CREATE POLICY "HR can manage all messages"
  ON public.team_messages FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for message_reactions
CREATE POLICY "Team members can view reactions"
  ON public.message_reactions FOR SELECT
  USING (message_id IN (
    SELECT id FROM public.team_messages 
    WHERE team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
  ));

CREATE POLICY "Team members can react to messages"
  ON public.message_reactions FOR INSERT
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

-- RLS Policies for employee_sentiment
CREATE POLICY "Employees can view their own sentiment"
  ON public.employee_sentiment FOR SELECT
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Managers can view team sentiment"
  ON public.employee_sentiment FOR SELECT
  USING (employee_id IN (
    SELECT tm.employee_id 
    FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.team_leader_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  ));

CREATE POLICY "HR can manage all sentiment data"
  ON public.employee_sentiment FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for resource_allocations
CREATE POLICY "Managers can view team allocations"
  ON public.resource_allocations FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.teams t ON p.team_id = t.id
      WHERE t.team_leader_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Managers can manage team allocations"
  ON public.resource_allocations FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.teams t ON p.team_id = t.id
      WHERE t.team_leader_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "HR can manage all allocations"
  ON public.resource_allocations FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- RLS Policies for manager_insights
CREATE POLICY "Managers can view their own insights"
  ON public.manager_insights FOR SELECT
  USING (manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Managers can update their insights"
  ON public.manager_insights FOR UPDATE
  USING (manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "HR can manage all insights"
  ON public.manager_insights FOR ALL
  USING (has_role(auth.uid(), 'hr'::app_role));

-- Create indexes for performance
CREATE INDEX idx_employee_skills_employee ON public.employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill ON public.employee_skills(skill_id);
CREATE INDEX idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_assigned ON public.project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX idx_team_messages_team ON public.team_messages(team_id);
CREATE INDEX idx_team_messages_created ON public.team_messages(created_at DESC);
CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_employee_sentiment_employee ON public.employee_sentiment(employee_id);
CREATE INDEX idx_resource_allocations_project ON public.resource_allocations(project_id);
CREATE INDEX idx_resource_allocations_employee ON public.resource_allocations(employee_id);
CREATE INDEX idx_manager_insights_manager ON public.manager_insights(manager_id);
CREATE INDEX idx_manager_insights_created ON public.manager_insights(created_at DESC);

-- Create triggers for updating timestamps
CREATE TRIGGER update_employee_skills_updated_at
  BEFORE UPDATE ON public.employee_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_allocations_updated_at
  BEFORE UPDATE ON public.resource_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();