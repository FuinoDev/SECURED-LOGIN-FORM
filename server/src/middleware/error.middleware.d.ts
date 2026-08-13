import type { NextFunction, Request, Response } from "express";
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined);
}
export declare function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map