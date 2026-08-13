import { z } from "zod";
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    isActive: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        USER: "USER";
    }>>;
}, z.core.$strip>;
export declare const userIdParamSchema: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
//# sourceMappingURL=admin.validators.d.ts.map