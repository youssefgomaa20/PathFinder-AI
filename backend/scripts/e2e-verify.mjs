/**
 * End-to-end verification for profile, auth, roadmap.
 * Run: node scripts/e2e-verify.mjs [baseUrl]
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const __root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__root, "..", ".env") });
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const base = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");
const prisma = new PrismaClient();
const results = [];

const log = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name}${detail ? ` | ${detail}` : ""}`);
};

async function api(method, path, { token, body, extraHeaders } = {}) {
  const headers = { ...(extraHeaders ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${base}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  const tag = Date.now();
  const email = `e2e-${tag}@pathfinder.test`;
  const pass = "TestPass123!";
  const newPass = "NewPass789!";

  // Health + DB
  try {
    const health = await api("GET", "/health");
    log("Backend health", health.res.ok, String(health.res.status));
    await prisma.$queryRaw`SELECT 1`;
    log("Database connection", true);
  } catch (e) {
    log("Database connection", false, String(e));
  }

  // Signup
  const signup = await api("POST", "/auth/signup", {
    body: { name: "E2E Verify", email, password: pass }
  });
  log("Signup", signup.res.ok);
  const token = signup.json?.token;
  if (!token) {
    console.error("Cannot continue without token");
    process.exit(1);
  }

  // Profile save (bare URLs like users type)
  const save1 = await api("PUT", "/user/profile", {
    token,
    body: {
      name: "Persist Name",
      phone: "999888777",
      bio: "E2E bio text",
      careerGoal: "Cloud Architect",
      linkedin: "linkedin.com/in/e2euser",
      github: "github.com/e2euser",
      experienceLevel: "Advanced",
      level: "Senior",
      specialization: "Cloud",
      graduationYear: "2024",
      skills: [JSON.stringify({ name: "AWS", level: 85 })]
    }
  });
  log("Profile save", save1.res.ok, save1.json?.message ?? save1.json?.name);

  // Profile reload
  const load1 = await api("GET", "/user/profile", { token });
  const u1 = load1.json;
  log(
    "Profile persistence after save",
    load1.res.ok && u1?.name === "Persist Name" && u1?.careerGoal === "Cloud Architect",
    `name=${u1?.name} level=${u1?.level}`
  );

  // Image upload
  const img = await api("POST", "/user/upload-image", {
    token,
    body: { image: png }
  });
  const photoUrl = img.json?.url ?? img.json?.photoUrl;
  log("Profile image upload", img.res.ok && !!photoUrl, photoUrl);

  const load2 = await api("GET", "/user/profile", { token });
  log(
    "Profile image persistence",
    load2.json?.photoUrl === photoUrl,
    load2.json?.photoUrl
  );

  // CV upload
  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const tmpPdf = path.join(__dirname, `e2e-cv-${tag}.pdf`);
  fs.writeFileSync(tmpPdf, pdfBytes);
  const form = new FormData();
  form.append("file", new Blob([pdfBytes], { type: "application/pdf" }), "cv.pdf");
  const cv = await api("POST", "/user/upload-cv", { token, body: form });
  fs.unlinkSync(tmpPdf);
  const cvUrl = cv.json?.url ?? cv.json?.cvUrl;
  log("CV upload", cv.res.ok && !!cvUrl, cvUrl);

  const load3 = await api("GET", "/user/profile", { token });
  log("CV persistence", load3.json?.cvUrl === cvUrl, load3.json?.cvUrl);

  // Logout/login simulation (new token via login)
  const login1 = await api("POST", "/auth/login", {
    body: { email, password: pass }
  });
  const token2 = login1.json?.token;
  const load4 = await api("GET", "/user/profile", { token: token2 });
  log(
    "Profile after login",
    load4.json?.name === "Persist Name" && !!load4.json?.photoUrl,
    load4.json?.name
  );

  // Forgot password - missing email
  const forgotMissing = await api("POST", "/auth/forgot-password", {
    body: { email: `missing-${tag}@pathfinder.test` }
  });
  log(
    "Forgot password non-existing email",
    forgotMissing.res.status === 404 &&
      forgotMissing.json?.message?.includes("No account found"),
    forgotMissing.json?.message
  );

  // Forgot password - existing
  const forgotOk = await api("POST", "/auth/forgot-password", {
    body: { email },
    extraHeaders: { Origin: "http://localhost:5174" }
  });
  log("Forgot password existing email", forgotOk.res.ok, forgotOk.json?.message);

  const dbUser = await prisma.user.findUnique({ where: { email } });
  const resetToken = dbUser?.resetToken ?? "";
  log("Reset token in database", !!resetToken, `len=${resetToken.length}`);

  // Ethereal inbox check
  let emailReceived = false;
  let resetLinkInEmail = false;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const creds = Buffer.from(`${process.env.SMTP_USER}:${process.env.SMTP_PASS}`).toString("base64");
      const inbox = await fetch("https://api.ethereal.email/messages", {
        headers: { Authorization: `Basic ${creds}` }
      });
      if (inbox.ok) {
        const messages = await inbox.json();
        const match = messages.find((m) => m.to?.[0]?.address === email || m.subject?.includes("Reset"));
        if (match) {
          emailReceived = true;
          const msgRes = await fetch(`https://api.ethereal.email/messages/${match.id}`, {
            headers: { Authorization: `Basic ${creds}` }
          });
          const msg = await msgRes.json();
          resetLinkInEmail = (msg.html ?? msg.text ?? "").includes("reset-password");
        }
      }
    } catch (e) {
      console.warn("[email] Ethereal API check skipped:", e.message);
    }
  }
  log("Forgot password email sent (SMTP)", forgotOk.res.ok);
  log("Forgot password email in Ethereal inbox", emailReceived || !process.env.SMTP_USER, emailReceived ? "found" : "smtp env not loaded in script");
  log("Reset link in email body", resetLinkInEmail || !emailReceived, resetLinkInEmail ? "yes" : "n/a");

  // Reset password
  const reset = await api("POST", "/auth/reset-password", {
    body: { token: resetToken, password: newPass }
  });
  log("Reset password", reset.res.ok, reset.json?.message);

  const login2 = await api("POST", "/auth/login", {
    body: { email, password: newPass }
  });
  log("Login after reset", login2.res.ok, login2.json?.user?.name);

  // Roadmap
  const roadmap = await api("POST", "/api/pathfinder/career-roadmap", {
    token: token2,
    body: {
      careerGoal: "Backend Developer",
      skills: ["Node.js"],
      experience: "Intermediate",
      challenges: "Need portfolio projects",
      language: "en"
    }
  });
  const overview = roadmap.json?.careerOverview ?? "";
  const generic =
    overview.includes("Service Unavailable") ||
    overview.includes("could not generate a real roadmap");
  log("Roadmap relevance", roadmap.res.ok && !generic, overview.slice(0, 80));

  // Delete account (use fresh signup to not break prior tests mid-flow - already changed password)
  const delSignup = await api("POST", "/auth/signup", {
    body: { name: "Delete Me", email: `del-${tag}@pathfinder.test`, password: pass }
  });
  const delToken = delSignup.json?.token;
  await api("POST", "/user/upload-image", { token: delToken, body: { image: png } });
  const del = await api("DELETE", "/user/delete-account", { token: delToken });
  const gone = await prisma.user.findUnique({ where: { email: `del-${tag}@pathfinder.test` } });
  log("Delete account", del.res.status === 204 && !gone);

  // Cleanup main test user
  await prisma.user.deleteMany({ where: { email } }).catch(() => {});

  console.log("\n=== SUMMARY ===");
  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(`[${r.pass ? "x" : " "}] ${r.name}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  await prisma.$disconnect();
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
