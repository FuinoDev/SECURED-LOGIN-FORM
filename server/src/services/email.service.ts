import { env } from "../config/env.js";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function logDevEmail(payload: EmailPayload): void {
  const linkMatch = payload.text.match(/https?:\/\/\S+/);

  console.info("\n[email:dev] ────────────────────────────────────────");
  console.info(`[email:dev] To: ${payload.to}`);
  console.info(`[email:dev] Subject: ${payload.subject}`);

  if (linkMatch) {
    console.info(`[email:dev] Link: ${linkMatch[0]}`);
  } else {
    console.info("[email:dev] Link: No URL found in email body.");
  }

  console.info("[email:dev] ────────────────────────────────────────\n");
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  // Diagnostic information
  console.info("\n[email] Email service called.");
  console.info(`[email] NODE_ENV: ${env.NODE_ENV}`);
  console.info(`[email] To: ${payload.to}`);
  console.info(`[email] Subject: ${payload.subject}`);

  // Development/test mode:
  // Do not send a real email.
  // Instead, print the verification/reset link in the API terminal.
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    console.info("[email] Development/test mode detected.");
    logDevEmail(payload);
    return;
  }

  // Production:
  // A real email provider still needs to be configured.
  console.warn(
    "[email] No production email provider configured.",
    payload.subject,
  );
}

export async function sendVerificationEmail(
  email: string,
  name: string | null,
  token: string,
): Promise<void> {
  const verifyUrl =
    `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const greeting = name ? `Hi ${name}` : "Hi";

  console.info("[email] Preparing verification email...");
  console.info(`[email] Verification URL: ${verifyUrl}`);

  await sendEmail({
    to: email,
    subject: "Verify your email address",

    text:
      `${greeting},\n\n` +
      `Verify your account: ${verifyUrl}\n\n` +
      `This link expires in ${env.VERIFICATION_TOKEN_HOURS} hours.`,

    html:
      `<p>${greeting},</p>` +
      `<p><a href="${verifyUrl}">Verify your email address</a></p>` +
      `<p>This link expires in ${env.VERIFICATION_TOKEN_HOURS} hours.</p>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  token: string,
): Promise<void> {
  const resetUrl =
    `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const greeting = name ? `Hi ${name}` : "Hi";

  console.info("[email] Preparing password reset email...");
  console.info(`[email] Reset URL: ${resetUrl}`);

  await sendEmail({
    to: email,
    subject: "Reset your password",

    text:
      `${greeting},\n\n` +
      `Reset your password: ${resetUrl}\n\n` +
      `This link expires in ${env.RESET_TOKEN_HOURS} hour(s).`,

    html:
      `<p>${greeting},</p>` +
      `<p><a href="${resetUrl}">Reset your password</a></p>` +
      `<p>This link expires in ${env.RESET_TOKEN_HOURS} hour(s).</p>`,
  });
}