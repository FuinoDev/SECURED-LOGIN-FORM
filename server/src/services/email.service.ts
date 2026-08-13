import { env } from "../config/env.js";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

async function sendEmail(payload: EmailPayload): Promise<void> {
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    console.info("[email:dev]", {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
    return;
  }

  // Production: integrate with your email provider (Resend, SendGrid, SES, etc.)
  console.warn("[email] No production email provider configured.", payload.subject);
}

export async function sendVerificationEmail(
  email: string,
  name: string | null,
  token: string,
): Promise<void> {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hi ${name}` : "Hi";

  await sendEmail({
    to: email,
    subject: "Verify your email address",
    text: `${greeting},\n\nVerify your account: ${verifyUrl}\n\nThis link expires in ${env.VERIFICATION_TOKEN_HOURS} hours.`,
    html: `<p>${greeting},</p><p><a href="${verifyUrl}">Verify your email address</a></p><p>This link expires in ${env.VERIFICATION_TOKEN_HOURS} hours.</p>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  token: string,
): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hi ${name}` : "Hi";

  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `${greeting},\n\nReset your password: ${resetUrl}\n\nThis link expires in ${env.RESET_TOKEN_HOURS} hour(s).`,
    html: `<p>${greeting},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in ${env.RESET_TOKEN_HOURS} hour(s).</p>`,
  });
}
