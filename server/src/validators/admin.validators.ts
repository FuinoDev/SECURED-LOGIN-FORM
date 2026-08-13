import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserSchema = z
  .object({
    isActive: z.boolean().optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
  })
  .refine((data) => data.isActive !== undefined || data.role !== undefined, {
    message: "At least one field must be provided.",
  });

export const userIdParamSchema = z.object({
  id: z.uuid("Invalid user id."),
});
