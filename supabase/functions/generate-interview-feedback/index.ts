import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  interviewId: string;
  transcript: any[];
  resumeData?: any;
  jobRole?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { interviewId, transcript, resumeData, jobRole }: FeedbackRequest = await req.json();

    console.log("Generating AI feedback for interview:", interviewId);

    // Build comprehensive prompt for AI analysis
    const analysisPrompt = `You are an expert HR interviewer analyzing a candidate interview. Provide detailed, actionable feedback.

Interview Context:
- Position: ${jobRole || "Not specified"}
- Candidate Background: ${resumeData ? JSON.stringify(resumeData.parsed_data) : "Not available"}

Interview Transcript:
${JSON.stringify(transcript, null, 2)}

Please analyze and provide:

1. **Overall Summary** (2-3 sentences)
2. **Communication Score** (1-100): Clarity, articulation, professionalism
3. **Technical Score** (1-100): Technical knowledge, problem-solving, domain expertise
4. **Cultural Fit Score** (1-100): Values alignment, team compatibility, enthusiasm
5. **Confidence Score** (1-100): Self-assurance, composure, presentation
6. **Strengths** (3-5 bullet points)
7. **Areas for Improvement** (3-5 bullet points)
8. **Question-by-Question Analysis** (for each Q&A pair):
   - Question understanding
   - Answer quality
   - Relevance to role
   - Suggestions for improvement
9. **Sentiment Analysis**: Overall emotional tone (positive, neutral, negative)
10. **Recommendation**: Strong hire / Hire / Maybe / Pass with reasoning

Format as JSON with the following structure:
{
  "summary": "string",
  "communication_score": number,
  "technical_score": number,
  "cultural_fit_score": number,
  "confidence_score": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "question_analysis": [{
    "question": "string",
    "answer_quality": number,
    "feedback": "string"
  }],
  "sentiment": "string",
  "recommendation": "string",
  "recommendation_reasoning": "string"
}`;

    // Call Lovable AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert HR interviewer who provides detailed, fair, and constructive feedback. Always return valid JSON.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const feedbackText = aiData.choices?.[0]?.message?.content;

    if (!feedbackText) {
      throw new Error("No feedback generated from AI");
    }

    // Parse AI response (handle potential JSON wrapping)
    let feedback;
    try {
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      feedback = JSON.parse(jsonMatch ? jsonMatch[0] : feedbackText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", feedbackText);
      throw new Error("Failed to parse AI feedback");
    }

    // Update interview with AI feedback
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        ai_feedback: {
          summary: feedback.summary,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          recommendation: feedback.recommendation,
          recommendation_reasoning: feedback.recommendation_reasoning,
        },
        communication_score: feedback.communication_score,
        technical_score: feedback.technical_score,
        cultural_fit_score: feedback.cultural_fit_score,
        confidence_score: feedback.confidence_score,
        sentiment_analysis: {
          overall_sentiment: feedback.sentiment,
        },
        question_analysis: feedback.question_analysis || [],
      })
      .eq("id", interviewId);

    if (updateError) {
      console.error("Error updating interview:", updateError);
      throw updateError;
    }

    console.log("AI feedback generated and saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        feedback,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-interview-feedback:", error);

    // Log error to automation_error_logs
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("automation_error_logs").insert({
        error_type: "ai_feedback_generation",
        error_message: error.message,
        error_stack: error.stack,
        context: { interviewId: req.json().then((d: any) => d.interviewId) },
        severity: "high",
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
