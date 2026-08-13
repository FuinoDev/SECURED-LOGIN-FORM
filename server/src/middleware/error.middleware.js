import { ZodError } from "zod";
import { AuthError } from "../services/auth.service.js";
export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "AppError";
    }
}
export function errorHandler(error, _req, res, _next) {
    if (error instanceof AuthError) {
        res.status(error.statusCode).json({
            error: error.message,
            code: error.code,
        });
        return;
    }
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            error: error.message,
            code: error.code,
        });
        return;
    }
    if (error instanceof ZodError) {
        res.status(400).json({
            error: "Invalid input.",
            details: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }
    if (error instanceof SyntaxError && "body" in error) {
        res.status(400).json({ error: "Invalid JSON." });
        return;
    }
    if (error instanceof Error &&
        "type" in error &&
        error.type === "entity.too.large") {
        res.status(413).json({ error: "Request entity too large." });
        return;
    }
    console.error("[error]", error);
    res.status(500).json({ error: "Something went wrong." });
}
//# sourceMappingURL=error.middleware.js.map