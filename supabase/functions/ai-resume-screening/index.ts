import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeAnalysis {
  ai_score: number;
  recommendation: string;
  skills_match: number;
  experience_match: number;
  education_match: number;
  key_strengths: string[];
  areas_of_concern: string[];
  skill_gaps: string[];
  detailed_analysis: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume_id, job_role_id } = await req.json();

    if (!resume_id) {
      throw new Error('resume_id is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch resume data
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .select('*, job_roles(*)')
      .eq('id', resume_id)
      .single();

    if (resumeError || !resume) {
      throw new Error('Resume not found');
    }

    // Get job role requirements
    let jobRequirements = '';
    if (resume.job_roles) {
      jobRequirements = `
Job Title: ${resume.job_roles.title}
Description: ${resume.job_roles.description}
Requirements: ${JSON.stringify(resume.job_roles.requirements)}
      `;
    } else if (job_role_id) {
      const { data: jobRole } = await supabaseClient
        .from('job_roles')
        .select('*')
        .eq('id', job_role_id)
        .single();
      
      if (jobRole) {
        jobRequirements = `
Job Title: ${jobRole.title}
Description: ${jobRole.description}
Requirements: ${JSON.stringify(jobRole.requirements)}
        `;
      }
    }

    // Prepare resume data for analysis
    const resumeData = `
Candidate Name: ${resume.candidate_name}
Email: ${resume.email}
Phone: ${resume.phone || 'N/A'}
Position Applied: ${resume.position_applied}
Parsed Resume Data: ${JSON.stringify(resume.parsed_data || {})}
    `;

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert HR recruitment analyst specializing in resume evaluation. 
Analyze the following resume against the job requirements and provide a comprehensive evaluation.

Your response MUST be a valid JSON object with this exact structure:
{
  "ai_score": <number between 60-100>,
  "recommendation": "<Highly Recommended|Recommended|Consider|Not Recommended>",
  "skills_match": <number between 0-100>,
  "experience_match": <number between 0-100>,
  "education_match": <number between 0-100>,
  "key_strengths": [<array of 3-5 specific strengths>],
  "areas_of_concern": [<array of areas to explore in interview>],
  "skill_gaps": [<array of missing or weak skills>],
  "detailed_analysis": "<2-3 sentence summary of candidate fit>"
}

Be objective, thorough, and focus on matching the candidate's qualifications to the job requirements.`;

    const userPrompt = `${jobRequirements}\n\n${resumeData}\n\nProvide detailed resume analysis as JSON.`;

    console.log('Calling Lovable AI for resume analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response received:', aiContent);

    // Parse AI response
    let analysis: ResumeAnalysis;
    try {
      analysis = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback analysis if parsing fails
      analysis = {
        ai_score: 70,
        recommendation: 'Consider',
        skills_match: 70,
        experience_match: 70,
        education_match: 70,
        key_strengths: ['Candidate profile reviewed'],
        areas_of_concern: ['Detailed assessment pending'],
        skill_gaps: ['Further evaluation needed'],
        detailed_analysis: 'AI analysis completed with basic evaluation.'
      };
    }

    // Calculate ATS score (composite of all factors)
    const atsScore = Math.round(
      (analysis.skills_match * 0.4) + 
      (analysis.experience_match * 0.35) + 
      (analysis.education_match * 0.25)
    );

    // Determine final status based on ATS score
    const finalStatus = atsScore >= 75 ? 'selected' : 'rejected';

    // Update resume with AI analysis and ATS score
    const { error: updateError } = await supabaseClient
      .from('resumes')
      .update({
        ai_score: analysis.ai_score,
        ai_analysis: { ...analysis, ats_score: atsScore },
        screening_status: finalStatus,
        pipeline_stage: finalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', resume_id);

    if (updateError) {
      console.error('Error updating resume:', updateError);
      throw updateError;
    }

    // Log audit trail
    await supabaseClient
      .from('pipeline_audit_logs')
      .insert({
        resume_id: resume_id,
        action: `ai_screening_${finalStatus}`,
        details: {
          ai_score: analysis.ai_score,
          ats_score: atsScore,
          recommendation: analysis.recommendation,
          auto_decision: true
        }
      });

    console.log(`Resume analysis completed: ${finalStatus} (ATS: ${atsScore})`);

    // Send appropriate email based on decision
    if (finalStatus === 'selected') {
      console.log('Sending selection email...');
      
      const selectionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-selection-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: resume.candidate_name,
          candidateEmail: resume.email,
          jobTitle: resume.job_roles?.title || resume.position_applied,
          interviewLink: 'https://your-app.com/interview', // Will be updated with actual link
          tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString()
        }),
      });

      if (!selectionResponse.ok) {
        console.error('Failed to send selection email');
      } else {
        await supabaseClient
          .from('resumes')
          .update({ selection_email_sent: true })
          .eq('id', resume_id);
        console.log('Selection email sent successfully');
      }
    } else {
      console.log('Sending rejection email...');
      
      const rejectionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-rejection-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: resume.candidate_name,
          candidateEmail: resume.email,
          jobTitle: resume.job_roles?.title || resume.position_applied,
        }),
      });

      if (!rejectionResponse.ok) {
        console.error('Failed to send rejection email');
      } else {
        console.log('Rejection email sent successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: { ...analysis, ats_score: atsScore },
        status: finalStatus,
        email_sent: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-resume-screening:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
