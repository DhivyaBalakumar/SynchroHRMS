import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SelectionEmailRequest {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewLink: string;
  tokenExpiry: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      candidateName, 
      candidateEmail, 
      jobTitle, 
      interviewLink,
      tokenExpiry
    }: SelectionEmailRequest = await req.json();

    console.log("Sending selection email to:", candidateEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const mailFrom = Deno.env.get("MAIL_FROM") || "SynchroHR <onboarding@resend.dev>";
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial, sans-serif; background-color:#f9fafb; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 1px 5px rgba(0,0,0,0.1);">
    <h2 style="color:#27AE60;">Congratulations, ${candidateName}!</h2>
    <p>We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position has been shortlisted.</p>
    <p>You have been selected to proceed to the next stage: an AI-powered video interview.</p>
    
    <div style="background:#f4f4f5; padding:20px; border-radius:5px; margin:20px 0;">
      <h3 style="color:#2F80ED; margin-top:0;">Next Steps:</h3>
      <ol style="color:#333333;">
        <li>Click the button below to access your personalized interview portal</li>
        <li>You can update your resume if needed</li>
        <li>Complete the AI video interview at your convenience</li>
        <li>The interview typically takes 20-30 minutes</li>
      </ol>
    </div>

    <a href="${interviewLink}" style="display:inline-block; background-color:#27AE60; color:#ffffff; padding:14px 28px; border-radius:5px; text-decoration:none; font-weight:bold; margin: 20px 0;">Start Interview</a>
    
    <p style="color:#666666; font-size:14px;">⏰ This link is valid until ${tokenExpiry}</p>
    
    <p>If the button doesn't work, copy and paste this link:</p>
    <p style="font-size:12px; color:#555555; word-break:break-all;">${interviewLink}</p>
    
    <p style="margin-top:30px;">Best of luck! We look forward to learning more about you.</p>
    
    <hr style="margin:30px 0; border:none; border-top:1px solid #e5e7eb;"/>
    <p style="font-size:12px; color:#999999;">SynchroHR &copy; 2025. All rights reserved.</p>
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
        subject: `🎉 You've Been Selected for ${jobTitle} - Interview Invitation`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    console.log("Selection email sent successfully:", resendData);

    return new Response(JSON.stringify(resendData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-selection-email function:", error);
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
