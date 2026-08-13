import { getUserFromSession } from "../services/auth.service.js";
import { SESSION_COOKIE } from "../utils/cookies.js";
export async function requireAuth(req, res, next) {
    const sessionToken = req.cookies?.[SESSION_COOKIE];
    if (!sessionToken) {
        res.status(401).json({ error: "Authentication required." });
        return;
    }
    const user = await getUserFromSession(sessionToken);
    if (!user) {
        res.status(401).json({ error: "Authentication required." });
        return;
    }
    req.user = user;
    req.sessionToken = sessionToken;
    next();
}
export function requireAdmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required." });
        return;
    }
    if (req.user.role !== "ADMIN") {
        res.status(403).json({ error: "You do not have permission to perform this action." });
        return;
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map