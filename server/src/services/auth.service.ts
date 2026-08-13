import type { AuditAction, Role } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { normalizeEmail } from "../utils/crypto.js";
import {
  getLockoutUntil,
  hashPassword,
  PasswordValidationError,
  verifyPassword,
} from "./password.service.js";
import {
  createPasswordResetToken,
  createSessionToken,
  createVerificationToken,
  getPasswordResetExpiryDate,
  getSessionExpiryDate,
  getVerificationExpiryDate,
  hashProvidedToken,
} from "./token.service.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email.service.js";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type RequestMeta = {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

async function writeAuditLog(
  action: AuditAction,
  userId: string | null,
  meta: RequestMeta,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action,
      userId,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
      ...(metadata !== undefined ? { metadata } : {}),
    },
  });
}

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
};

function toSafeUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function registerUser(
  input: { name: string; email: string; password: string },
  meta: RequestMeta,
): Promise<{ message: string }> {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return {
      message:
        "If this email is available, a verification link has been sent. Check your inbox to continue.",
    };
  }

  let passwordHash: string;
  try {
    passwordHash = await hashPassword(input.password);
  } catch (error) {
    if (error instanceof PasswordValidationError) {
      throw new AuthError(error.message, 400, "WEAK_PASSWORD");
    }
    throw error;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash,
    },
  });

  const { rawToken, tokenHash } = createVerificationToken();

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: getVerificationExpiryDate(),
    },
  });

  await sendVerificationEmail(user.email, user.name, rawToken);
  await writeAuditLog("REGISTRATION", user.id, meta);

  return {
    message:
      "If this email is available, a verification link has been sent. Check your inbox to continue.",
  };
}

export async function loginUser(
  input: { email: string; password: string },
  meta: RequestMeta,
): Promise<{ user: SafeUser; sessionToken: string }> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await writeAuditLog("LOGIN_FAILED", null, meta, { email });
    throw new AuthError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    await writeAuditLog("LOGIN_FAILED", user.id, meta, { reason: "inactive" });
    throw new AuthError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await writeAuditLog("LOGIN_FAILED", user.id, meta, { reason: "locked" });
    throw new AuthError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const passwordValid = await verifyPassword(input.password, user.passwordHash);

  if (!passwordValid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = getLockoutUntil(attempts);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil,
      },
    });

    await writeAuditLog("LOGIN_FAILED", user.id, meta, { attempts });
    throw new AuthError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const { rawToken, tokenHash } = createSessionToken();
  const expiresAt = getSessionExpiryDate();

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await writeAuditLog("LOGIN_SUCCESS", user.id, meta);

  return {
    user: toSafeUser(user),
    sessionToken: rawToken,
  };
}

export async function logoutUser(
  sessionToken: string | undefined,
  meta: RequestMeta,
  userId?: string,
): Promise<void> {
  if (sessionToken) {
    const tokenHash = hashProvidedToken(sessionToken);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
    });

    if (session && !session.revokedAt) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  if (userId) {
    await writeAuditLog("LOGOUT", userId, meta);
  }
}

export async function getUserFromSession(sessionToken: string): Promise<SafeUser | null> {
  const tokenHash = hashProvidedToken(sessionToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });

  return toSafeUser(session.user);
}

export async function verifyEmail(token: string, meta: RequestMeta): Promise<{ message: string }> {
  const tokenHash = hashProvidedToken(token);

  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new AuthError("Invalid or expired verification link.", 400, "INVALID_TOKEN");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await writeAuditLog("EMAIL_VERIFIED", record.userId, meta);

  return { message: "Email verified successfully." };
}

export async function resendVerificationEmail(
  emailInput: string,
  meta: RequestMeta,
): Promise<{ message: string }> {
  const email = normalizeEmail(emailInput);
  const user = await prisma.user.findUnique({ where: { email } });

  const genericMessage = {
    message: "If an account exists for that email, a verification link has been sent.",
  };

  if (!user || user.emailVerified) {
    return genericMessage;
  }

  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const { rawToken, tokenHash } = createVerificationToken();

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: getVerificationExpiryDate(),
    },
  });

  await sendVerificationEmail(user.email, user.name, rawToken);
  await writeAuditLog("REGISTRATION", user.id, meta, { resend: true });

  return genericMessage;
}

export async function requestPasswordReset(
  emailInput: string,
  meta: RequestMeta,
): Promise<{ message: string }> {
  const email = normalizeEmail(emailInput);
  const user = await prisma.user.findUnique({ where: { email } });

  const genericMessage = {
    message: "If an account exists for that email, password reset instructions have been sent.",
  };

  if (!user || !user.isActive) {
    return genericMessage;
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const { rawToken, tokenHash } = createPasswordResetToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: getPasswordResetExpiryDate(),
    },
  });

  await sendPasswordResetEmail(user.email, user.name, rawToken);
  await writeAuditLog("PASSWORD_RESET_REQUESTED", user.id, meta);

  return genericMessage;
}

export async function resetPassword(
  input: { token: string; password: string },
  meta: RequestMeta,
): Promise<{ message: string }> {
  const tokenHash = hashProvidedToken(input.token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new AuthError("Invalid or expired reset link.", 400, "INVALID_TOKEN");
  }

  let passwordHash: string;
  try {
    passwordHash = await hashPassword(input.password);
  } catch (error) {
    if (error instanceof PasswordValidationError) {
      throw new AuthError(error.message, 400, "WEAK_PASSWORD");
    }
    throw error;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await writeAuditLog("PASSWORD_RESET_COMPLETED", record.userId, meta);

  return { message: "Password reset successfully. Please log in with your new password." };
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
  meta: RequestMeta,
  currentSessionToken?: string,
): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AuthError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  const currentValid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!currentValid) {
    throw new AuthError("Current password is incorrect.", 400, "INVALID_PASSWORD");
  }

  let passwordHash: string;
  try {
    passwordHash = await hashPassword(input.newPassword);
  } catch (error) {
    if (error instanceof PasswordValidationError) {
      throw new AuthError(error.message, 400, "WEAK_PASSWORD");
    }
    throw error;
  }

  const currentTokenHash = currentSessionToken
    ? hashProvidedToken(currentSessionToken)
    : null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentTokenHash ? { NOT: { tokenHash: currentTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    }),
  ]);

  await writeAuditLog("PASSWORD_CHANGED", userId, meta);

  return { message: "Password changed successfully." };
}

export function requireRole(user: SafeUser, allowed: Role[]): void {
  if (!allowed.includes(user.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403, "FORBIDDEN");
  }
}
