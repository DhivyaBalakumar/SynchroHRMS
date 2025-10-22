import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 50000 } = await req.json().catch(() => ({ count: 50000 }));
    const TOTAL_RESUMES = Math.min(Math.max(count, 1), 100000); // Between 1 and 100,000
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting data seeding for ${TOTAL_RESUMES} resumes...`);

    // Create job roles first
    const jobRolesData = [
      {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        description: 'Lead technical projects and mentor junior developers',
        requirements: ['5+ years experience', 'Python/JavaScript', 'System Design', 'Leadership'],
        vacancies: 5,
        urgency: 'urgent_hiring'
      },
      {
        title: 'Product Manager',
        department: 'Product',
        description: 'Define product strategy and roadmap',
        requirements: ['3+ years PM experience', 'Agile', 'Data Analysis', 'Communication'],
        vacancies: 3,
        urgency: 'hiring'
      },
      {
        title: 'Data Scientist',
        department: 'Data',
        description: 'Build ML models and analyze data',
        requirements: ['Python', 'ML/AI', 'Statistics', '2+ years experience'],
        vacancies: 8,
        urgency: 'urgent_hiring'
      },
      {
        title: 'UX Designer',
        department: 'Design',
        description: 'Create user-centered design solutions',
        requirements: ['Figma', 'User Research', 'Prototyping', 'Portfolio'],
        vacancies: 2,
        urgency: 'hiring_can_wait'
      },
      {
        title: 'Marketing Manager',
        department: 'Marketing',
        description: 'Lead marketing campaigns and strategy',
        requirements: ['Digital Marketing', 'SEO/SEM', 'Analytics', '4+ years'],
        vacancies: 4,
        urgency: 'hiring'
      }
    ];

    const { data: jobRoles, error: jobRolesError } = await supabaseClient
      .from('job_roles')
      .insert(jobRolesData)
      .select();

    let finalJobRoles = jobRoles;

    if (jobRolesError) {
      // If roles already exist, just fetch them
      const { data: existingRoles, error: fetchError } = await supabaseClient
        .from('job_roles')
        .select('*');
      
      if (fetchError) {
        console.error('Error fetching job roles:', fetchError);
        throw fetchError;
      }
      
      if (!existingRoles || existingRoles.length === 0) {
        throw jobRolesError;
      }
      
      console.log(`Using ${existingRoles.length} existing job roles`);
      finalJobRoles = existingRoles;
    } else {
      console.log(`Created ${jobRoles?.length} job roles`);
    }

    if (!finalJobRoles || finalJobRoles.length === 0) {
      throw new Error('No job roles available for seeding');
    }

    // Generate applicant names
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Barbara', 
      'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
      'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra',
      'Steven', 'Ashley', 'Andrew', 'Kimberly', 'Paul', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle',
      'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah', 'Ronald', 'Stephanie'];
    
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
      'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

    const skills = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 
      'Machine Learning', 'Data Analysis', 'Product Management', 'Agile', 'Scrum', 'UI/UX Design', 'Figma', 
      'Marketing', 'SEO', 'Content Strategy', 'Leadership', 'Communication', 'Project Management'];

    // Generate resumes in batches
    const BATCH_SIZE = 1000;
    let totalCreated = 0;

    for (let batch = 0; batch < Math.ceil(TOTAL_RESUMES / BATCH_SIZE); batch++) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_RESUMES - totalCreated);
      const resumes = [];

      for (let i = 0; i < batchSize; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const candidateName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 10000)}@example.com`;
        const jobRole = finalJobRoles[Math.floor(Math.random() * finalJobRoles.length)];
        
        // Random candidate quality
        const quality = Math.random();
        const aiScore = quality > 0.7 ? Math.floor(80 + Math.random() * 20) :
                       quality > 0.4 ? Math.floor(60 + Math.random() * 20) :
                       Math.floor(30 + Math.random() * 30);

        const candidateSkills: string[] = [];
        const numSkills = Math.floor(3 + Math.random() * 5);
        for (let j = 0; j < numSkills; j++) {
          const skill = skills[Math.floor(Math.random() * skills.length)];
          if (!candidateSkills.includes(skill)) {
            candidateSkills.push(skill);
          }
        }

        resumes.push({
          candidate_name: candidateName,
          email: email,
          phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          position_applied: jobRole.title,
          job_role_id: jobRole.id,
          ai_score: aiScore,
          screening_status: 'pending',
          pipeline_stage: 'screening',
          source: 'test', // Mark as test data
          parsed_data: {
            skills: candidateSkills,
            experience: Math.floor(Math.random() * 15) + ' years',
            education: ['Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 3)]
          },
          ai_analysis: {
            overall_score: aiScore,
            skills_match: Math.floor(50 + Math.random() * 50),
            recommendation: aiScore > 75 ? 'strongly_recommended' : 
                          aiScore > 60 ? 'recommended' : 
                          aiScore > 45 ? 'maybe' : 'not_recommended',
            summary: `Candidate shows ${aiScore > 70 ? 'strong' : aiScore > 50 ? 'moderate' : 'limited'} alignment with role requirements.`,
            key_strengths: candidateSkills.slice(0, 3)
          }
        });
      }

      const { error: resumesError } = await supabaseClient
        .from('resumes')
        .insert(resumes);

      if (resumesError) {
        console.error('Error in batch', batch, ':', resumesError);
        throw resumesError;
      }

      totalCreated += batchSize;
      console.log(`Created ${totalCreated} / ${TOTAL_RESUMES} resumes`);
    }

    console.log('Data seeding complete!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${finalJobRoles?.length || 0} job roles and ${totalCreated} resumes`,
        jobRoles: finalJobRoles?.length || 0,
        resumes: totalCreated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
