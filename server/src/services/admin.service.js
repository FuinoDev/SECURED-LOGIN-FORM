import { prisma } from "../lib/prisma.js";
import { AuthError } from "./auth.service.js";
function toSafeUser(user) {
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
async function writeAuditLog(action, userId, meta, metadata) {
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
export async function listUsers(page, limit) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                isActive: true,
                createdAt: true,
            },
        }),
        prisma.user.count(),
    ]);
    return {
        items: users.map(toSafeUser),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}
export async function updateUser(adminId, targetUserId, input, meta) {
    if (adminId === targetUserId && input.isActive === false) {
        throw new AuthError("You cannot disable your own account.", 400, "INVALID_OPERATION");
    }
    if (adminId === targetUserId && input.role === "USER") {
        throw new AuthError("You cannot remove your own admin role.", 400, "INVALID_OPERATION");
    }
    const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
        throw new AuthError("User not found.", 404, "NOT_FOUND");
    }
    const user = await prisma.user.update({
        where: { id: targetUserId },
        data: {
            ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
            ...(input.role !== undefined ? { role: input.role } : {}),
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
        },
    });
    if (input.isActive === false && existing.isActive) {
        await prisma.session.updateMany({
            where: { userId: targetUserId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        await writeAuditLog("ACCOUNT_DISABLED", targetUserId, meta, {
            disabledBy: adminId,
        });
    }
    return toSafeUser(user);
}
export async function listAuditLogs(page, limit) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { email: true, name: true },
                },
            },
        }),
        prisma.auditLog.count(),
    ]);
    return {
        items: logs.map((log) => ({
            id: log.id,
            userId: log.userId,
            action: log.action,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            metadata: log.metadata,
            createdAt: log.createdAt,
            user: log.user,
        })),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}
//# sourceMappingURL=admin.service.js.map