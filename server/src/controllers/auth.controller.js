import { changePassword, loginUser, logoutUser, registerUser, requestPasswordReset, resendVerificationEmail, resetPassword, verifyEmail, } from "../services/auth.service.js";
import { createCsrfToken } from "../services/token.service.js";
import { getClientIp } from "../utils/crypto.js";
import { clearCsrfCookie, clearSessionCookie, getSessionMaxAgeMs, setCsrfCookie, setSessionCookie, SESSION_COOKIE, } from "../utils/cookies.js";
function getRequestMeta(req) {
    return {
        ipAddress: getClientIp(req.headers["x-forwarded-for"], req.socket.remoteAddress),
        userAgent: req.get("user-agent") ?? undefined,
    };
}
function issueCsrfToken(res) {
    const token = createCsrfToken();
    setCsrfCookie(res, token, getSessionMaxAgeMs());
    return token;
}
export async function getCsrf(req, res) {
    const token = issueCsrfToken(res);
    res.json({ csrfToken: token });
}
export async function register(req, res, next) {
    try {
        const result = await registerUser({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        }, getRequestMeta(req));
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function login(req, res, next) {
    try {
        const { user, sessionToken } = await loginUser({
            email: req.body.email,
            password: req.body.password,
        }, getRequestMeta(req));
        setSessionCookie(res, sessionToken, getSessionMaxAgeMs());
        const csrfToken = issueCsrfToken(res);
        res.json({ user, csrfToken });
    }
    catch (error) {
        next(error);
    }
}
export async function logout(req, res, next) {
    try {
        const sessionToken = req.cookies?.[SESSION_COOKIE];
        await logoutUser(sessionToken, getRequestMeta(req), req.user?.id);
        clearSessionCookie(res);
        clearCsrfCookie(res);
        res.json({ message: "Logged out successfully." });
    }
    catch (error) {
        next(error);
    }
}
export async function me(req, res) {
    res.json({ user: req.user });
}
export async function verifyEmailHandler(req, res, next) {
    try {
        const result = await verifyEmail(req.body.token, getRequestMeta(req));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function resendVerification(req, res, next) {
    try {
        const result = await resendVerificationEmail(req.body.email, getRequestMeta(req));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function forgotPassword(req, res, next) {
    try {
        const result = await requestPasswordReset(req.body.email, getRequestMeta(req));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function resetPasswordHandler(req, res, next) {
    try {
        const result = await resetPassword({
            token: req.body.token,
            password: req.body.password,
        }, getRequestMeta(req));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function changePasswordHandler(req, res, next) {
    try {
        const result = await changePassword(req.user.id, {
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword,
        }, getRequestMeta(req), req.sessionToken);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map