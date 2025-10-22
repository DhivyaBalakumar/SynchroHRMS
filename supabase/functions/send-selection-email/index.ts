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
    const mailFrom = "SynchroHR <synchro-hr@synchrohr.com>";
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Selection Notification</title>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; }
    .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; padding: 10px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Congratulations! You are Selected</h2>
    </div>
    <div class="content">
      <p>Dear ${candidateName},</p>
      <p>We are excited to inform you that you have been selected for the <strong>${jobTitle}</strong> position at SynchroHR.</p>
      <p>Our HR team will reach out soon with details on next steps.</p>
      <p>Thank you for your time and interest. We look forward to working with you!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>SynchroHR Team<br>SynchroHR<br><a href="mailto:synchro-hr@synchrohr.com">synchro-hr@synchrohr.com</a></p>
    </div>
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
