import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
export declare function validateBody<T>(schema: ZodType<T>): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateQuery<T>(schema: ZodType<T>): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map