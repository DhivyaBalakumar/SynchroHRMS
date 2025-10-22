-- Insert sample interviews with different statuses to populate all categories

DO $$
DECLARE
  sample_job_role_id uuid;
  resume_id_1 uuid;
  resume_id_2 uuid;
  resume_id_3 uuid;
  resume_id_4 uuid;
  resume_id_5 uuid;
  resume_id_6 uuid;
  resume_id_7 uuid;
  resume_id_8 uuid;
BEGIN
  -- Get a job role ID
  SELECT id INTO sample_job_role_id FROM job_roles LIMIT 1;
  
  -- If no job role exists, create one
  IF sample_job_role_id IS NULL THEN
    INSERT INTO job_roles (title, department, description, status)
    VALUES ('Software Engineer', 'Engineering', 'Software development position', 'active')
    RETURNING id INTO sample_job_role_id;
  END IF;
  
  -- Insert sample resumes and get their IDs
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Sarah Martinez', 'sarah.martinez.demo@example.com', '+1234567891', 'Senior Software Engineer', 'selected', 'scheduled', sample_job_role_id)
  RETURNING id INTO resume_id_1;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Michael Chen', 'michael.chen.demo@example.com', '+1234567892', 'Product Manager', 'selected', 'in_progress', sample_job_role_id)
  RETURNING id INTO resume_id_2;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Emily Johnson', 'emily.johnson.demo@example.com', '+1234567893', 'UX Designer', 'selected', 'completed', sample_job_role_id)
  RETURNING id INTO resume_id_3;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('David Kim', 'david.kim.demo@example.com', '+1234567894', 'Data Analyst', 'rejected', 'cancelled', sample_job_role_id)
  RETURNING id INTO resume_id_4;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Lisa Anderson', 'lisa.anderson.demo@example.com', '+1234567895', 'DevOps Engineer', 'selected', 'scheduled', sample_job_role_id)
  RETURNING id INTO resume_id_5;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Robert Taylor', 'robert.taylor.demo@example.com', '+1234567896', 'Marketing Manager', 'selected', 'completed', sample_job_role_id)
  RETURNING id INTO resume_id_6;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Jennifer White', 'jennifer.white.demo@example.com', '+1234567897', 'HR Specialist', 'selected', 'in_progress', sample_job_role_id)
  RETURNING id INTO resume_id_7;
  
  INSERT INTO resumes (candidate_name, email, phone, position_applied, screening_status, pipeline_stage, job_role_id)
  VALUES ('Christopher Lee', 'chris.lee.demo@example.com', '+1234567898', 'Sales Executive', 'rejected', 'cancelled', sample_job_role_id)
  RETURNING id INTO resume_id_8;

  -- Insert scheduled interviews
  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, resume_id, ai_score)
  VALUES ('Sarah Martinez', 'sarah.martinez.demo@example.com', 'Senior Software Engineer', 'scheduled', NOW() + INTERVAL '2 days', resume_id_1, 85);

  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, resume_id)
  VALUES ('Lisa Anderson', 'lisa.anderson.demo@example.com', 'DevOps Engineer', 'scheduled', NOW() + INTERVAL '3 days', resume_id_5);

  -- Insert in-progress interviews
  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, resume_id, duration_seconds, transcript)
  VALUES ('Michael Chen', 'michael.chen.demo@example.com', 'Product Manager', 'in_progress', NOW() - INTERVAL '30 minutes', resume_id_2, 1800, 
    '[{"speaker": "AI", "text": "Hello Michael, welcome to the interview."}]'::text);

  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, resume_id, duration_seconds, transcript)
  VALUES ('Jennifer White', 'jennifer.white.demo@example.com', 'HR Specialist', 'in_progress', NOW() - INTERVAL '15 minutes', resume_id_7, 900,
    '[{"speaker": "AI", "text": "Tell me about your HR experience."}]'::text);

  -- Insert completed interviews
  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, completed_at, resume_id, ai_score, duration_seconds, transcript, ai_summary)
  VALUES ('Emily Johnson', 'emily.johnson.demo@example.com', 'UX Designer', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours', resume_id_3, 92, 1245,
    '[{"speaker": "AI", "text": "Tell me about your design process."}, {"speaker": "Candidate", "text": "I follow user-centered design principles..."}]'::text,
    'Excellent communication skills and strong portfolio. Demonstrated deep understanding of UX principles and user research methodologies.');

  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, completed_at, resume_id, ai_score, duration_seconds, transcript, ai_summary)
  VALUES ('Robert Taylor', 'robert.taylor.demo@example.com', 'Marketing Manager', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 22 hours', resume_id_6, 88, 1456,
    '[{"speaker": "AI", "text": "What marketing strategies have you implemented?"}, {"speaker": "Candidate", "text": "I have led several successful digital campaigns..."}]'::text,
    'Strong marketing background with proven track record. Good strategic thinking and data-driven approach to campaigns.');

  -- Insert cancelled interviews
  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, resume_id, feedback)
  VALUES ('David Kim', 'david.kim.demo@example.com', 'Data Analyst', 'cancelled', NOW() - INTERVAL '1 day', resume_id_4,
    '{"reason": "Candidate accepted another offer"}'::jsonb);

  INSERT INTO interviews (candidate_name, candidate_email, position, status, scheduled_at, resume_id, feedback)
  VALUES ('Christopher Lee', 'chris.lee.demo@example.com', 'Sales Executive', 'cancelled', NOW() - INTERVAL '4 days', resume_id_8,
    '{"reason": "Did not meet technical requirements"}'::jsonb);

END $$;