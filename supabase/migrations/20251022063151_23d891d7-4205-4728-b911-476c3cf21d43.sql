-- Insert demo interview with analysis for testing
-- First, we need a demo resume and interview

DO $$
DECLARE
  demo_resume_id UUID;
  demo_interview_id UUID;
  demo_job_role_id UUID;
BEGIN
  -- Get or create a job role for demo
  SELECT id INTO demo_job_role_id FROM public.job_roles WHERE title = 'Senior Software Engineer' LIMIT 1;
  
  IF demo_job_role_id IS NULL THEN
    INSERT INTO public.job_roles (title, description, department, requirements, status)
    VALUES (
      'Senior Software Engineer',
      'Lead development of scalable web applications',
      'Engineering',
      '["5+ years experience", "React/TypeScript", "System Design", "Leadership"]'::jsonb,
      'active'
    )
    RETURNING id INTO demo_job_role_id;
  END IF;

  -- Insert demo resume (real source for live demo)
  INSERT INTO public.resumes (
    candidate_name,
    email,
    phone,
    position_applied,
    source,
    screening_status,
    pipeline_stage,
    job_role_id,
    ai_score,
    parsed_data
  )
  VALUES (
    'Alex Johnson (DEMO)',
    'alex.johnson.demo@example.com',
    '+1-555-0123',
    'Senior Software Engineer',
    'real',
    'selected',
    'interview_completed',
    demo_job_role_id,
    88,
    '{"skills": ["React", "TypeScript", "Node.js", "System Design"], "experience": "7 years", "education": "BS Computer Science"}'::jsonb
  )
  RETURNING id INTO demo_resume_id;

  -- Insert demo interview
  INSERT INTO public.interviews (
    resume_id,
    candidate_name,
    candidate_email,
    position,
    interview_type,
    status,
    scheduled_at,
    completed_at,
    ai_score,
    ai_summary,
    transcript,
    video_url,
    audio_url,
    duration_seconds
  )
  VALUES (
    demo_resume_id,
    'Alex Johnson (DEMO)',
    'alex.johnson.demo@example.com',
    'Senior Software Engineer',
    'ai_video',
    'completed',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    88,
    'Excellent candidate with strong technical skills and clear communication. Demonstrated deep understanding of system design and React best practices. Showed confidence and enthusiasm throughout the interview.',
    'Interviewer: Tell me about your experience with React and TypeScript.

Candidate: I have been working with React and TypeScript for over 5 years now. I started with class components and have evolved to use modern hooks and functional patterns. I particularly enjoy the type safety that TypeScript provides, which helps catch errors early in development.

Interviewer: Can you describe a challenging project you worked on?

Candidate: Certainly! In my previous role, I led the migration of a legacy monolithic application to a microservices architecture using React for the frontend and Node.js for the backend. The challenge was maintaining system stability while gradually migrating features. We implemented feature flags and comprehensive testing strategies to ensure smooth transitions.

Interviewer: How do you approach system design for scalable applications?

Candidate: I follow a systematic approach starting with understanding requirements and constraints. I focus on identifying potential bottlenecks, designing for horizontal scalability, implementing caching strategies, and ensuring proper monitoring and observability. I also believe in keeping things simple initially and adding complexity only when necessary.

Interviewer: Where do you see yourself in the next few years?

Candidate: I am excited about growing into a technical leadership role where I can mentor junior developers while continuing to contribute technically. I am particularly interested in working on challenging problems at scale and building high-performance engineering teams.',
    'https://demo-video.example.com/interview-123.webm',
    'https://demo-audio.example.com/interview-123.mp3',
    1245
  )
  RETURNING id INTO demo_interview_id;

  -- Insert comprehensive demo analysis
  INSERT INTO public.interview_analysis (
    interview_id,
    audio_transcript,
    transcript_confidence,
    overall_sentiment,
    sentiment_score,
    sentiment_details,
    detected_emotions,
    dominant_emotion,
    emotion_timeline,
    speech_pace,
    speech_clarity,
    filler_words_count,
    pause_analysis,
    facial_expressions,
    body_language_notes,
    engagement_score,
    ai_summary,
    key_insights,
    strengths,
    areas_of_improvement,
    communication_score,
    confidence_score,
    professionalism_score,
    overall_rating,
    analysis_completed_at
  )
  VALUES (
    demo_interview_id,
    'Interviewer: Tell me about your experience with React and TypeScript.

Candidate: I have been working with React and TypeScript for over 5 years now. I started with class components and have evolved to use modern hooks and functional patterns. I particularly enjoy the type safety that TypeScript provides, which helps catch errors early in development.

Interviewer: Can you describe a challenging project you worked on?

Candidate: Certainly! In my previous role, I led the migration of a legacy monolithic application to a microservices architecture using React for the frontend and Node.js for the backend. The challenge was maintaining system stability while gradually migrating features. We implemented feature flags and comprehensive testing strategies to ensure smooth transitions.

Interviewer: How do you approach system design for scalable applications?

Candidate: I follow a systematic approach starting with understanding requirements and constraints. I focus on identifying potential bottlenecks, designing for horizontal scalability, implementing caching strategies, and ensuring proper monitoring and observability. I also believe in keeping things simple initially and adding complexity only when necessary.

Interviewer: Where do you see yourself in the next few years?

Candidate: I am excited about growing into a technical leadership role where I can mentor junior developers while continuing to contribute technically. I am particularly interested in working on challenging problems at scale and building high-performance engineering teams.',
    92,
    'positive',
    0.78,
    '{"positive_aspects": ["Clear articulation of technical concepts", "Demonstrated leadership experience", "Enthusiasm about growth opportunities"], "negative_aspects": ["Could provide more specific metrics", "Limited discussion of failure scenarios"], "confidence": 85}'::jsonb,
    '[
      {"emotion": "confidence", "intensity": 85, "timestamp": "early"},
      {"emotion": "enthusiasm", "intensity": 90, "timestamp": "mid"},
      {"emotion": "professional", "intensity": 88, "timestamp": "late"}
    ]'::jsonb,
    'confidence',
    '[
      {"timestamp": 0, "emotion": "neutral", "intensity": 70},
      {"timestamp": 5, "emotion": "confidence", "intensity": 85},
      {"timestamp": 10, "emotion": "enthusiasm", "intensity": 90},
      {"timestamp": 15, "emotion": "confidence", "intensity": 88}
    ]'::jsonb,
    145,
    87,
    3,
    '{"average_pause": 1.8, "long_pauses": 2, "natural_rhythm": true}'::jsonb,
    '[
      {"timestamp": 0, "expression": "neutral", "confidence": 85},
      {"timestamp": 300, "expression": "smile", "confidence": 92},
      {"timestamp": 600, "expression": "focused", "confidence": 88},
      {"timestamp": 900, "expression": "smile", "confidence": 90}
    ]'::jsonb,
    'Excellent posture throughout interview. Maintained strong eye contact with camera. Natural hand gestures when explaining technical concepts. Relaxed but professional demeanor. Smiled appropriately and showed genuine interest in the position.',
    89,
    'Excellent candidate with strong technical skills and clear communication. Demonstrated deep understanding of system design and React best practices. Showed confidence and enthusiasm throughout the interview. Leadership experience evident in project descriptions. Good balance of technical depth and business awareness.',
    ARRAY[
      'Strong technical foundation in React, TypeScript, and system design',
      'Demonstrated leadership through successful migration project',
      'Clear growth mindset and interest in mentorship',
      'Good understanding of scalability and best practices',
      'Natural communicator with ability to explain complex concepts'
    ],
    ARRAY[
      'Excellent communication skills - clear and articulate',
      'Strong technical expertise across full stack',
      'Leadership experience and mentorship mindset',
      'Problem-solving approach is systematic and thorough',
      'Demonstrates growth mindset and continuous learning'
    ],
    ARRAY[
      'Could benefit from more discussion of specific metrics and outcomes',
      'Might explore failure scenarios and lessons learned more deeply'
    ],
    90,
    87,
    89,
    88,
    NOW() - INTERVAL '1 day'
  );

END $$;