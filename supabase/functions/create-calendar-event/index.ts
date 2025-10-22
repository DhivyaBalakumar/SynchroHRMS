import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarEventRequest {
  interviewId: string;
  startTime: string;
  endTime: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewerUserId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      interviewId,
      startTime,
      endTime,
      candidateName,
      candidateEmail,
      jobTitle,
      interviewerUserId,
    }: CalendarEventRequest = await req.json();

    console.log("Creating calendar event for interview:", interviewId);

    // Get calendar integration for interviewer
    let calendarIntegration = null;
    if (interviewerUserId) {
      const { data: integration } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", interviewerUserId)
        .eq("is_active", true)
        .single();

      calendarIntegration = integration;
    }

    // If no integration, just create slot without external calendar sync
    if (!calendarIntegration) {
      console.log("No calendar integration found, creating slot only");

      const { data: slot, error: slotError } = await supabase
        .from("interview_slots")
        .insert({
          interviewer_id: interviewerUserId,
          start_time: startTime,
          end_time: endTime,
          is_booked: true,
          interview_id: interviewId,
        })
        .select()
        .single();

      if (slotError) throw slotError;

      return new Response(
        JSON.stringify({
          success: true,
          slot,
          message: "Interview slot created (no external calendar sync)",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create calendar event based on provider
    let calendarEventId = null;

    if (calendarIntegration.provider === "google") {
      // Google Calendar API integration
      const event = {
        summary: `Interview: ${candidateName} - ${jobTitle}`,
        description: `AI Interview session for ${candidateName}\\nPosition: ${jobTitle}`,
        start: {
          dateTime: startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime,
          timeZone: "UTC",
        },
        attendees: [{ email: candidateEmail }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      };

      const calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${calendarIntegration.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!calendarResponse.ok) {
        const error = await calendarResponse.text();
        console.error("Google Calendar API error:", error);
        throw new Error(`Failed to create Google Calendar event: ${error}`);
      }

      const calendarData = await calendarResponse.json();
      calendarEventId = calendarData.id;
    } else if (calendarIntegration.provider === "outlook") {
      // Microsoft Outlook Calendar API integration
      const event = {
        subject: `Interview: ${candidateName} - ${jobTitle}`,
        body: {
          contentType: "HTML",
          content: `AI Interview session for ${candidateName}<br>Position: ${jobTitle}`,
        },
        start: {
          dateTime: startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime,
          timeZone: "UTC",
        },
        attendees: [
          {
            emailAddress: {
              address: candidateEmail,
              name: candidateName,
            },
            type: "required",
          },
        ],
      };

      const calendarResponse = await fetch(
        "https://graph.microsoft.com/v1.0/me/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${calendarIntegration.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!calendarResponse.ok) {
        const error = await calendarResponse.text();
        console.error("Outlook Calendar API error:", error);
        throw new Error(`Failed to create Outlook event: ${error}`);
      }

      const calendarData = await calendarResponse.json();
      calendarEventId = calendarData.id;
    }

    // Create interview slot with calendar event ID
    const { data: slot, error: slotError } = await supabase
      .from("interview_slots")
      .insert({
        interviewer_id: interviewerUserId,
        start_time: startTime,
        end_time: endTime,
        is_booked: true,
        interview_id: interviewId,
        calendar_event_id: calendarEventId,
      })
      .select()
      .single();

    if (slotError) throw slotError;

    console.log("Calendar event created successfully:", calendarEventId);

    return new Response(
      JSON.stringify({
        success: true,
        slot,
        calendarEventId,
        message: "Calendar event created and synced",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-calendar-event:", error);

    // Log error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("automation_error_logs").insert({
        error_type: "calendar_integration",
        error_message: error.message,
        error_stack: error.stack,
        severity: "medium",
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
