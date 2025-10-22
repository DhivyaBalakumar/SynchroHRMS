import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing email queue...");

    // Get pending emails that are due to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .lt("retry_count", 3)
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("Error fetching pending emails:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingEmails?.length || 0} emails to process`);

    let successCount = 0;
    let failureCount = 0;

    for (const email of pendingEmails || []) {
      try {
        console.log(`Processing email ${email.id} of type ${email.email_type}`);

        let functionName = "";
        switch (email.email_type) {
          case "interview_scheduled":
            functionName = "send-interview-scheduled";
            break;
          case "interview_completed":
            functionName = "send-interview-completed";
            break;
          case "selection":
            functionName = "send-selection-email";
            break;
          default:
            console.error(`Unknown email type: ${email.email_type}`);
            continue;
        }

        // Call the appropriate email function
        const { data: emailResult, error: emailError } = await supabase.functions.invoke(
          functionName,
          {
            body: email.email_data,
          }
        );

        if (emailError) {
          throw emailError;
        }

        // Mark email as sent
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id);

        // Update resume tracking
        if (email.email_type === "interview_scheduled") {
          await supabase
            .from("resumes")
            .update({ interview_scheduled_email_sent: true })
            .eq("id", email.resume_id);
        } else if (email.email_type === "interview_completed") {
          await supabase
            .from("resumes")
            .update({ interview_completed_email_sent: true })
            .eq("id", email.resume_id);
        }

        successCount++;
        console.log(`Email ${email.id} sent successfully`);
      } catch (error: any) {
        failureCount++;
        console.error(`Error sending email ${email.id}:`, error);

        // Update retry count and error message
        await supabase
          .from("email_queue")
          .update({
            retry_count: email.retry_count + 1,
            status: email.retry_count + 1 >= 3 ? "failed" : "pending",
            error_message: error.message,
          })
          .eq("id", email.id);
      }
    }

    console.log(`Email queue processing complete. Success: ${successCount}, Failed: ${failureCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingEmails?.length || 0,
        successCount,
        failureCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
