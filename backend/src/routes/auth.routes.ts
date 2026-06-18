import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema
} from "../schemas/auth.schema.js";
import { HttpError } from "../utils/http-error.js";
import { signToken } from "../utils/jwt.js";
import { createLog } from "../services/log.service.js";
import { sendPasswordResetEmail } from "../services/email.service.js";
import { env } from "../config/env.js";
import { toPublicUser } from "../utils/user-public.js";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Email already in use.");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash }
    });

    console.log(`[auth] signup_saved email=${user.email} userId=${user.id}`);
    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    await createLog(user.id, "signup", req.ip);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials.");

    if (!user.password) {
      throw new HttpError(401, "This account uses Google sign-in. Use Continue with Google.");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new HttpError(401, "Invalid credentials.");

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    await createLog(user.id, "login", req.ip);

    res.json({
      token,
      user: toPublicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/google", validateBody(googleAuthSchema), async (req, res, next) => {
  try {
    const { email, name } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { name, email, password: null }
      });
      await createLog(user.id, "signup_google", req.ip);
    } else {
      await createLog(user.id, "login_google", req.ip);
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(`[reset] email_entered=${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`[reset] user_not_found email=${email}`);
      throw new HttpError(404, "No account found for this email");
    }

    console.log(`[reset] user_found id=${user.id} email=${user.email}`);

    if (!user.password) {
      throw new HttpError(400, "This account uses Google sign-in. Use Continue with Google.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((o) => o.trim().replace(/\/$/, ""));
    const requestOrigin = typeof req.headers.origin === "string" ? req.headers.origin.replace(/\/$/, "") : "";
    const primaryOrigin =
      requestOrigin && allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : allowedOrigins[0] ?? "http://localhost:5173";
    const resetUrl = `${primaryOrigin}/reset-password?token=${encodeURIComponent(token)}`;

    console.log(`[reset] token_generated user=${user.id} expires=${expiry.toISOString()}`);
    console.log(`[reset] reset_link=${resetUrl}`);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry }
    });
    console.log(`[reset] token_saved_to_db user=${user.id}`);

    try {
      const sent = await sendPasswordResetEmail(user.email, resetUrl);
      console.log(`[reset] email_sent to=${user.email} messageId=${sent.messageId}`);

      res.json({
        message: "Password reset instructions have been sent to your email. Check spam/junk if needed."
      });
    } catch (emailErr) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiry: null }
      });
      console.error(
        `[reset] email_failed to=${user.email}`,
        emailErr instanceof Error ? emailErr.message : emailErr
      );
      throw emailErr;
    }
  } catch (error) {
    next(error);
  }
});

authRouter.post("/reset-password", validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      console.log("[reset] reset_password invalid_or_expired_token");
      throw new HttpError(400, "Invalid or expired reset token.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    console.log(`[reset] reset_completed user=${user.id}`);
    await createLog(user.id, "password_reset", req.ip);
    res.json({ message: "Password updated. You can sign in now." });
  } catch (error) {
    next(error);
  }
});
