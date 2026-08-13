import { Router } from "express";
import { getAuditLogs, getUsers, patchUser } from "../controllers/admin.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { validateBody, validateQuery } from "../middleware/validation.middleware.js";
import { paginationSchema, updateUserSchema, userIdParamSchema } from "../validators/admin.validators.js";
const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/users", validateQuery(paginationSchema), getUsers);
router.patch("/users/:id", csrfProtection, (req, res, next) => {
    try {
        req.params = userIdParamSchema.parse(req.params);
        next();
    }
    catch (error) {
        next(error);
    }
}, validateBody(updateUserSchema), patchUser);
router.get("/audit-logs", validateQuery(paginationSchema), getAuditLogs);
export default router;
//# sourceMappingURL=admin.routes.js.map