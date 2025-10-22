-- Add dummy performance metrics for all employees
INSERT INTO performance_metrics (employee_id, metric_type, score, period_start, period_end, comments, evaluated_by)
SELECT 
  e.id,
  metric_type,
  70 + (RANDOM() * 30)::integer,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE,
  CASE metric_type
    WHEN 'attendance' THEN 'Excellent attendance record'
    WHEN 'project_completion' THEN 'Consistently meets targets and delivers quality work'
    WHEN 'quality' THEN 'High attention to detail and code quality'
    WHEN 'teamwork' THEN 'Excellent collaboration with team members'
    WHEN 'innovation' THEN 'Brings creative solutions to challenges'
    WHEN 'overall' THEN 'Strong overall performance'
  END,
  (SELECT id FROM employees WHERE position LIKE '%Manager%' LIMIT 1)
FROM employees e
CROSS JOIN (
  SELECT unnest(ARRAY['attendance', 'project_completion', 'quality', 'teamwork', 'innovation', 'overall']) as metric_type
) metrics
WHERE e.status = 'active'
ON CONFLICT DO NOTHING;

-- Add attendance records for the last 30 days
INSERT INTO attendance (employee_id, date, sign_in_time, sign_out_time, status)
SELECT 
  e.id,
  date_series::date,
  date_series::date + TIME '09:00:00' + (RANDOM() * INTERVAL '30 minutes'),
  date_series::date + TIME '18:00:00' + (RANDOM() * INTERVAL '1 hour'),
  CASE 
    WHEN RANDOM() < 0.05 THEN 'absent'
    WHEN RANDOM() < 0.1 THEN 'half_day'
    ELSE 'present'
  END
FROM employees e
CROSS JOIN generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '1 day',
  INTERVAL '1 day'
) as date_series
WHERE e.status = 'active'
  AND EXTRACT(DOW FROM date_series) NOT IN (0, 6)
ON CONFLICT DO NOTHING;

-- Initialize leave balances for all employees
INSERT INTO leave_balance (employee_id, year, casual_leave, sick_leave, earned_leave)
SELECT 
  id,
  EXTRACT(year FROM CURRENT_DATE)::integer,
  12,
  12,
  18
FROM employees
WHERE status = 'active'
ON CONFLICT DO NOTHING;

-- Add some leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_count, reason, status, approved_by, approved_at)
SELECT 
  e.id,
  CASE (RANDOM() * 4)::integer
    WHEN 0 THEN 'casual'
    WHEN 1 THEN 'sick'
    WHEN 2 THEN 'earned'
    ELSE 'unpaid'
  END,
  CURRENT_DATE + (RANDOM() * 30)::integer,
  CURRENT_DATE + (RANDOM() * 30)::integer + (1 + RANDOM() * 3)::integer,
  (1 + RANDOM() * 3)::integer,
  CASE (RANDOM() * 4)::integer
    WHEN 0 THEN 'Personal work'
    WHEN 1 THEN 'Medical appointment'
    WHEN 2 THEN 'Family event'
    ELSE 'Vacation'
  END,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    ELSE 'rejected'
  END,
  (SELECT id FROM employees WHERE position LIKE '%Manager%' LIMIT 1),
  CASE WHEN RANDOM() > 0.3 THEN now() - INTERVAL '1 day' ELSE NULL END
FROM employees e
WHERE e.status = 'active'
LIMIT 20
ON CONFLICT DO NOTHING;

-- Add notifications for employees
INSERT INTO notifications (employee_id, type, title, message, priority)
SELECT 
  e.id,
  CASE (RANDOM() * 5)::integer
    WHEN 0 THEN 'announcement'
    WHEN 1 THEN 'team_message'
    WHEN 2 THEN 'deadline'
    WHEN 3 THEN 'hr_update'
    ELSE 'system'
  END,
  CASE (RANDOM() * 5)::integer
    WHEN 0 THEN 'Team Meeting Tomorrow'
    WHEN 1 THEN 'New Message from Team'
    WHEN 2 THEN 'Project Deadline Approaching'
    WHEN 3 THEN 'HR Policy Update'
    ELSE 'System Maintenance Notice'
  END,
  CASE (RANDOM() * 5)::integer
    WHEN 0 THEN 'Team sync meeting at 10 AM tomorrow. Please join on time'
    WHEN 1 THEN 'Your team leader has sent you a message. Check your inbox'
    WHEN 2 THEN 'Project ABC deadline is in 3 days. Please ensure all tasks are completed'
    WHEN 3 THEN 'New HR policy regarding remote work has been published'
    ELSE 'Scheduled system maintenance tonight from 2-4 AM'
  END,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'normal'
    ELSE 'high'
  END
