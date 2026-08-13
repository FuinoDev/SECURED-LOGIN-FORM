export declare class PasswordValidationError extends Error {
    constructor(message: string);
}
export declare function validatePasswordStrength(password: string): void;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, passwordHash: string): Promise<boolean>;
export declare function getLockoutUntil(attempts: number): Date | null;
//# sourceMappingURL=password.service.d.ts.map