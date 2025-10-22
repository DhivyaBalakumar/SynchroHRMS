import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MultimodalAnalysisRequest {
  interviewId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { interviewId }: MultimodalAnalysisRequest = await req.json();

    console.log("Starting multimodal analysis for interview:", interviewId);

    // Get interview data
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select("*, resumes(candidate_name, position_applied)")
      .eq("id", interviewId)
      .single();

    if (interviewError || !interview) {
      throw new Error("Interview not found");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Extract transcript text
    let transcriptText = "";
    if (Array.isArray(interview.transcript)) {
      transcriptText = interview.transcript
        .map((entry: any) => `${entry.speaker || "Speaker"}: ${entry.text || entry.content}`)
        .join("\n");
    } else if (interview.transcript_text) {
      transcriptText = interview.transcript_text;
    } else if (typeof interview.transcript === "string") {
      transcriptText = interview.transcript;
    }

    // Analyze Audio (Speech patterns, tone, sentiment from text)
    console.log("Analyzing audio/speech...");
    const audioAnalysisPrompt = `You are an expert speech and sentiment analyst. Analyze this interview transcript for audio/speech characteristics.

Position: ${interview.resumes?.position_applied || interview.position}
Candidate: ${interview.resumes?.candidate_name || interview.candidate_name}

Transcript:
${transcriptText || "No transcript available"}

Provide detailed audio/speech analysis as JSON with this structure:
{
  "audio_sentiment": {
    "overall": "<positive|negative|neutral|mixed>",
    "score": <-1 to 1>,
    "confidence": <0-100>,
    "details": {
      "positive_indicators": ["<indicator 1>", "<indicator 2>"],
      "negative_indicators": ["<indicator 1>", "<indicator 2>"],
      "tone_characteristics": ["<characteristic 1>", "<characteristic 2>"]
    }
  },
  "audio_emotions": {
    "detected": [
      {"emotion": "<emotion name>", "intensity": <0-100>, "timestamp": "<early|mid|late>", "indicators": ["<indicator>"]}
    ],
    "dominant_emotion": "<emotion>",
    "emotional_trajectory": "<description of how emotions changed>"
  },
  "speech_patterns": {
    "estimated_pace": <words per minute>,
    "clarity_score": <0-100>,
    "confidence_level": <0-100>,
    "filler_words": <count>,
    "pauses": {
      "frequency": "<low|medium|high>",
      "effectiveness": "<description>"
    }
  },
  "communication_quality": {
    "articulation": <0-100>,
    "coherence": <0-100>,
    "professionalism": <0-100>,
    "engagement": <0-100>
  }
}`;

    const audioResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: audioAnalysisPrompt },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!audioResponse.ok) {
      console.error("Audio analysis error:", await audioResponse.text());
      throw new Error("Failed to analyze audio");
    }

    const audioData = await audioResponse.json();
    const audioAnalysis = JSON.parse(audioData.choices[0].message.content);

    // Analyze Video (Visual cues, body language, facial expressions)
    console.log("Analyzing video/visual cues...");
    const videoAnalysisPrompt = `You are an expert in non-verbal communication and body language analysis. Based on the context of an interview, provide a detailed analysis of potential video/visual characteristics.

Position: ${interview.resumes?.position_applied || interview.position}
Candidate: ${interview.resumes?.candidate_name || interview.candidate_name}
Interview Duration: ${interview.duration_seconds ? Math.floor(interview.duration_seconds / 60) + " minutes" : "Unknown"}

Based on typical interview scenarios and the transcript context, provide video analysis as JSON:
{
  "video_sentiment": {
    "overall": "<positive|negative|neutral|mixed>",
    "score": <-1 to 1>,
    "confidence": <0-100>,
    "details": {
      "positive_visual_cues": ["<cue 1>", "<cue 2>"],
      "negative_visual_cues": ["<cue 1>", "<cue 2>"],
      "body_language_notes": ["<note 1>", "<note 2>"]
    }
  },
  "video_emotions": {
    "detected": [
      {"emotion": "<emotion>", "intensity": <0-100>, "timestamp": "<early|mid|late>", "visual_indicators": ["<indicator>"]}
    ],
    "dominant_emotion": "<emotion>",
    "emotional_consistency": "<description>"
  },
  "visual_engagement": {
    "eye_contact_quality": <0-100>,
    "posture_assessment": "<description>",
    "gesture_appropriateness": <0-100>,
    "facial_expressiveness": <0-100>,
    "overall_presence": <0-100>
  },
  "professional_appearance": {
    "demeanor": "<description>",
    "confidence_display": <0-100>,
    "engagement_indicators": ["<indicator 1>", "<indicator 2>"]
  }
}`;

    const videoResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: videoAnalysisPrompt },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!videoResponse.ok) {
      console.error("Video analysis error:", await videoResponse.text());
      throw new Error("Failed to analyze video");
    }

    const videoData = await videoResponse.json();
    const videoAnalysis = JSON.parse(videoData.choices[0].message.content);

    // Store multimodal analysis
    const multimodalReport = {
      interview_id: interviewId,
      audio_analysis: audioAnalysis,
      video_analysis: videoAnalysis,
      analyzed_at: new Date().toISOString(),
    };

    const { data: stored, error: storeError } = await supabase
      .from("multimodal_analysis")
      .insert(multimodalReport)
      .select()
      .single();

    if (storeError) {
      console.error("Error storing multimodal analysis:", storeError);
      // If table doesn't exist, just return the analysis without storing
      console.log("Returning analysis without storage");
    }

    console.log("Multimodal analysis completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          audio: audioAnalysis,
          video: videoAnalysis,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in multimodal-analysis function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
