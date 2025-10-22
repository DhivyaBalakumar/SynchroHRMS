-- Create pulse surveys system
CREATE TABLE IF NOT EXISTS public.pulse_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'department', 'team', 'role')),
  target_ids JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pulse_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('rating', 'yes_no', 'multiple_choice', 'text')),
  options JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pulse_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.pulse_questions(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(survey_id, question_id, respondent_id)
);

-- Create performance wall rankings
CREATE TABLE IF NOT EXISTS public.performance_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  notes TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manager_id, employee_id)
);

-- Create career coaching interactions
CREATE TABLE IF NOT EXISTS public.career_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('skill_assessment', 'career_path', 'learning_recommendation', 'goal_setting')),
  ai_recommendations JSONB DEFAULT '{}'::jsonb,
  user_goals JSONB DEFAULT '[]'::jsonb,
  progress_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  current_level INTEGER NOT NULL CHECK (current_level BETWEEN 1 AND 5),
  target_level INTEGER CHECK (target_level BETWEEN 1 AND 5),
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pulse_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_surveys
CREATE POLICY "HR and managers can create surveys"
  ON public.pulse_surveys FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'hr'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'senior_manager'::app_role)
  );

CREATE POLICY "HR and managers can view surveys"
  ON public.pulse_surveys FOR SELECT
  USING (
    has_role(auth.uid(), 'hr'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'senior_manager'::app_role) OR
    has_role(auth.uid(), 'employee'::app_role)
  );

CREATE POLICY "Creators can update their surveys"
  ON public.pulse_surveys FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for pulse_questions
CREATE POLICY "Survey creators can manage questions"
  ON public.pulse_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pulse_surveys
      WHERE pulse_surveys.id = pulse_questions.survey_id
      AND pulse_surveys.created_by = auth.uid()
    )
  );

CREATE POLICY "All authenticated users can view questions"
  ON public.pulse_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pulse_surveys
      WHERE pulse_surveys.id = pulse_questions.survey_id
      AND pulse_surveys.status = 'active'
    )
  );

-- RLS Policies for pulse_responses
CREATE POLICY "Users can submit their own responses"
  ON public.pulse_responses FOR INSERT
  WITH CHECK (respondent_id = auth.uid());

CREATE POLICY "Users can view their own responses"
  ON public.pulse_responses FOR SELECT
  USING (respondent_id = auth.uid());

CREATE POLICY "Survey creators can view all responses"
  ON public.pulse_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pulse_surveys
      WHERE pulse_surveys.id = pulse_responses.survey_id
      AND pulse_surveys.created_by = auth.uid()
    )
  );

-- RLS Policies for performance_rankings
CREATE POLICY "Managers can manage their team rankings"
  ON public.performance_rankings FOR ALL
  USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "HR can view all rankings"
  ON public.performance_rankings FOR SELECT
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for career_coaching_sessions
CREATE POLICY "Users can manage their own coaching sessions"
  ON public.career_coaching_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "HR can view coaching sessions"
  ON public.career_coaching_sessions FOR SELECT
  USING (has_role(auth.uid(), 'hr'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for skill_assessments
CREATE POLICY "Users can manage their own skill assessments"
  ON public.skill_assessments FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers and HR can view skill assessments"
  ON public.skill_assessments FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_role(auth.uid(), 'hr'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'senior_manager'::app_role)
  );

-- Create indexes
CREATE INDEX idx_pulse_surveys_status ON public.pulse_surveys(status);
CREATE INDEX idx_pulse_surveys_created_by ON public.pulse_surveys(created_by);
CREATE INDEX idx_pulse_questions_survey ON public.pulse_questions(survey_id);
CREATE INDEX idx_pulse_responses_survey ON public.pulse_responses(survey_id);
CREATE INDEX idx_pulse_responses_respondent ON public.pulse_responses(respondent_id);
CREATE INDEX idx_performance_rankings_manager ON public.performance_rankings(manager_id);
CREATE INDEX idx_performance_rankings_employee ON public.performance_rankings(employee_id);
CREATE INDEX idx_career_coaching_user ON public.career_coaching_sessions(user_id);
CREATE INDEX idx_skill_assessments_user ON public.skill_assessments(user_id);