FROM employees e
CROSS JOIN generate_series(1, 3) as n
WHERE e.status = 'active'
ON CONFLICT DO NOTHING;

-- Add salary records
INSERT INTO salary_records (employee_id, base_salary, allowances, deductions, net_salary, effective_from, is_current)
SELECT 
  id,
  50000 + (RANDOM() * 100000)::integer,
  (5000 + RANDOM() * 10000)::numeric,
  (3000 + RANDOM() * 5000)::numeric,
  (50000 + (RANDOM() * 100000))::numeric * 0.85,
  CURRENT_DATE - INTERVAL '6 months',
  true
FROM employees
WHERE status = 'active'
ON CONFLICT DO NOTHING;

-- Add payslips for the last 3 months
INSERT INTO payslips (employee_id, year, month, gross_salary, deductions, net_salary, status, payment_date, salary_record_id)
SELECT 
  e.id,
  EXTRACT(year FROM month_date)::integer,
  EXTRACT(month FROM month_date)::integer,
  sr.base_salary + COALESCE(sr.allowances, 0),
  COALESCE(sr.deductions, 0),
  sr.net_salary,
  'paid',
  (month_date + INTERVAL '1 month' - INTERVAL '1 day')::date,
  sr.id
FROM employees e
JOIN salary_records sr ON sr.employee_id = e.id
CROSS JOIN generate_series(
  DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months',
  DATE_TRUNC('month', CURRENT_DATE),
  INTERVAL '1 month'
) as month_date
WHERE e.status = 'active'
ON CONFLICT DO NOTHING;

-- Add project tasks
INSERT INTO project_tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours)
SELECT 
  p.id,
  CASE (RANDOM() * 5)::integer
    WHEN 0 THEN 'Implement user authentication'
    WHEN 1 THEN 'Design database schema'
    WHEN 2 THEN 'Create API endpoints'
    WHEN 3 THEN 'Write unit tests'
    ELSE 'Update documentation'
  END,
  'Task description and requirements',
  CASE (RANDOM() * 4)::integer
    WHEN 0 THEN 'todo'
    WHEN 1 THEN 'in_progress'
    WHEN 2 THEN 'review'
    ELSE 'done'
  END,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  tm.employee_id,
  CURRENT_DATE + (RANDOM() * 30)::integer,
  (8 + RANDOM() * 32)::integer
FROM projects p
JOIN team_members tm ON tm.team_id = p.team_id
LIMIT 50
ON CONFLICT DO NOTHING;

-- Add employee sentiment data
INSERT INTO employee_sentiment (employee_id, period_start, period_end, sentiment_score, engagement_score, wellbeing_score)
SELECT 
  id,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE,
  (50 + RANDOM() * 50)::integer,
  (50 + RANDOM() * 50)::integer,
  (50 + RANDOM() * 50)::integer
FROM employees
WHERE status = 'active'
ON CONFLICT DO NOTHING;

-- Add manager insights
INSERT INTO manager_insights (manager_id, insight_type, title, description, priority, confidence_score)
SELECT 
  e.id,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'performance'
    WHEN 1 THEN 'resource'
    ELSE 'risk'
  END,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'Team Performance Above Target'
    WHEN 1 THEN 'Resource Optimization Opportunity'
    ELSE 'Potential Delay Risk'
  END,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'Your team has exceeded performance targets this quarter'
    WHEN 1 THEN 'Consider reallocating resources from Project A to Project B'
    ELSE 'Project deadline may be at risk due to resource constraints'
  END,
  CASE (RANDOM() * 3)::integer
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  (70 + RANDOM() * 30)::integer
FROM employees e
WHERE (e.position LIKE '%Manager%' OR e.position LIKE '%Lead%')
  AND e.status = 'active'
LIMIT 10
ON CONFLICT DO NOTHING;