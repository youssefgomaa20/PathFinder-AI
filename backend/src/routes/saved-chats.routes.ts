import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";

const savedMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.string().optional()
});

const savedChatSchema = z.object({
  title: z.string().min(1),
  messages: z.array(savedMessageSchema).min(1)
});

export const savedChatsRouter = Router();

savedChatsRouter.use(requireAuth);

savedChatsRouter.post("/", validateBody(savedChatSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { title, messages } = req.body;
    
    const savedChat = await prisma.savedChat.create({
      data: {
        userId,
        title,
        messages
      }
    });
    
    res.status(201).json(savedChat);
  } catch (error) {
    next(error);
  }
});

savedChatsRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const chats = await prisma.savedChat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    
    res.json(chats);
  } catch (error) {
    next(error);
  }
});

savedChatsRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    
    const chat = await prisma.savedChat.findFirst({
      where: { id, userId }
    });
    
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    res.json(chat);
  } catch (error) {
    next(error);
  }
});

savedChatsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;
    
    await prisma.savedChat.deleteMany({
      where: { id, userId }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
