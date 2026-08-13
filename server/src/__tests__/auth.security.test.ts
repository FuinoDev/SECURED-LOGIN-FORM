import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createAdminUser,
  createAgent,
  createPasswordResetForUser,
  fetchCsrf,
  loginUser,
  registerUser,
  resetDatabase,
  TEST_PASSWORD,
  WEAK_PASSWORD,
} from "./helpers.js";
import { prisma } from "../lib/prisma.js";

beforeAll(async () => {
  await resetDatabase();
});

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("authentication security", () => {
  it("allows correct login", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "login@example.com";

    await registerUser(agent, csrf, { email }).expect(201);

    const login = await loginUser(agent, csrf, email).expect(200);
    expect(login.body.user.email).toBe(email);
  });

  it("rejects wrong password with generic message", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "wrong-pass@example.com";

    await registerUser(agent, csrf, { email }).expect(201);

    const response = await loginUser(agent, csrf, email, "WrongPassword999!").expect(401);
    expect(response.body.error).toBe("Invalid email or password.");
  });

  it("rejects nonexistent email with generic message", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);

    const response = await loginUser(agent, csrf, "missing@example.com").expect(401);
    expect(response.body.error).toBe("Invalid email or password.");
  });

  it("handles duplicate registration without enumeration", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "duplicate@example.com";

    const first = await registerUser(agent, csrf, { email }).expect(201);
    const second = await registerUser(agent, csrf, { email }).expect(201);

    expect(first.body.message).toBe(second.body.message);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
  });

  it("rejects weak passwords", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);

    const response = await registerUser(agent, csrf, {
      email: "weak@example.com",
      password: WEAK_PASSWORD,
    }).expect(400);

    expect(response.body.error).toMatch(/12 characters|too common/i);
  });

  it("rejects invalid email", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);

    const response = await agent
      .post("/api/auth/register")
      .set("X-CSRF-Token", csrf)
      .send({
        name: "Bad Email",
        email: "not-an-email",
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      })
      .expect(400);

    expect(response.body.error).toBe("Invalid input.");
  });
});

describe("session security", () => {
  it("rejects expired sessions", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "expired@example.com";

    await registerUser(agent, csrf, { email }).expect(201);
    await loginUser(agent, csrf, email).expect(200);

    await prisma.session.updateMany({
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    await agent.get("/api/auth/me").expect(401);
  });

  it("rejects revoked sessions", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "revoked@example.com";

    await registerUser(agent, csrf, { email }).expect(201);
    await loginUser(agent, csrf, email).expect(200);

    await prisma.session.updateMany({
      data: { revokedAt: new Date() },
    });

    await agent.get("/api/auth/me").expect(401);
  });

  it("logs out and clears access", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "logout@example.com";

    await registerUser(agent, csrf, { email }).expect(201);
    const login = await loginUser(agent, csrf, email).expect(200);
    const nextCsrf = login.body.csrfToken as string;

    await agent.post("/api/auth/logout").set("X-CSRF-Token", nextCsrf).expect(200);
    await agent.get("/api/auth/me").expect(401);
  });
});

describe("token security", () => {
  it("rejects expired reset tokens", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "reset-expired@example.com";

    await registerUser(agent, csrf, { email }).expect(201);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const rawToken = await createPasswordResetForUser(user.id, true);

    const response = await agent
      .post("/api/auth/reset-password")
      .set("X-CSRF-Token", csrf)
      .send({
        token: rawToken,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      })
      .expect(400);

    expect(response.body.error).toMatch(/invalid or expired/i);
  });

  it("rejects used reset tokens", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "reset-used@example.com";

    await registerUser(agent, csrf, { email }).expect(201);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const rawToken = await createPasswordResetForUser(user.id);

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id },
      data: { usedAt: new Date() },
    });

    const response = await agent
      .post("/api/auth/reset-password")
      .set("X-CSRF-Token", csrf)
      .send({
        token: rawToken,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      })
      .expect(400);

    expect(response.body.error).toMatch(/invalid or expired/i);
  });
});

describe("request hardening", () => {
  it("rejects missing CSRF tokens", async () => {
    const agent = createAgent();
    await fetchCsrf(agent);

    const response = await agent.post("/api/auth/login").send({
      email: "csrf@example.com",
      password: TEST_PASSWORD,
    });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Invalid CSRF token.");
  });

  it("rejects unauthorized API access", async () => {
    const agent = createAgent();
    await agent.get("/api/auth/me").expect(401);
  });

  it("rejects USER access to ADMIN endpoints", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "regular@example.com";

    await registerUser(agent, csrf, { email }).expect(201);
    const login = await loginUser(agent, csrf, email).expect(200);

    await agent
      .get("/api/admin/users")
      .set("X-CSRF-Token", login.body.csrfToken)
      .expect(403);
  });

  it("allows ADMIN access to admin endpoints", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const email = "admin@example.com";

    await createAdminUser(email);
    const login = await loginUser(agent, csrf, email).expect(200);

    const response = await agent.get("/api/admin/users").expect(200);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it("rejects oversized JSON payloads", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);
    const huge = "x".repeat(20_000);

    const response = await agent
      .post("/api/auth/register")
      .set("X-CSRF-Token", csrf)
      .send({
        name: huge,
        email: "huge@example.com",
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      });

    expect(response.status).toBe(413);
  });

  it("rejects malformed JSON", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);

    const response = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrf)
      .set("Content-Type", "application/json")
      .send("{ invalid json");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid JSON.");
  });

  it("sanitizes SQL injection attempts in login email", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);

    const response = await agent
      .post("/api/auth/login")
      .set("X-CSRF-Token", csrf)
      .send({
        email: "' OR 1=1 --",
        password: TEST_PASSWORD,
      })
      .expect(400);

    expect(response.body.error).toBe("Invalid input.");
  });
});

describe("password reset privacy", () => {
  it("returns generic message for unknown emails", async () => {
    const agent = createAgent();
    const csrf = await fetchCsrf(agent);

    const response = await agent
      .post("/api/auth/forgot-password")
      .set("X-CSRF-Token", csrf)
      .send({ email: "unknown@example.com" })
      .expect(200);

    expect(response.body.message).toMatch(/if an account exists/i);
  });
});
