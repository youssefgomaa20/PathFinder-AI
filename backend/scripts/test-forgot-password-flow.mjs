import crypto from "crypto";

/**
 * Verifies Gmail SMTP + full forgot/reset password API flow.
 * Requires backend/.env: SMTP_USER, SMTP_PASS, EMAIL_FROM (same as SMTP_USER).
 * Run with backend server on PORT (default 8080).
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendRoot, "..", ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

const API = process.env.PUBLIC_API_URL?.trim() || `http://localhost:${process.env.PORT || 8080}`;
const testEmail = process.argv[2]?.trim().toLowerCase();

if (!process.env.SMTP_USER?.trim() || !process.env.SMTP_PASS?.trim()) {
  console.error("FAIL: Set SMTP_USER and SMTP_PASS in backend/.env (Gmail app password).");
  process.exit(1);
}

if (!testEmail) {
  console.error("Usage: node scripts/test-forgot-password-flow.mjs <registered-email>");
  process.exit(1);
}

const { initEmailService, sendPasswordResetEmail } = await import("../dist/services/email.service.js");
const { PrismaClient } = await import("@prisma/client");

const prisma = new PrismaClient();

try {
  console.log("[test] smtp_verify...");
  await initEmailService();
  console.log("[test] smtp_verified ok");

  const user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!user) {
    console.error(`FAIL: No account for ${testEmail}`);
    process.exit(1);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  const resetUrl = `http://localhost:5173/reset-password?token=${encodeURIComponent(token)}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry }
  });

  const sent = await sendPasswordResetEmail(user.email, resetUrl);
  console.log("[test] email_sent", sent.messageId);
  console.log("[test] Open inbox for", user.email, "and use the reset link.");
  console.log("[test] Or POST /auth/reset-password with token from DB after verifying email.");

  const apiForgot = await fetch(`${API}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotBody = await apiForgot.json().catch(() => ({}));
  console.log("[test] forgot-password API", apiForgot.status, forgotBody.message ?? forgotBody);

  if (!apiForgot.ok) {
    process.exit(1);
  }

  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  if (!updated?.resetToken) {
    console.error("FAIL: reset token not in database after forgot-password");
    process.exit(1);
  }

  const newPassword = `TestReset_${Date.now()}!`;
  const resetRes = await fetch(`${API}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: updated.resetToken, password: newPassword })
  });
  const resetBody = await resetRes.json().catch(() => ({}));
  console.log("[test] reset-password API", resetRes.status, resetBody.message ?? resetBody);

  if (!resetRes.ok) {
    process.exit(1);
  }

  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: newPassword })
  });
  console.log("[test] login with new password", loginRes.status === 200 ? "OK" : "FAIL");
  process.exit(loginRes.ok ? 0 : 1);
} catch (err) {
  console.error("[test] email_failed", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
