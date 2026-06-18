/**
 * Verify Profile + Forgot/Reset Password only.
 * Usage: node scripts/verify-profile-auth.mjs
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
const email = `pf-auth-${tag}@test.local`;
const pass = "TestPass123!";
const newPass = "NewPass456!";
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

async function api(method, url, opts = {}) {
  const headers = { ...(opts.headers ?? {}) };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(`${base}${url}`, { method, headers, body: opts.body });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

try {
  const health = await api("GET", "/health");
  check("Backend connected", health.res.ok);

  const signup = await api("POST", "/auth/signup", {
    body: { name: "PF Test", email, password: pass }
  });
  check("Signup", signup.res.ok);
  const token = signup.json?.token;
  if (!token) throw new Error("No token");

  const save = await api("PUT", "/user/profile", {
    token,
    body: {
      name: "Saved Name",
      phone: "111222333",
      bio: "Persist bio",
      careerGoal: "Engineer",
      linkedin: "linkedin.com/in/test"
    }
  });
  check("Profile save", save.res.ok && save.json?.name === "Saved Name");

  const load = await api("GET", "/user/profile", { token });
  check(
    "Profile load after save",
    load.res.ok && load.json?.bio === "Persist bio",
    load.json?.phone
  );

  const img = await api("POST", "/user/upload-image", {
    token,
    body: { image: png }
  });
  const photoUrl = img.json?.photoUrl ?? img.json?.url;
  check("Profile image upload", img.res.ok && !!photoUrl, photoUrl);

  const load2 = await api("GET", "/user/profile", { token });
  check("Image persists in DB", load2.json?.photoUrl === photoUrl);

  const login = await api("POST", "/auth/login", {
    body: { email, password: pass }
  });
  const token2 = login.json?.token;
  const load3 = await api("GET", "/user/profile", { token: token2 });
  check("Profile after login", load3.json?.name === "Saved Name");

  const missing = await api("POST", "/auth/forgot-password", {
    body: { email: `missing-${tag}@test.local` },
    headers: { Origin: "http://localhost:5174" }
  });
  check(
    "Forgot non-existing email",
    missing.res.status === 404 &&
      missing.json?.message?.includes("No account found"),
    missing.json?.message
  );

  const forgot = await api("POST", "/auth/forgot-password", {
    body: { email },
    headers: { Origin: "http://localhost:5174" }
  });
  check("Forgot existing email", forgot.res.ok, forgot.json?.message);

  const user = await prisma.user.findUnique({ where: { email } });
  const resetToken = user?.resetToken ?? "";
  check("Reset token saved", resetToken.length === 64);

  const reset = await api("POST", "/auth/reset-password", {
    body: { token: resetToken, password: newPass }
  });
  check("Reset password", reset.res.ok);

  const login2 = await api("POST", "/auth/login", {
    body: { email, password: newPass }
  });
  check("Login after reset", login2.res.ok);

  await prisma.user.deleteMany({ where: { email } }).catch(() => {});

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
} catch (e) {
  console.error("FATAL:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
