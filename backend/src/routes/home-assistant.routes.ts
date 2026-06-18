import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate.js";
import { homeAssistantService } from "../services/home-assistant.service.js";

const chatSchema = z.object({
  question: z.string().min(1).max(5000),
  language: z.enum(["en", "ar"]).optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
      })
    )
    .optional()
});

export const homeAssistantRouter = Router();

homeAssistantRouter.post("/chat", validateBody(chatSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const result = await homeAssistantService({
      question: body.question,
      language: body.language || "en",
      conversationHistory: body.conversationHistory
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
