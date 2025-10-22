import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessCompletionRequest {
  interviewId: string;
  resumeId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { interviewId, resumeId }: ProcessCompletionRequest = await req.json();

    console.log("Processing interview completion for interview:", interviewId);

    // Get resume and interview data
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*, job_roles(title)")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      throw new Error("Failed to fetch resume data");
    }

    // Update interview status
    const { error: interviewUpdateError } = await supabase
      .from("interviews")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", interviewId);

    if (interviewUpdateError) {
      console.error("Error updating interview:", interviewUpdateError);
    }

    // Update resume pipeline stage
    const { error: resumeUpdateError } = await supabase
      .from("resumes")
      .update({
        pipeline_stage: "interviewed",
        screening_status: "interviewed",
      })
      .eq("id", resumeId);

    if (resumeUpdateError) {
      console.error("Error updating resume:", resumeUpdateError);
    }

    // Mark interview token as used
    const { error: tokenError } = await supabase
      .from("interview_tokens")
      .update({
        used_at: new Date().toISOString(),
        interview_completed: true,
      })
      .eq("resume_id", resumeId);

    if (tokenError) {
      console.error("Error updating token:", tokenError);
    }

    // Log pipeline transition
    const { error: auditError } = await supabase
      .from("pipeline_audit_logs")
      .insert({
        resume_id: resumeId,
        from_stage: "interview_scheduled",
        to_stage: "interviewed",
        automation_triggered: true,
        notes: "Interview completed - automated pipeline update",
      });

    if (auditError) {
      console.error("Error logging audit:", auditError);
    }

    // Queue completion email
    const { error: emailQueueError } = await supabase
      .from("email_queue")
      .insert({
        resume_id: resumeId,
        email_type: "interview_completed",
        scheduled_for: new Date().toISOString(), // Send immediately
        status: "pending",
        email_data: {
          candidateName: resume.candidate_name,
          candidateEmail: resume.email,
          jobTitle: resume.job_roles?.title || "the position",
        },
      });

    if (emailQueueError) {
      console.error("Error queuing completion email:", emailQueueError);
    }

    // Trigger immediate email processing for completion notification
    try {
      await supabase.functions.invoke("process-email-queue");
    } catch (error) {
      console.error("Error triggering email queue processing:", error);
    }

    console.log("Interview completion processing finished successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Interview completion processed successfully",
        pipelineStage: "interviewed",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-interview-completion function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
