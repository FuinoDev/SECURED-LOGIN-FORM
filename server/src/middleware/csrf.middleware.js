import { CSRF_COOKIE } from "../utils/cookies.js";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export function csrfProtection(req, res, next) {
    if (SAFE_METHODS.has(req.method)) {
        next();
        return;
    }
    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const headerToken = req.get("x-csrf-token");
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        res.status(403).json({ error: "Invalid CSRF token." });
        return;
    }
    next();
}
//# sourceMappingURL=csrf.middleware.js.map