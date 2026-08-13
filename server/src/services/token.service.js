import { env } from "../config/env.js";
import { generateSecureToken, hashToken } from "../utils/crypto.js";
export function createSessionToken() {
    const rawToken = generateSecureToken(32);
    return { rawToken, tokenHash: hashToken(rawToken) };
}
export function createVerificationToken() {
    const rawToken = generateSecureToken(32);
    return { rawToken, tokenHash: hashToken(rawToken) };
}
export function createPasswordResetToken() {
    const rawToken = generateSecureToken(32);
    return { rawToken, tokenHash: hashToken(rawToken) };
}
export function hashProvidedToken(token) {
    return hashToken(token);
}
export function getSessionExpiryDate() {
    return new Date(Date.now() + env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
}
export function getVerificationExpiryDate() {
    return new Date(Date.now() + env.VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000);
}
export function getPasswordResetExpiryDate() {
    return new Date(Date.now() + env.RESET_TOKEN_HOURS * 60 * 60 * 1000);
}
export function createCsrfToken() {
    return generateSecureToken(32);
}
//# sourceMappingURL=token.service.js.map