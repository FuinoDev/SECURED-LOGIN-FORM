import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { createPasswordResetToken, getPasswordResetExpiryDate, } from "../services/token.service.js";
export const TEST_PASSWORD = "SecureTestPass123!";
export const WEAK_PASSWORD = "password1234";
export async function resetDatabase() {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`);
}
export function createAgent() {
    return request.agent(app);
}
export async function fetchCsrf(agent) {
    const response = await agent.get("/api/auth/csrf").expect(200);
    return response.body.csrfToken;
}
export function registerUser(agent, csrfToken, overrides = {}) {
    const payload = {
        name: overrides.name ?? "Test User",
        email: overrides.email ?? `user-${Date.now()}@example.com`,
        password: overrides.password ?? TEST_PASSWORD,
        confirmPassword: overrides.password ?? TEST_PASSWORD,
    };
    return agent
        .post("/api/auth/register")
        .set("X-CSRF-Token", csrfToken)
        .send(payload);
}
export function loginUser(agent, csrfToken, email, password = TEST_PASSWORD) {
    return agent
        .post("/api/auth/login")
        .set("X-CSRF-Token", csrfToken)
        .send({ email, password });
}
export async function createAdminUser(email, password = TEST_PASSWORD) {
    const passwordHash = await import("../services/password.service.js").then((m) => m.hashPassword(password));
    return prisma.user.create({
        data: {
            email: email.toLowerCase(),
            name: "Admin",
            passwordHash,
            role: "ADMIN",
            emailVerified: true,
        },
    });
}
export async function createPasswordResetForUser(userId, expired = false) {
    const { rawToken, tokenHash } = createPasswordResetToken();
    await prisma.passwordResetToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt: expired ? new Date(Date.now() - 60_000) : getPasswordResetExpiryDate(),
        },
    });
    return rawToken;
}
//# sourceMappingURL=helpers.js.map