-- Add source
ALTER TABLE employees ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'real';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'real';

-- Demo employees
INSERT INTO employees (user_id, email, full_name, employee_id, status, position, hire_date, source) VALUES
  (NULL, 'sarah.j@co.com', 'Sarah Johnson', 'EMP10001', 'active', 'Senior Developer', '2023-01-15', 'demo'),
  (NULL, 'michael.c@co.com', 'Michael Chen', 'EMP10002', 'active', 'Frontend Developer', '2023-03-20', 'demo'),
  (NULL, 'emily.d@co.com', 'Emily Davis', 'EMP10003', 'active', 'Backend Developer', '2023-06-10', 'demo')
ON CONFLICT (employee_id) DO NOTHING;

-- Team leader as member
INSERT INTO team_members (team_id, employee_id, role, joined_at)
SELECT t.id, t.team_leader_id, 'Team Lead', NOW() - INTERVAL '6 months' FROM teams t WHERE NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.id AND tm.employee_id = t.team_leader_id);

-- Demo members
INSERT INTO team_members (team_id, employee_id, role, joined_at)
SELECT (SELECT id FROM teams LIMIT 1), e.id, e.position, NOW() - INTERVAL '3 months' FROM employees e WHERE e.source = 'demo' AND NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.employee_id = e.id);

-- Projects
INSERT INTO projects (name, description, team_id, start_date, end_date, status, progress, source)
SELECT 'Customer Portal', 'Portal redesign', t.id, CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '4 months', 'active', 65, 'demo' FROM teams t LIMIT 1;

-- Performance
INSERT INTO performance_metrics (employee_id, metric_type, score, period_start, period_end, comments)
SELECT e.id, 'overall', 90, CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE, 'Excellent' FROM employees e WHERE e.source = 'demo';

-- Salary
INSERT INTO salary_records (employee_id, base_salary, allowances, deductions, net_salary, effective_from, is_current)
SELECT e.id, CASE WHEN e.position LIKE '%Senior%' THEN 95000 ELSE 75000 END, 0, 0, CASE WHEN e.position LIKE '%Senior%' THEN 95000 ELSE 75000 END, e.hire_date, TRUE FROM employees e WHERE e.source = 'demo' AND NOT EXISTS (SELECT 1 FROM salary_records sr WHERE sr.employee_id = e.id);

-- Skills
INSERT INTO skills (name, category, description) VALUES ('React', 'Frontend', 'UI'), ('TypeScript', 'Frontend', 'Typed') ON CONFLICT (name) DO NOTHING;

INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, years_experience)
SELECT e.id, s.id, 'expert', 3 FROM employees e CROSS JOIN skills s WHERE e.source = 'demo' AND NOT EXISTS (SELECT 1 FROM employee_skills es WHERE es.employee_id = e.id AND es.skill_id = s.id) LIMIT 6;

-- Attendance
INSERT INTO attendance (employee_id, date, sign_in_time, status)
SELECT e.id, CURRENT_DATE, CURRENT_DATE + TIME '09:00:00', 'present' FROM employees e WHERE e.source = 'demo';

-- Insights
INSERT INTO manager_insights (manager_id, insight_type, priority, title, description, confidence_score)
SELECT t.team_leader_id, 'performance', 'medium', 'Team Performance Up', 'Velocity improving', 85 FROM teams t LIMIT 1;