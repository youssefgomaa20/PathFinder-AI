import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
let systemFrom = "";
let deliveryMode: "resend" | "smtp" | "none" = "none";
let initPromise: Promise<void> | null = null;

export type EmailConfigStatus = {
  loaded: boolean;
  mode: "resend" | "smtp" | "none";
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  from?: string;
  fromMatchesUser?: boolean;
  passLength?: number;
  envFileLoaded: boolean;
  missing: string[];
};

const mask = (value: string | undefined): string => {
  if (!value?.trim()) return "(empty)";
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
};

/** Gmail app passwords are 16 chars; Google displays them with spaces — strip all whitespace. */
const normalizeAppPassword = (pass: string): string => pass.replace(/\s+/g, "");

const formatSmtpAuthError = (raw: string): string => {
  if (raw.includes("535") || raw.includes("BadCredentials") || raw.includes("Username and Password not accepted")) {
    return (
      "Gmail login rejected (535). Use a 16-character App Password — NOT your normal Gmail password. " +
      "Create one at https://myaccount.google.com/apppasswords (requires 2-Step Verification). " +
      "Set SMTP_PASS to the 16-character password (spaces are OK; they are removed automatically). " +
      "EMAIL_FROM must exactly match SMTP_USER."
    );
  }
  return raw;
};

export const getEmailConfigStatus = (): EmailConfigStatus => {
  const missing: string[] = [];
  const resendKey = env.RESEND_API_KEY?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.trim();
  const from = env.EMAIL_FROM?.trim() || user;
  const host = env.SMTP_HOST?.trim() || (user?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
  const port = env.SMTP_PORT ?? 587;
  const secure = env.SMTP_SECURE ?? false;

  const envFileLoaded = Boolean(user || pass || resendKey);

  if (resendKey) {
    if (!from) missing.push("EMAIL_FROM");
    return {
      loaded: missing.length === 0,
      mode: "resend",
      from,
      envFileLoaded,
      missing
    };
  }

  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (!from) missing.push("EMAIL_FROM or SMTP_USER");

  const fromMatchesUser = Boolean(user && from && user.toLowerCase() === from.toLowerCase());

  return {
    loaded: missing.length === 0 && fromMatchesUser,
    mode: missing.length === 0 ? "smtp" : "none",
    host,
    port,
    secure,
    user: mask(user),
    from,
    fromMatchesUser,
    passLength: pass ? normalizeAppPassword(pass).length : 0,
    envFileLoaded,
    missing: fromMatchesUser ? missing : [...missing, "EMAIL_FROM must match SMTP_USER"]
  };
};

const logEmailConfigStatus = (): EmailConfigStatus => {
  const status = getEmailConfigStatus();
  console.log("[email] smtp_configuration_status", {
    loaded: status.loaded,
    mode: status.mode,
    host: status.host ?? "(none)",
    port: status.port ?? "(none)",
    secure: status.secure ?? false,
    smtp_user: status.user ?? "(none)",
    email_from: status.from ?? "(none)",
    from_matches_user: status.fromMatchesUser ?? false,
    app_password_length: status.passLength ?? 0,
    env_vars_present: status.envFileLoaded,
    missing: status.missing
  });
  return status;
};

const assertRealEmailConfigured = (): void => {
  const status = logEmailConfigStatus();

  if (!status.loaded) {
    throw new HttpError(
      503,
      `Email is not configured correctly. Issues: ${status.missing.join("; ")}. ` +
        "Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_SECURE=false, SMTP_USER=your@gmail.com, " +
        "SMTP_PASS=16-char app password, EMAIL_FROM=same as SMTP_USER."
    );
  }

  if (status.mode === "smtp" && status.passLength !== 16) {
    console.warn(
      `[email] SMTP_PASS length is ${status.passLength} (expected 16 for Gmail App Password). ` +
        "If login fails, generate a new app password at https://myaccount.google.com/apppasswords"
    );
  }
};

const createGmailTransporter = () => {
  const smtpUser = env.SMTP_USER!.trim();
  const smtpPass = normalizeAppPassword(env.SMTP_PASS!);

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      minVersion: "TLSv1.2"
    }
  });
};

const createGenericTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_SECURE ?? false,
    requireTLS: !(env.SMTP_SECURE ?? false),
    auth: {
      user: env.SMTP_USER!.trim(),
      pass: normalizeAppPassword(env.SMTP_PASS!)
    }
  });
};

