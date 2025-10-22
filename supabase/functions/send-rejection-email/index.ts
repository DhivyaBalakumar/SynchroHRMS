import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RejectionEmailRequest {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      candidateName, 
      candidateEmail, 
      jobTitle 
    }: RejectionEmailRequest = await req.json();

    console.log("Sending rejection email to:", candidateEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const mailFrom = Deno.env.get("MAIL_FROM") || "SynchroHR <onboarding@resend.dev>";
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial, sans-serif; background-color:#f4f4f5; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
    <h2 style="color:#333333;">Application Update</h2>
    <p>Dear ${candidateName},</p>
    <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at SynchroHR and for taking the time to apply.</p>
    <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
    
    <div style="background:#f9fafb; padding:20px; border-left:4px solid #2F80ED; margin:20px 0;">
      <p style="margin:0; color:#555555;">We encourage you to explore other opportunities with us in the future. Your profile will remain in our system for consideration in upcoming roles that may be a better fit.</p>
    </div>
    
    <p>We appreciate the time and effort you invested in your application and wish you the best of luck in your job search.</p>
    
    <p style="margin-top:30px;">Best regards,<br><strong>The SynchroHR Team</strong></p>
    
    <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;"/>
    <p style="font-size:12px; color:#777777;">SynchroHR &copy; 2025. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mailFrom,
        to: [candidateEmail],
        subject: `Application Update: ${jobTitle} Position`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    console.log("Rejection email sent successfully:", resendData);

    return new Response(JSON.stringify(resendData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-rejection-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
