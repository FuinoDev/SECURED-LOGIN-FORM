import type { Request, Response, NextFunction } from "express";
export declare function getCsrf(req: Request, res: Response): Promise<void>;
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function me(req: Request, res: Response): Promise<void>;
export declare function verifyEmailHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function resendVerification(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function changePasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map