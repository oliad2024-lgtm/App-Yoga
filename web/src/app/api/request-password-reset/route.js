import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM auth_users WHERE email = ${email} LIMIT 1
    `;

    if (users.length === 0) {
      // Return success even if user doesn't exist (security best practice)
      return Response.json({
        message:
          "If an account exists with that email, a password reset link has been sent",
      });
    }

    const user = users[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    await sql`
      INSERT INTO password_reset_tokens (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt})
    `;

    // Create reset link
    const resetLink = `${process.env.APP_URL}/account/reset-password?token=${token}`;

    // Send email via Resend
    try {
      await sendEmail({
        from: "onboarding@resend.dev", // Change this to your verified domain
        to: email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2C2C2C;">Reset Your Password</h2>
            <p style="color: #6B6B6B; line-height: 1.6;">
              You requested to reset your password. Click the button below to create a new password:
            </p>
            <a href="${resetLink}" 
               style="display: inline-block; padding: 14px 28px; background-color: #C9B891; color: #2C2C2C; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">
              Reset Password
            </a>
            <p style="color: #9B9B9B; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #9B9B9B; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetLink}" style="color: #C9B891;">${resetLink}</a>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return Response.json(
        {
          error:
            "Failed to send reset email. Please make sure you've added your Resend API key.",
        },
        { status: 500 },
      );
    }

    return Response.json({
      message:
        "If an account exists with that email, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
