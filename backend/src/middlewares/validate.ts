import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { HttpError } from "../utils/http-error.js";

export const validateBody = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(", ");
      next(new HttpError(400, message));
      return;
    }

    req.body = result.data;
    next();
  };
