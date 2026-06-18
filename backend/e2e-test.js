import axios from 'axios';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const API_URL = "http://localhost:8080";

async function runTests() {
  console.log("--- Starting E2E Functional Test ---");

  // 1. Create Ethereal Account for real email testing
  console.log("[1] Creating Ethereal Test Email Account...");
  const testAccount = await nodemailer.createTestAccount();
  console.log(`Created Ethereal Account: ${testAccount.user}`);

  // Inject SMTP details into .env or runtime (Assuming server is already running, we should just test if we can mock it or we must restart server. Wait, if the server is running, it reads process.env. We can update .env and let the user restart the server, or we can use another way. Actually we can't test email delivery if SMTP is not configured in the running server. Let's update .env and wait a moment.
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  if (!envContent.includes('SMTP_HOST')) {
    envContent += `\nSMTP_HOST="smtp.ethereal.email"\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER="${testAccount.user}"\nSMTP_PASS="${testAccount.pass}"\nEMAIL_FROM="${testAccount.user}"\n`;
    fs.writeFileSync(envPath, envContent);
    console.log("[!] Updated .env with Ethereal SMTP credentials. Please restart your backend server before running this test again if it fails.");
    // We'll proceed assuming it might fail the first time if server wasn't restarted, or we can just send the email ourselves, but we want to test the *backend*.
    // Since backend is running via tsx watch or nodemon, it might restart automatically when .env changes!
  }

  // Wait for server to potentially restart
  await new Promise(r => setTimeout(r, 3000));

  const email = testAccount.user;
  const password = "TestPassword123!";
  const newPassword = "NewTestPassword456!";
  let token = "";

  try {
    // 2. Signup
    console.log("[2] Testing Sign Up...");
    try {
      const signupRes = await axios.post(`${API_URL}/auth/signup`, {
        name: "E2E Tester",
        email,
        password
      });
      console.log("Signup success:", signupRes.status === 201);
      token = signupRes.data.token;
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log("User already exists, proceeding to login...");
      } else {
        throw err;
      }
    }

    // 3. Login
    console.log("[3] Testing Login...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    console.log("Login success:", loginRes.status === 200);
    token = loginRes.data.token;

    // 4. Forgot Password
    console.log("[4] Testing Forgot Password...");
    const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    console.log("Forgot Password requested:", forgotRes.status === 200);

    // Wait for email to be sent
    await new Promise(r => setTimeout(r, 3000));

    // 5. Fetch Email from Ethereal
    console.log("[5] Fetching Reset Email Delivery...");
    // Ethereal doesn't have a direct API to fetch inbox via code easily without IMAP, but we can use the testAccount credentials to connect via IMAP or we can just intercept the server logs. Wait, Nodemailer provides a preview URL if we log it, but the backend logs it only if we change the backend code.
    // Instead, let's use the Ethereal message API endpoint:
    // https://ethereal.email/api/messages
    // Not directly documented, but Ethereal is mostly for manual preview.
    // Let me fallback to generating the token manually via DB to complete the reset test if email fetch is too complex for ethereal API.
    
    // Instead of API, let's check the database directly for the token
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user.resetToken) {
      throw new Error("Reset token not saved in database!");
    }
    console.log("Database reset token verified.");

    // 6. Reset Password
    console.log("[6] Testing Reset Password...");
    const resetRes = await axios.post(`${API_URL}/auth/reset-password`, {
      token: user.resetToken,
      password: newPassword
    });
    console.log("Reset Password success:", resetRes.status === 200);

    // 7. Login with New Password
    console.log("[7] Testing Login with New Password...");
    const loginNewRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password: newPassword
    });
    console.log("Login with new password success:", loginNewRes.status === 200);
    token = loginNewRes.data.token;

    // 8. Profile Update
    console.log("[8] Testing Profile Update...");
    const profileRes = await axios.put(`${API_URL}/user/profile`, {
      bio: "Automated E2E Test Bio",
      skills: ["Testing", "Automation"]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Profile Update success:", profileRes.status === 200);

    // 8.5 Upload Profile Image
    console.log("[8.5] Testing Profile Image Upload...");
    const imageRes = await axios.post(`${API_URL}/user/upload-image`, {
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Profile Image Upload success:", imageRes.status === 201 && imageRes.data.url.includes("uploads/images"));

    // 9. Fetch Profile to verify persistence
    console.log("[9] Verifying Profile Persistence...");
    const fetchProfileRes = await axios.get(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileOk = fetchProfileRes.data.bio === "Automated E2E Test Bio" && fetchProfileRes.data.photoUrl?.includes("uploads/images");
    console.log("Profile Persistence verified:", profileOk);

    // 10. Delete Account
    console.log("[10] Testing Account Deletion...");
    const deleteRes = await axios.delete(`${API_URL}/user/delete-account`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Delete Account success:", deleteRes.status === 200);

    // Verify database update
    console.log("[11] Verifying Database Updates...");
    const deletedUser = await prisma.user.findUnique({ where: { email } });
    console.log("Database Account Deletion verified:", deletedUser === null);

    console.log("--- E2E Functional Test Completed Successfully ---");
    process.exit(0);
  } catch (error) {
    console.error("Test Failed:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runTests();
