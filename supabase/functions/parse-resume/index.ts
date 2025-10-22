import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobRoleTitle, jobRequirements } = await req.json();
    console.log('Parsing resume for role:', jobRoleTitle);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create prompt for AI analysis
    const systemPrompt = `You are an expert HR recruiter analyzing resumes. 
Evaluate the resume against the job requirements and provide:
1. Overall score (0-100)
2. Skills match percentage
3. Experience relevance
4. Education fit
5. Key strengths
6. Areas of concern
7. Hiring recommendation (strongly_recommended, recommended, maybe, not_recommended)`;

    const userPrompt = `
Job Role: ${jobRoleTitle}
Requirements: ${JSON.stringify(jobRequirements)}

Resume Content:
${resumeText}

Analyze this resume and provide a comprehensive evaluation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        tools: [{
          type: 'function',
          function: {
            name: 'evaluate_resume',
            description: 'Evaluate a resume against job requirements',
            parameters: {
              type: 'object',
              properties: {
                overall_score: { type: 'number', minimum: 0, maximum: 100 },
                skills_match: { type: 'number', minimum: 0, maximum: 100 },
                experience_relevance: { type: 'string' },
                education_fit: { type: 'string' },
                key_strengths: { type: 'array', items: { type: 'string' } },
                concerns: { type: 'array', items: { type: 'string' } },
                recommendation: { 
                  type: 'string', 
                  enum: ['strongly_recommended', 'recommended', 'maybe', 'not_recommended'] 
                },
                summary: { type: 'string' }
              },
              required: ['overall_score', 'skills_match', 'recommendation', 'summary'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'evaluate_resume' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Analysis complete, score:', analysis.overall_score);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-resume:', error);
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
