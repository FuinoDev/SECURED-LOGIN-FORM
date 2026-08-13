import type { AuditAction, Role } from "../generated/prisma/client.js";
import { type SafeUser } from "./auth.service.js";
type RequestMeta = {
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
};
type Paginated<T> = {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
export declare function listUsers(page: number, limit: number): Promise<Paginated<SafeUser>>;
export declare function updateUser(adminId: string, targetUserId: string, input: {
    isActive?: boolean;
    role?: Role;
}, meta: RequestMeta): Promise<SafeUser>;
export declare function listAuditLogs(page: number, limit: number): Promise<Paginated<{
    id: string;
    userId: string | null;
    action: AuditAction;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: unknown;
    createdAt: Date;
    user: {
        email: string;
        name: string | null;
    } | null;
}>>;
export {};
//# sourceMappingURL=admin.service.d.ts.map