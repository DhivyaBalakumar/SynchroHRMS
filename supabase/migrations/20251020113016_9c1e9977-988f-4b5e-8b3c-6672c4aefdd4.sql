-- Fix infinite recursion in teams RLS by using security definer functions
-- Drop existing problematic policies on teams table
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team leaders can update their teams" ON teams;
DROP POLICY IF EXISTS "HR can manage all teams" ON teams;

-- Create security definer function to check if user is team leader
CREATE OR REPLACE FUNCTION public.is_team_leader(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM teams t
    JOIN employees e ON t.team_leader_id = e.id
    WHERE t.id = _team_id
      AND e.user_id = _user_id
  )
$$;

-- Create security definer function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN employees e ON tm.employee_id = e.id
    WHERE tm.team_id = _team_id
      AND e.user_id = _user_id
  )
$$;

-- Recreate teams policies using security definer functions
CREATE POLICY "Team members can view their teams"
ON teams FOR SELECT
USING (
  public.has_role(auth.uid(), 'hr') OR
  public.is_team_leader(auth.uid(), id) OR
  public.is_team_member(auth.uid(), id)
);

CREATE POLICY "Team leaders can update their teams"
ON teams FOR UPDATE
USING (public.is_team_leader(auth.uid(), id));

CREATE POLICY "HR can manage all teams"
ON teams FOR ALL
USING (public.has_role(auth.uid(), 'hr'));

-- Now populate demo data with proper connections
DO $$
DECLARE
  v_manager_user_id uuid;
  v_manager_employee_id uuid;
  v_employee_user_ids uuid[];
  v_employee_ids uuid[];
  v_team_id uuid;
  v_project_id uuid;
  v_dept_id uuid;
BEGIN
  -- Get first manager user
  SELECT e.user_id, e.id INTO v_manager_user_id, v_manager_employee_id
  FROM employees e
  JOIN user_roles ur ON e.user_id = ur.user_id
  WHERE ur.role = 'manager'
  LIMIT 1;
  
  -- Get employee users (excluding the manager)
  SELECT array_agg(e.user_id), array_agg(e.id) INTO v_employee_user_ids, v_employee_ids
  FROM employees e
  JOIN user_roles ur ON e.user_id = ur.user_id
  WHERE ur.role IN ('employee', 'intern')
  AND e.user_id != v_manager_user_id
  LIMIT 5;

  IF v_manager_employee_id IS NOT NULL THEN
    -- Create a department if it doesn't exist
    SELECT id INTO v_dept_id FROM departments WHERE name = 'Engineering' LIMIT 1;
    
    IF v_dept_id IS NULL THEN
      INSERT INTO departments (name, description, head_employee_id)
      VALUES ('Engineering', 'Software development and technical teams', v_manager_employee_id)
      RETURNING id INTO v_dept_id;
    END IF;

    -- Update manager's department
    UPDATE employees 
    SET department_id = v_dept_id, department = 'Engineering'
    WHERE id = v_manager_employee_id;

    -- Create or get team for manager
    SELECT id INTO v_team_id FROM teams WHERE team_leader_id = v_manager_employee_id LIMIT 1;
    
    IF v_team_id IS NULL THEN
      INSERT INTO teams (name, team_leader_id, description)
      VALUES ('Engineering Team Alpha', v_manager_employee_id, 'Core development team')
      RETURNING id INTO v_team_id;
    END IF;

    -- Add team members
    IF array_length(v_employee_ids, 1) > 0 THEN
      FOR i IN 1..array_length(v_employee_ids, 1) LOOP
        -- Update employee department
        UPDATE employees 
        SET department_id = v_dept_id, department = 'Engineering'
        WHERE id = v_employee_ids[i];
        
        -- Add to team
        INSERT INTO team_members (team_id, employee_id, role)
        VALUES (v_team_id, v_employee_ids[i], 'developer')
        ON CONFLICT DO NOTHING;
        
        -- Add notifications for employees
        INSERT INTO notifications (employee_id, type, title, message, priority)
        VALUES 
          (v_employee_ids[i], 'team_message', 'Welcome to the team!', 'You have been added to Engineering Team Alpha', 'normal'),
          (v_employee_ids[i], 'hr_update', 'Quarterly Review Due', 'Your quarterly performance review is coming up next week', 'high'),
          (v_employee_ids[i], 'announcement', 'Company Town Hall', 'Join us for the monthly town hall meeting on Friday', 'normal')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    -- Create projects for the team
    SELECT id INTO v_project_id FROM projects WHERE team_id = v_team_id LIMIT 1;
    
    IF v_project_id IS NULL THEN
      INSERT INTO projects (name, description, team_id, start_date, end_date, status, progress)
      VALUES ('Product Redesign', 'Complete redesign of our flagship product', v_team_id, CURRENT_DATE - interval '30 days', CURRENT_DATE + interval '60 days', 'active', 45)
      RETURNING id INTO v_project_id;
      
      INSERT INTO projects (name, description, team_id, start_date, end_date, status, progress)
      VALUES ('Mobile App Launch', 'Launch new mobile application', v_team_id, CURRENT_DATE - interval '15 days', CURRENT_DATE + interval '45 days', 'active', 30);
    END IF;

    -- Add project tasks if we have employees (using manager's user_id for created_by)
    IF v_project_id IS NOT NULL AND array_length(v_employee_ids, 1) >= 3 THEN
      INSERT INTO project_tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, created_by)
      VALUES
        (v_project_id, 'Design mockups', 'Create initial design mockups for approval', 'in_progress', 'high', v_employee_ids[1], CURRENT_DATE + interval '5 days', 20, 15, v_manager_user_id),
        (v_project_id, 'Backend API', 'Develop REST API endpoints', 'todo', 'high', v_employee_ids[2], CURRENT_DATE + interval '10 days', 40, NULL, v_manager_user_id),
        (v_project_id, 'Frontend Components', 'Build reusable UI components', 'in_progress', 'medium', v_employee_ids[3], CURRENT_DATE + interval '7 days', 30, 10, v_manager_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Add manager insights with correct insight_type values
    INSERT INTO manager_insights (manager_id, insight_type, title, description, priority, confidence_score, action_items)
    VALUES
      (v_manager_employee_id, 'performance', 'Team Velocity Increasing', 'Your team completed 15% more tasks this sprint compared to last sprint', 'medium', 92, jsonb_build_array(
        jsonb_build_object('title', 'Continue current practices', 'completed', false),
        jsonb_build_object('title', 'Share learnings in retrospective', 'completed', false)
      )),
      (v_manager_employee_id, 'resource_allocation', 'Workload Imbalance Detected', 'Some team members have 40% more tasks assigned than others', 'high', 88, jsonb_build_array(
        jsonb_build_object('title', 'Review task distribution', 'completed', false),
        jsonb_build_object('title', 'Redistribute tasks in next planning', 'completed', false)
      )),
      (v_manager_employee_id, 'wellbeing', 'Team Morale High', 'Recent pulse surveys show 85% positive sentiment across the team', 'low', 95, jsonb_build_array(
        jsonb_build_object('title', 'Maintain team culture', 'completed', false)
      ))
    ON CONFLICT DO NOTHING;
  END IF;
END $$;