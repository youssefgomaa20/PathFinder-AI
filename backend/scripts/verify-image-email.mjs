import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const base = "http://localhost:8080";
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  const tag = Date.now();
  const email = `img-${tag}@test.local`;
  const pass = "TestPass123!";

  const signup = await fetch(`${base}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Img Test", email, password: pass })
  });
  const { token } = await signup.json();
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  console.log("1. Upload image...");
  const up = await fetch(`${base}/user/upload-image`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ image: png })
  });
  const upJson = await up.json();
  console.log(up.ok ? "PASS upload" : "FAIL upload", up.status, upJson);
  const photoUrl = upJson.photoUrl ?? upJson.url;

  console.log("2. Profile fetch has photoUrl...");
  const prof = await fetch(`${base}/user/profile`, { headers: h });
  const profJson = await prof.json();
  console.log(
    profJson.photoUrl === photoUrl ? "PASS db persist" : "FAIL db persist",
    profJson.photoUrl
  );

  console.log("3. Image file served (cross-origin)...");
  const img = await fetch(photoUrl);
  const ct = img.headers.get("content-type");
  const corp = img.headers.get("cross-origin-resource-policy");
  console.log(
    img.ok && ct?.startsWith("image/") ? "PASS serve" : "FAIL serve",
    img.status,
    ct,
    "CORP=" + corp
  );

  console.log("4. Forgot password non-existing...");
  const miss = await fetch(`${base}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5174" },
    body: JSON.stringify({ email: `none-${tag}@test.local` })
  });
  const missJson = await miss.json();
  console.log(
    miss.status === 404 && missJson.message?.includes("No account found")
      ? "PASS missing email"
      : "FAIL missing email",
    missJson.message
  );

  console.log("5. Forgot password existing (Ethereal blocked for real inbox)...");
  const forgot = await fetch(`${base}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5174" },
    body: JSON.stringify({ email })
  });
  const forgotJson = await forgot.json();
  console.log(
    process.env.SMTP_HOST?.includes("ethereal")
      ? forgot.status === 503
        ? "PASS ethereal blocked (user must set real SMTP)"
        : "FAIL should block ethereal"
      : forgot.ok
        ? "PASS email sent"
        : "FAIL email",
    forgot.status,
    forgotJson.message
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
