import type { SuperAgentTest } from "supertest";
import request from "supertest";
export declare const TEST_PASSWORD = "SecureTestPass123!";
export declare const WEAK_PASSWORD = "password1234";
export declare function resetDatabase(): Promise<void>;
export declare function createAgent(): SuperAgentTest;
export declare function fetchCsrf(agent: SuperAgentTest): Promise<string>;
export declare function registerUser(agent: SuperAgentTest, csrfToken: string, overrides?: Partial<{
    name: string;
    email: string;
    password: string;
}>): request.Test;
export declare function loginUser(agent: SuperAgentTest, csrfToken: string, email: string, password?: string): request.Test;
export declare function createAdminUser(email: string, password?: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    name: string | null;
    role: import("../generated/prisma/index.js").$Enums.Role;
    emailVerified: boolean;
    isActive: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createPasswordResetForUser(userId: string, expired?: boolean): Promise<string>;
//# sourceMappingURL=helpers.d.ts.map