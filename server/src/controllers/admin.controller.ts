import type { NextFunction, Request, Response } from "express";
import { listAuditLogs, listUsers, updateUser } from "../services/admin.service.js";
import { getClientIp } from "../utils/crypto.js";

function getRequestMeta(req: Request) {
  return {
    ipAddress: getClientIp(req.headers["x-forwarded-for"], req.socket.remoteAddress),
    userAgent: req.get("user-agent") ?? undefined,
  };
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await listUsers(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function patchUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await updateUser(
      req.user!.id,
      String(req.params.id),
      req.body,
      getRequestMeta(req),
    );
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await listAuditLogs(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
