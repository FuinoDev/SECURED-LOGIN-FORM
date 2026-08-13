import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        environment: "node",
        fileParallelism: false,
        env: {
            NODE_ENV: "test",
            DATABASE_URL: process.env.DATABASE_URL ??
                "postgresql://root:secured_login_dev@localhost:5432/secured_login",
            SESSION_SECRET: "test-session-secret-with-at-least-32-characters",
            CLIENT_URL: "http://localhost:5173",
        },
    },
});
//# sourceMappingURL=vitest.config.js.map