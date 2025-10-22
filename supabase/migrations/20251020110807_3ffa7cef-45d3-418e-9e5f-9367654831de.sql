-- Clear existing recent demo data
DELETE FROM notifications WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM leave_requests WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM attendance WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM payslips WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM performance_metrics WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM employee_sentiment WHERE created_at > NOW() - INTERVAL '1 day';
DELETE FROM feedback_tickets WHERE created_at > NOW() - INTERVAL '1 day';

-- Insert comprehensive attendance data for the past month
INSERT INTO attendance (employee_id, date, sign_in_time, sign_out_time, status, notes)
SELECT 
  e.id,
  d::date,
  d::date + TIME '09:00:00',
  d::date + TIME '18:00:00',
  CASE 
    WHEN random() < 0.90 THEN 'present'
    WHEN random() < 0.95 THEN 'late'
    WHEN random() < 0.98 THEN 'half_day'
    ELSE 'absent'
  END,
  CASE 
    WHEN random() < 0.90 THEN 'Regular attendance'
    WHEN random() < 0.95 THEN 'Arrived 15 minutes late'
    ELSE 'Sick leave'
  END
FROM employees e
CROSS JOIN generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE,
  '1 day'::interval
) AS d
WHERE e.source = 'demo'
  AND EXTRACT(DOW FROM d) NOT IN (0, 6)
ON CONFLICT DO NOTHING;

-- Insert leave balance for all employees
INSERT INTO leave_balance (employee_id, year, casual_leave, sick_leave, earned_leave, maternity_leave, paternity_leave, unpaid_leave)
SELECT 
  id,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  12 - FLOOR(random() * 5)::integer,
  12 - FLOOR(random() * 3)::integer,
  18 - FLOOR(random() * 5)::integer,
  CASE WHEN random() < 0.3 THEN 90 ELSE 0 END,
  CASE WHEN random() < 0.7 THEN 15 ELSE 0 END,
  0
FROM employees
WHERE source = 'demo'
ON CONFLICT (employee_id, year) DO UPDATE SET
  casual_leave = EXCLUDED.casual_leave,
  sick_leave = EXCLUDED.sick_leave,
  earned_leave = EXCLUDED.earned_leave;

-- Insert realistic leave requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_count, reason, status, approved_by)
SELECT 
  e.id,
  CASE (random() * 3)::int
    WHEN 0 THEN 'casual'
    WHEN 1 THEN 'sick'
    ELSE 'earned'
  END,
  CURRENT_DATE + (random() * 60 - 30)::int,
  CURRENT_DATE + (random() * 60 - 25)::int,
  (random() * 4 + 1)::int,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Personal work'
    WHEN 1 THEN 'Family function'
    WHEN 2 THEN 'Medical appointment'
    ELSE 'Vacation'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    ELSE 'rejected'
  END,
  (SELECT id FROM employees WHERE source = 'demo' AND department = 'Human Resources' LIMIT 1)
FROM employees e
WHERE e.source = 'demo'
LIMIT 30
ON CONFLICT DO NOTHING;

-- Insert salary records and payslips
INSERT INTO payslips (employee_id, month, year, gross_salary, deductions, net_salary, status, payment_date)
SELECT 
  e.id,
  m.month,
  2025,
  CASE 
    WHEN e.position ILIKE '%senior%' THEN ROUND(120000 + (random() * 50000)::numeric, 2)
    WHEN e.position ILIKE '%manager%' THEN ROUND(150000 + (random() * 100000)::numeric, 2)
    WHEN e.position ILIKE '%lead%' THEN ROUND(100000 + (random() * 50000)::numeric, 2)
    WHEN e.position ILIKE '%intern%' THEN ROUND(20000 + (random() * 10000)::numeric, 2)
    ELSE ROUND(80000 + (random() * 40000)::numeric, 2)
  END,
  ROUND((random() * 5000 + 2000)::numeric, 2),
  CASE 
    WHEN e.position ILIKE '%senior%' THEN ROUND((120000 + (random() * 50000)::numeric) - (random() * 5000 + 2000)::numeric, 2)
    WHEN e.position ILIKE '%manager%' THEN ROUND((150000 + (random() * 100000)::numeric) - (random() * 5000 + 2000)::numeric, 2)
    WHEN e.position ILIKE '%lead%' THEN ROUND((100000 + (random() * 50000)::numeric) - (random() * 5000 + 2000)::numeric, 2)
    WHEN e.position ILIKE '%intern%' THEN ROUND((20000 + (random() * 10000)::numeric) - (random() * 1000 + 500)::numeric, 2)
    ELSE ROUND((80000 + (random() * 40000)::numeric) - (random() * 5000 + 2000)::numeric, 2)
  END,
  CASE WHEN m.month < EXTRACT(MONTH FROM CURRENT_DATE) THEN 'paid' ELSE 'pending' END,
  CASE WHEN m.month < EXTRACT(MONTH FROM CURRENT_DATE) THEN make_date(2025, m.month, 28) ELSE NULL END
