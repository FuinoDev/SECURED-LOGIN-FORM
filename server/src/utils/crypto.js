import { createHash, randomBytes } from "node:crypto";
export function generateSecureToken(bytes = 32) {
    return randomBytes(bytes).toString("base64url");
}
export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
export function getClientIp(forwardedFor, socketAddress) {
    if (typeof forwardedFor === "string") {
        const first = forwardedFor.split(",")[0]?.trim();
        if (first)
            return first;
    }
    if (Array.isArray(forwardedFor) && forwardedFor[0]) {
        return forwardedFor[0].trim();
    }
    return socketAddress;
}
//# sourceMappingURL=crypto.js.map