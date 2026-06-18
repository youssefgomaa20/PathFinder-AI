/**
 * Full forgot-password flow: register → forgot → reset → login
 * Uses each user's own email from DB (no per-user SMTP config).
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const base = "http://localhost:8080";
const prisma = new PrismaClient();
const tag = Date.now();
const userEmail = `reset-flow-${tag}@test.local`;
const pass = "TestPass123!";
const newPass = "NewPass789!";

async function main() {
  console.log("=== Reset password flow (any user email) ===\n");

  const signup = await fetch(`${base}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Flow Test", email: userEmail, password: pass })
  });
  const signupJson = await signup.json();
  console.log(signup.ok ? "PASS signup" : "FAIL signup", signup.status, signupJson.email ?? signupJson.message);

  const dbUser1 = await prisma.user.findUnique({ where: { email: userEmail } });
  console.log(dbUser1?.email === userEmail ? "PASS email in database" : "FAIL email in database");

  const missing = await fetch(`${base}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5174" },
    body: JSON.stringify({ email: `nobody-${tag}@test.local` })
  });
  const missingJson = await missing.json();
  console.log(
    missing.status === 404 && missingJson.message?.includes("No account found")
      ? "PASS non-existing email rejected"
      : "FAIL non-existing email",
    missingJson.message
  );

  const forgot = await fetch(`${base}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5174" },
    body: JSON.stringify({ email: userEmail })
  });
  const forgotJson = await forgot.json();
  console.log(
    forgot.ok ? "PASS forgot-password sent" : "FAIL forgot-password",
    forgot.status,
    forgotJson.message
  );

  const dbUser2 = await prisma.user.findUnique({ where: { email: userEmail } });
  const hasToken = Boolean(dbUser2?.resetToken && dbUser2.resetTokenExpiry);
  console.log(hasToken ? "PASS token saved in database" : "FAIL token in database");

  if (!hasToken) {
    process.exit(1);
  }

  const reset = await fetch(`${base}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: dbUser2.resetToken, password: newPass })
  });
  const resetJson = await reset.json();
  console.log(reset.ok ? "PASS reset-password" : "FAIL reset-password", resetJson.message);

  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, password: newPass })
  });
  const loginJson = await login.json();
  console.log(login.ok ? "PASS login with new password" : "FAIL login", loginJson.user?.email);

  const dbUser3 = await prisma.user.findUnique({ where: { email: userEmail } });
  console.log(
    !dbUser3?.resetToken ? "PASS token cleared after reset" : "FAIL token still set"
  );

  await prisma.user.deleteMany({ where: { email: userEmail } }).catch(() => {});
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
