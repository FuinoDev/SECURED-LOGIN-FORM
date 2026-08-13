import argon2 from "argon2";
import { env } from "../config/env.js";
const COMMON_PASSWORDS = new Set([
    "password1234",
    "123456789012",
    "qwertyuiopas",
    "letmein12345",
    "welcome12345",
    "admin1234567",
    "changeme1234",
    "password123!",
    "iloveyou1234",
    "sunshine1234",
]);
export class PasswordValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "PasswordValidationError";
    }
}
export function validatePasswordStrength(password) {
    if (password.length < 12) {
        throw new PasswordValidationError("Password must be at least 12 characters long.");
    }
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
        throw new PasswordValidationError("This password is too common. Choose a stronger password.");
    }
}
export async function hashPassword(password) {
    validatePasswordStrength(password);
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
}
export async function verifyPassword(password, passwordHash) {
    try {
        return await argon2.verify(passwordHash, password);
    }
    catch {
        return false;
    }
}
export function getLockoutUntil(attempts) {
    if (attempts < env.MAX_LOGIN_ATTEMPTS) {
        return null;
    }
    return new Date(Date.now() + env.LOCKOUT_MINUTES * 60 * 1000);
}
//# sourceMappingURL=password.service.js.map