const sendViaResend = async (
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ messageId: string }> => {
  const apiKey = env.RESEND_API_KEY!.trim();
  const from = env.EMAIL_FROM?.trim() || "onboarding@resend.dev";

  console.log(`[email] resend_send_start from=${from} to=${to}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [to], subject, html, text })
  });

  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };

  if (!res.ok) {
    const reason = body.message ?? `Resend API error (${res.status})`;
    console.error(`[email] resend_send_failed to=${to}`, reason);
    throw new HttpError(503, `Failed to send reset email: ${reason}`);
  }

  if (!body.id) {
    throw new HttpError(503, "Email API did not return a message id.");
  }

  console.log(`[email] resend_send_success to=${to} messageId=${body.id}`);
  return { messageId: body.id };
};

export const initEmailService = async (): Promise<void> => {
  if (transporter && deliveryMode !== "none") return;
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    assertRealEmailConfigured();
    const status = getEmailConfigStatus();

    if (status.mode === "resend") {
      deliveryMode = "resend";
      systemFrom = status.from ?? "";
      console.log(`[email] Resend API ready — sender: ${systemFrom}`);
      return;
    }

    deliveryMode = "smtp";
    const isGmail = env.SMTP_USER!.toLowerCase().includes("@gmail.com");

    transporter = isGmail ? createGmailTransporter() : createGenericTransporter();
    systemFrom = (env.EMAIL_FROM?.trim() || env.SMTP_USER!.trim());

    console.log(
      `[email] transporter_created host=${isGmail ? "smtp.gmail.com" : env.SMTP_HOST} port=${isGmail ? 587 : env.SMTP_PORT} secure=false`
    );
    console.log(`[email] smtp_verified_start user=${mask(env.SMTP_USER)} from=${systemFrom}`);

    try {
      await transporter.verify();
      console.log(`[email] smtp_verified user=${mask(env.SMTP_USER)}`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "SMTP verify failed";
      const msg = formatSmtpAuthError(raw);
      console.error(`[email] email_failed phase=smtp_verify`, raw);
      transporter = null;
      deliveryMode = "none";
      initPromise = null;
      throw new HttpError(503, msg);
    }
  })();

  await initPromise;
};

export const sendPasswordResetEmail = async (
  userEmail: string,
  resetUrl: string
): Promise<{ messageId: string }> => {
  const to = userEmail.trim().toLowerCase();
  const subject = "Reset your PathFinder password";
  const text =
    `Reset your PathFinder password (link expires in 1 hour):\n\n${resetUrl}\n\n` +
    "If you did not request this, ignore this email. Check spam/junk if you do not see it.";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#0b0f19;color:#e2e8f0;border-radius:12px;">
      <h2 style="color:#38bdf8;margin:0 0 16px;">PathFinder Password Reset</h2>
      <p style="line-height:1.6;">You requested a password reset. Click the button below. This link expires in 1 hour.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#2563eb,#4f46e5);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
      </p>
      <p style="font-size:12px;color:#94a3b8;">If the button does not work, copy this link:<br/><a href="${resetUrl}" style="color:#38bdf8;">${resetUrl}</a></p>
      <p style="font-size:11px;color:#64748b;margin-top:16px;">Check spam/junk if you do not see this email.</p>
    </div>
  `;

  console.log(`[email] email_send_started to=${to}`);

  await initEmailService();

  if (deliveryMode === "resend") {
    return sendViaResend(to, subject, html, text);
  }

  if (!transporter) {
    throw new HttpError(503, "Email transporter is not available.");
  }

  try {
    await transporter.verify();
    console.log(`[email] smtp_verified before_send`);

    console.log(`[email] email_send_started smtp from=${systemFrom} to=${to}`);
    const info = await transporter.sendMail({
      from: systemFrom,
      to,
      subject,
      text,
      html
    });

    const rejected = info.rejected ?? [];
    if (rejected.length > 0) {
      throw new HttpError(503, `Recipient rejected: ${rejected.join(", ")}`);
    }

    if (!info.messageId) {
      throw new HttpError(503, "SMTP server did not accept the message (no message id).");
    }

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      throw new HttpError(503, "Test email server cannot deliver to real inboxes.");
    }

    console.log(`[email] email_sent to=${to} messageId=${info.messageId}`);
    return { messageId: info.messageId };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Send failed";
    console.error(`[email] email_failed to=${to}`, raw);
    if (err instanceof HttpError) throw err;
    throw new HttpError(503, formatSmtpAuthError(raw));
  }
};
