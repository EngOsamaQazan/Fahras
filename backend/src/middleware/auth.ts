import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { buildUserContext } from "../auth.js";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: number };
    const user = await buildUserContext(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requirePermission(permissionKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasPermission = user.permissions.some((perm) => perm.key === permissionKey);
    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

export function requireRole(roleKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasRole = user.roles.some((role) => role.key === roleKey);
    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}
