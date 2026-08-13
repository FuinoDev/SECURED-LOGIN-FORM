import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
const skipInTest = () => env.NODE_ENV === "test";
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: "Too many requests. Please try again later." },
});
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: "Too many authentication attempts. Please try again later." },
});
export const strictAuthRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: { error: "Too many attempts. Please try again later." },
});
//# sourceMappingURL=rateLimit.middleware.js.map