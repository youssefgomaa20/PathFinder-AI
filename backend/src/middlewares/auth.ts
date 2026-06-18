import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "../utils/http-error.js";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid authorization header.");
    }

    const token = authorization.replace("Bearer ", "");
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      throw new HttpError(401, "User not found.");
    }

    req.user = user;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token."));
  }
};

/** If `Authorization: Bearer` is present, attach `req.user` or pass 401 on invalid token. */
export const optionalBearerAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const token = authorization.replace("Bearer ", "");
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true }
    });
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};
