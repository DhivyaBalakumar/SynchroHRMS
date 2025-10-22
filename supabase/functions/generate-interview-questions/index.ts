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
    const { jobRoleTitle, jobRequirements, experienceLevel, numberOfQuestions = 10 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert HR interviewer and talent acquisition specialist. Generate relevant, role-specific interview questions that assess both technical competency and cultural fit.`;

    const userPrompt = `Generate ${numberOfQuestions} insightful interview questions for the following position:

Job Role: ${jobRoleTitle}
Experience Level: ${experienceLevel || 'Mid-level'}
Key Requirements: ${Array.isArray(jobRequirements) ? jobRequirements.join(', ') : jobRequirements}

Create a mix of:
- Technical/Skills assessment questions (40%)
- Behavioral/Situational questions (30%)
- Problem-solving scenarios (20%)
- Cultural fit and motivation questions (10%)

Format your response as a JSON object with this structure:
{
  "questions": [
    {
      "question": "The interview question",
      "category": "technical|behavioral|problem-solving|cultural-fit",
      "difficulty": "easy|medium|hard",
      "expectedAnswer": "Brief guidance on what a strong answer would include",
      "evaluationCriteria": ["criterion1", "criterion2", "criterion3"]
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate interview questions");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsedQuestions = JSON.parse(content);

    return new Response(
      JSON.stringify(parsedQuestions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
