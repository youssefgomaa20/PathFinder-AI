import path from "path";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { roadmapRouter } from "./routes/roadmap.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { pathfinderRouter } from "./routes/pathfinder.routes.js";
import { miscRouter } from "./routes/misc.routes.js";
import { homeAssistantRouter } from "./routes/home-assistant.routes.js";
import { savedChatsRouter } from "./routes/saved-chats.routes.js";

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(compression());
const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: true, // Allow all origins for the project to prevent connection issues
    credentials: true
  })
);
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);
app.use(express.json({ limit: "15mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/roadmap", roadmapRouter);
app.use("/", miscRouter);
app.use("/api/pathfinder", pathfinderRouter);
app.use("/api/home-assistant", homeAssistantRouter);
app.use("/api/saved-chats", savedChatsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
