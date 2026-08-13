export declare function createSessionToken(): {
    rawToken: string;
    tokenHash: string;
};
export declare function createVerificationToken(): {
    rawToken: string;
    tokenHash: string;
};
export declare function createPasswordResetToken(): {
    rawToken: string;
    tokenHash: string;
};
export declare function hashProvidedToken(token: string): string;
export declare function getSessionExpiryDate(): Date;
export declare function getVerificationExpiryDate(): Date;
export declare function getPasswordResetExpiryDate(): Date;
export declare function createCsrfToken(): string;
//# sourceMappingURL=token.service.d.ts.map