import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(5000),
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(32),
    CLIENT_URL: z.url().default("http://localhost:5173"),
    SESSION_MAX_AGE_DAYS: z.coerce.number().default(7),
    VERIFICATION_TOKEN_HOURS: z.coerce.number().default(24),
    RESET_TOKEN_HOURS: z.coerce.number().default(1),
    MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
    LOCKOUT_MINUTES: z.coerce.number().default(15),
});
function loadEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        const formatted = parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
        throw new Error(`Invalid environment configuration:\n${formatted}`);
    }
    return parsed.data;
}
export const env = loadEnv();
export const isProduction = env.NODE_ENV === "production";
//# sourceMappingURL=env.js.map