FROM employees e
CROSS JOIN (SELECT generate_series(1, 10) AS month) m
WHERE e.source = 'demo'
ON CONFLICT DO NOTHING;

-- Insert performance metrics
INSERT INTO performance_metrics (employee_id, metric_type, score, period_start, period_end, comments, evaluated_by)
SELECT 
  e.id,
  CASE (random() * 6)::int
    WHEN 0 THEN 'attendance'
    WHEN 1 THEN 'project_completion'
    WHEN 2 THEN 'quality'
    WHEN 3 THEN 'teamwork'
    WHEN 4 THEN 'innovation'
    ELSE 'overall'
  END,
  (70 + random() * 30)::int,
  CURRENT_DATE - INTERVAL '3 months',
  CURRENT_DATE,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Excellent performance, consistently exceeds expectations'
    WHEN 1 THEN 'Good performance, meets all key objectives'
    ELSE 'Strong team player with great technical skills'
  END,
  (SELECT user_id FROM employees WHERE source = 'demo' AND position ILIKE '%manager%' LIMIT 1)
FROM employees e
WHERE e.source = 'demo'
ON CONFLICT DO NOTHING;

-- Insert employee sentiment
INSERT INTO employee_sentiment (employee_id, period_start, period_end, sentiment_score, engagement_score, wellbeing_score, feedback_text)
SELECT 
  id,
  CURRENT_DATE - INTERVAL '1 month',
  CURRENT_DATE,
  (70 + random() * 30)::int,
  (75 + random() * 25)::int,
  (80 + random() * 20)::int,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Great work environment, feeling motivated'
    WHEN 1 THEN 'Happy with the team collaboration and projects'
    WHEN 2 THEN 'Enjoying the learning opportunities'
    ELSE 'Satisfied with work-life balance'
  END
FROM employees
WHERE source = 'demo'
ON CONFLICT DO NOTHING;

-- Insert feedback tickets
INSERT INTO feedback_tickets (employee_id, subject, category, description, status, priority, assigned_to)
SELECT 
  e.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Equipment Request'
    WHEN 1 THEN 'Training Inquiry'
    WHEN 2 THEN 'Policy Question'
    WHEN 3 THEN 'Benefits Clarification'
    ELSE 'General Feedback'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'hr_query'
    WHEN 1 THEN 'technical_issue'
    WHEN 2 THEN 'feedback'
    WHEN 3 THEN 'complaint'
    ELSE 'suggestion'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'I would like to request a new laptop for better productivity'
    WHEN 1 THEN 'Can I get access to the advanced React training program?'
    WHEN 2 THEN 'Need clarification on the remote work policy'
    WHEN 3 THEN 'The office temperature is too cold'
    ELSE 'Suggestion: Add more collaboration spaces'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'open'
    WHEN 1 THEN 'in_progress'
    ELSE 'resolved'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'normal'
    WHEN 2 THEN 'high'
    ELSE 'urgent'
  END,
  (SELECT id FROM employees WHERE source = 'demo' AND department = 'Human Resources' LIMIT 1)
FROM employees e
WHERE e.source = 'demo' AND random() < 0.3
ON CONFLICT DO NOTHING;

-- Insert notifications with correct types
INSERT INTO notifications (employee_id, type, title, message, priority)
SELECT 
  e.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'announcement'
    WHEN 1 THEN 'team_message'
    WHEN 2 THEN 'deadline'
    WHEN 3 THEN 'hr_update'
    ELSE 'system'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'New Task Assigned'
    WHEN 1 THEN 'Leave Request Approved'
    WHEN 2 THEN 'Performance Review Scheduled'
    WHEN 3 THEN 'Company Announcement'
    ELSE 'Payslip Available'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'You have been assigned a new task: Update design system'
    WHEN 1 THEN 'Your leave request for 3 days has been approved'
    WHEN 2 THEN 'Your Q1 performance review is scheduled for next week'
    WHEN 3 THEN 'Important: New company policies effective from next month'
    ELSE 'Your salary for this month has been processed'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'normal'
    WHEN 2 THEN 'high'
    ELSE 'urgent'
  END
FROM employees e
WHERE e.source = 'demo' AND random() < 0.6
ON CONFLICT DO NOTHING;