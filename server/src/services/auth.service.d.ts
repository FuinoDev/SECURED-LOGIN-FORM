import type { Role } from "../generated/prisma/client.js";
export declare class AuthError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined);
}
type RequestMeta = {
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
};
export type SafeUser = {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
};
export declare function registerUser(input: {
    name: string;
    email: string;
    password: string;
}, meta: RequestMeta): Promise<{
    message: string;
}>;
export declare function loginUser(input: {
    email: string;
    password: string;
}, meta: RequestMeta): Promise<{
    user: SafeUser;
    sessionToken: string;
}>;
export declare function logoutUser(sessionToken: string | undefined, meta: RequestMeta, userId?: string): Promise<void>;
export declare function getUserFromSession(sessionToken: string): Promise<SafeUser | null>;
export declare function verifyEmail(token: string, meta: RequestMeta): Promise<{
    message: string;
}>;
export declare function resendVerificationEmail(emailInput: string, meta: RequestMeta): Promise<{
    message: string;
}>;
export declare function requestPasswordReset(emailInput: string, meta: RequestMeta): Promise<{
    message: string;
}>;
export declare function resetPassword(input: {
    token: string;
    password: string;
}, meta: RequestMeta): Promise<{
    message: string;
}>;
export declare function changePassword(userId: string, input: {
    currentPassword: string;
    newPassword: string;
}, meta: RequestMeta, currentSessionToken?: string): Promise<{
    message: string;
}>;
export declare function requireRole(user: SafeUser, allowed: Role[]): void;
export {};
//# sourceMappingURL=auth.service.d.ts.map