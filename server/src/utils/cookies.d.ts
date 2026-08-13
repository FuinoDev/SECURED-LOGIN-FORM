import type { CookieOptions, Response } from "express";
export declare const SESSION_COOKIE = "session_token";
export declare const CSRF_COOKIE = "csrf_token";
export declare function getSessionCookieOptions(maxAgeMs: number): CookieOptions;
export declare function getCsrfCookieOptions(maxAgeMs: number): CookieOptions;
export declare function setSessionCookie(res: Response, token: string, maxAgeMs: number): void;
export declare function clearSessionCookie(res: Response): void;
export declare function setCsrfCookie(res: Response, token: string, maxAgeMs: number): void;
export declare function clearCsrfCookie(res: Response): void;
export declare function getSessionMaxAgeMs(): number;
//# sourceMappingURL=cookies.d.ts.map