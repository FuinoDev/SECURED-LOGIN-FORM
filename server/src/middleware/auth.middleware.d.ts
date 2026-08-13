import type { NextFunction, Request, Response } from "express";
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map