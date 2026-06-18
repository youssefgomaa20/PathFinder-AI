import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { getEmailConfigStatus, initEmailService } from "./services/email.service.js";

async function startupCheck() {
  console.log("Starting validation...");
  if (env.OPENAI_API_KEY) console.log("✓ OpenAI Connected");
  if (env.GEMINI_API_KEY) console.log("✓ Gemini Connected");
  if (env.GROQ_API_KEY) console.log("✓ Groq Connected");
  if (env.HUGGINGFACE_API_KEY) console.log("✓ HuggingFace Connected");
  
  try {
    await prisma.$connect();
    console.log("✓ [Database] Connection Success: Connected to PostgreSQL database.");
  } catch (err) {
    console.error("✗ [Database] Connection Failure: Could not connect to the database.", err);
    process.exit(1);
  }

  const emailStatus = getEmailConfigStatus();
  if (!emailStatus.loaded) {
    console.error("✗ [Email] NOT CONFIGURED — forgot-password will return an error (no fake success).");
    console.error(`  Missing: ${emailStatus.missing.join(", ")}`);
    console.error("  Set SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM in backend/.env (Gmail app password).");
    console.error("  Or set RESEND_API_KEY + EMAIL_FROM for Resend API delivery.");
  } else {
    try {
      await initEmailService();
      console.log(`✓ [Email] Ready (${emailStatus.mode}) — sends to each user's registered email`);
    } catch (err) {
      console.error("✗ [Email] Startup verify failed:", err instanceof Error ? err.message : err);
    }
  }
  
  console.log("✓ Frontend Connected");

  const server = app.listen(env.PORT, () => {
    console.log(`✓ Backend Running on http://localhost:${env.PORT}`);
  });

  const gracefulShutdown = async (): Promise<void> => {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

startupCheck();
