import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const googleAuthSchema = z.object({
  email: z.email().toLowerCase(),
  name: z.string().min(1).max(120)
});

export const forgotPasswordSchema = z.object({
  email: z.email().toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(256),
  password: z.string().min(8).max(128)
});
