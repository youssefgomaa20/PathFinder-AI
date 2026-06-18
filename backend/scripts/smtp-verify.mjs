/**
 * Test SMTP credentials from backend/.env (no email sent to users).
 * Usage: node scripts/smtp-verify.mjs
 */
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(backendRoot, "..", ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

const strip = (v) => (v ? String(v).trim().replace(/^["']|["']$/g, "") : "");
const user = strip(process.env.SMTP_USER);
const pass = strip(process.env.SMTP_PASS)?.replace(/\s+/g, "");
const from = strip(process.env.EMAIL_FROM) || user;

console.log("SMTP configuration:");
console.log("  SMTP_HOST:", process.env.SMTP_HOST || "(default smtp.gmail.com for @gmail.com)");
console.log("  SMTP_PORT:", process.env.SMTP_PORT || 587);
console.log("  SMTP_SECURE:", process.env.SMTP_SECURE || false);
console.log("  SMTP_USER:", user ? `${user.slice(0, 3)}***${user.slice(-10)}` : "(MISSING)");
console.log("  EMAIL_FROM:", from || "(MISSING)");
console.log("  from_matches_user:", user && from && user.toLowerCase() === from.toLowerCase());
console.log("  pass_length:", pass?.length ?? 0, "(Gmail app password should be 16)");

if (!user || !pass) {
  console.error("\nFAIL: Set SMTP_USER and SMTP_PASS in backend/.env");
  process.exit(1);
}

if (user.toLowerCase() !== from.toLowerCase()) {
  console.error("\nFAIL: EMAIL_FROM must exactly match SMTP_USER");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user, pass },
  tls: { minVersion: "TLSv1.2" }
});

try {
  await transport.verify();
  console.log("\nPASS: SMTP authentication successful (smtp.gmail.com:587)");
} catch (e) {
  console.error("\nFAIL:", e.message);
  if (e.message.includes("535")) {
    console.error("\nFix: Use Gmail App Password at https://myaccount.google.com/apppasswords");
    console.error("     Do NOT use your normal Gmail login password.");
  }
  process.exit(1);
}
