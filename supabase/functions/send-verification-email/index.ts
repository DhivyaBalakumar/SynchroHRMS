import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  verificationLink: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verificationLink, userName }: VerificationEmailRequest = await req.json();

    console.log("Sending verification email to:", email);

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
    <h2 style="color:#2F80ED;">Welcome to SynchroHR!</h2>
    <p>Hi ${userName || 'there'},</p>
    <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
    <a href="${verificationLink}" style="display:inline-block; background-color:#27AE60; color:#ffffff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold; margin: 20px 0;">Verify Email</a>
    <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="font-size:12px; color:#555555; word-break: break-all;">${verificationLink}</p>
    <p>Once verified, you'll have full access to our recruitment platform. If you did not create an account, please ignore this message.</p>
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size:12px; color:#999999;">
      SynchroHR &copy; 2025. All rights reserved.
    </p>
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
        to: [email],
        subject: "Verify Your Email for SynchroHR",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    console.log("Verification email sent successfully:", resendData);

    return new Response(JSON.stringify(resendData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
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
