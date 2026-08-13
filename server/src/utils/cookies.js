import { env, isProduction } from "../config/env.js";
export const SESSION_COOKIE = "session_token";
export const CSRF_COOKIE = "csrf_token";
const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
};
export function getSessionCookieOptions(maxAgeMs) {
    return {
        ...baseCookieOptions,
        maxAge: maxAgeMs,
    };
}
export function getCsrfCookieOptions(maxAgeMs) {
    return {
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: maxAgeMs,
    };
}
export function setSessionCookie(res, token, maxAgeMs) {
    res.cookie(SESSION_COOKIE, token, getSessionCookieOptions(maxAgeMs));
}
export function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE, {
        ...baseCookieOptions,
    });
}
export function setCsrfCookie(res, token, maxAgeMs) {
    res.cookie(CSRF_COOKIE, token, getCsrfCookieOptions(maxAgeMs));
}
export function clearCsrfCookie(res) {
    res.clearCookie(CSRF_COOKIE, {
        httpOnly: false,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
    });
}
export function getSessionMaxAgeMs() {
    return env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}
//# sourceMappingURL=cookies.js.map