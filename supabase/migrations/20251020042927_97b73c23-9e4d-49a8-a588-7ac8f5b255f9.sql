ALTER TABLE employees ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'real';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'real';

DROP POLICY IF EXISTS "Team members can view their team members" ON team_members;
DROP POLICY IF EXISTS "Team leaders can manage their team members" ON team_members;
DROP POLICY IF EXISTS "HR can manage all team members" ON team_members;

CREATE POLICY "Team members can view team members" ON team_members FOR SELECT USING (team_id IN (SELECT t.id FROM teams t WHERE t.team_leader_id IN (SELECT e.id FROM employees e WHERE e.user_id = auth.uid())) OR employee_id IN (SELECT e.id FROM employees e WHERE e.user_id = auth.uid()));
CREATE POLICY "Team leaders can manage team members" ON team_members FOR ALL USING (team_id IN (SELECT t.id FROM teams t WHERE t.team_leader_id IN (SELECT e.id FROM employees e WHERE e.user_id = auth.uid())));
CREATE POLICY "HR can manage all team members" ON team_members FOR ALL USING (has_role(auth.uid(), 'hr'::app_role));

INSERT INTO employees (user_id, email, full_name, employee_id, status, position, hire_date, source) VALUES
  (NULL, 'sarah.j@co.com', 'Sarah Johnson', 'EMP10001', 'active', 'Senior Developer', '2023-01-15', 'demo'),
  (NULL, 'michael.c@co.com', 'Michael Chen', 'EMP10002', 'active', 'Frontend Developer', '2023-03-20', 'demo'),
  (NULL, 'emily.d@co.com', 'Emily Davis', 'EMP10003', 'active', 'Backend Developer', '2023-06-10', 'demo'),
  (NULL, 'james.w@co.com', 'James Wilson', 'EMP10004', 'active', 'DevOps Engineer', '2023-08-05', 'demo'),
  (NULL, 'lisa.b@co.com', 'Lisa Brown', 'EMP10005', 'active', 'QA Engineer', '2023-09-12', 'demo')
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO team_members (team_id, employee_id, role, joined_at)
SELECT t.id, t.team_leader_id, 'Team Lead', NOW() - INTERVAL '6 months' FROM teams t WHERE NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.id AND tm.employee_id = t.team_leader_id);

INSERT INTO team_members (team_id, employee_id, role, joined_at)
SELECT (SELECT id FROM teams LIMIT 1), e.id, e.position, NOW() - INTERVAL '3 months' FROM employees e WHERE e.source = 'demo' AND NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.employee_id = e.id);

INSERT INTO projects (name, description, team_id, start_date, end_date, status, progress, source) VALUES
  ((SELECT 'Customer Portal Redesign'), 'Portal overhaul', (SELECT id FROM teams LIMIT 1), CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '4 months', 'active', 65, 'demo'),
  ('Mobile App', 'Mobile app', (SELECT id FROM teams LIMIT 1), CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '5 months', 'active', 35, 'demo');

INSERT INTO performance_metrics (employee_id, metric_type, score, period_start, period_end, comments)
SELECT e.id, 'overall', 90, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 'Excellent' FROM employees e WHERE e.source = 'demo';

INSERT INTO salary_records (employee_id, base_salary, net_salary, effective_from, is_current)
SELECT e.id, CASE WHEN e.position LIKE '%Senior%' THEN 95000 ELSE 75000 END, CASE WHEN e.position LIKE '%Senior%' THEN 95000 ELSE 75000 END, e.hire_date, TRUE
FROM employees e WHERE e.source = 'demo' AND NOT EXISTS (SELECT 1 FROM salary_records sr WHERE sr.employee_id = e.id);

INSERT INTO skills (name, category, description) VALUES ('React', 'Frontend', 'UI'), ('TypeScript', 'Frontend', 'Typed'), ('Node.js', 'Backend', 'Runtime'), ('PostgreSQL', 'Database', 'DB'), ('Docker', 'DevOps', 'Container') ON CONFLICT (name) DO NOTHING;

INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, years_experience)
SELECT e.id, s.id, 'expert', 3 FROM employees e CROSS JOIN skills s WHERE e.source = 'demo' AND NOT EXISTS (SELECT 1 FROM employee_skills es WHERE es.employee_id = e.id AND es.skill_id = s.id) LIMIT 15;

INSERT INTO attendance (employee_id, date, sign_in_time, status)
SELECT e.id, CURRENT_DATE, CURRENT_DATE + TIME '09:00:00', 'present' FROM employees e WHERE e.source = 'demo';

INSERT INTO manager_insights (manager_id, insight_type, priority, title, description, confidence_score)
SELECT t.team_leader_id, 'performance', 'medium', 'Team Performance Improving', 'Velocity is up', 85 FROM teams t LIMIT 1;