import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { generalRateLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());
app.use(generalRateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
