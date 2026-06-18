/**
 * Standalone Gmail SMTP verify + optional test send.
 * Usage: node scripts/verify-smtp.mjs [recipient@test.com]
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendRoot, "..", ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
const from = process.env.EMAIL_FROM?.trim() || user;
const to = process.argv[2]?.trim();

if (!user || !pass) {
  console.error("[verify] FAIL — SMTP_USER and SMTP_PASS required in backend/.env");
  process.exit(1);
}

if (!from || from.toLowerCase() !== user.toLowerCase()) {
  console.error("[verify] FAIL — EMAIL_FROM must match SMTP_USER");
  process.exit(1);
}

console.log("[email] smtp_loaded", { host: "smtp.gmail.com", port: 587, user, from });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user, pass },
  tls: { minVersion: "TLSv1.2" }
});

try {
  await transporter.verify();
  console.log("[email] smtp_verified");
} catch (err) {
  console.error("[email] email_failed phase=verify", err instanceof Error ? err.message : err);
  process.exit(1);
}

if (to) {
  console.log("[email] email_send_started", { to });
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "PathFinder SMTP test",
      text: "If you received this, Gmail SMTP is working.",
      html: "<p>If you received this, Gmail SMTP is working.</p>"
    });
    console.log("[email] email_sent", info.messageId);
  } catch (err) {
    console.error("[email] email_failed phase=send", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

console.log("[verify] OK");
