import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink, userName }: PasswordResetRequest = await req.json();

    console.log("Sending password reset email to:", email);

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
    <h2 style="color:#333333;">Password Reset Request</h2>
    <p>Hi ${userName || 'there'},</p>
    <p>We received a request to reset your password for your SynchroHR account. Click the button below to set a new password. This link will expire in 30 minutes.</p>
    <a href="${resetLink}" style="display:inline-block; background-color:#2F80ED; color:#ffffff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold; margin: 20px 0;">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email or contact support immediately.</p>
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size:12px; color:#777777;">
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
        subject: "Reset Your SynchroHR Password",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    console.log("Password reset email sent successfully:", resendData);

    return new Response(JSON.stringify(resendData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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
