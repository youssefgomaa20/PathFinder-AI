import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError(404, "Route not found."));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  // Always log unexpected errors including database/query errors
  console.error("[Backend Error]:", error);

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      issues: error.issues
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error.",
    ...(process.env.NODE_ENV !== "production" && error instanceof Error ? { details: error.message } : {})
  });
};
