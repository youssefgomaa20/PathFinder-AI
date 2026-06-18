import { Router } from "express";
import { Prisma } from "@prisma/client";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import {
  compareCareersSchema,
  generateRoadmapSchema,
  resumeAnalyzeSchema,
  saveRoadmapSchema
} from "../schemas/roadmap.schema.js";
import { callAI } from "../services/aiService.js";
import { prisma } from "../config/prisma.js";
import { createLog } from "../services/log.service.js";

export const roadmapRouter = Router();

roadmapRouter.post("/generate", requireAuth, validateBody(generateRoadmapSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const aiResponse = await callAI("chatbot", body);
    await createLog(req.user!.id, "roadmap_generate", req.ip);
    res.json(aiResponse);
  } catch (error) {
    next(error);
  }
});

roadmapRouter.post("/save", requireAuth, validateBody(saveRoadmapSchema), async (req, res, next) => {
  try {
    const saved = await prisma.savedRoadmap.create({
      data: {
        userId: req.user!.id,
        careerTitle: req.body.goal || "My Roadmap",
        roadmapData: req.body.aiResponse as Prisma.InputJsonValue
      }
    });

    await createLog(req.user!.id, "roadmap_save", req.ip);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

roadmapRouter.get("/all", requireAuth, async (req, res, next) => {
  try {
    const roadmaps = await prisma.savedRoadmap.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" }
    });
    // Transform to match old expected format if needed
    const mapped = roadmaps.map(r => ({
      id: r.id,
      goal: r.careerTitle,
      field: "general",
      aiResponse: r.roadmapData,
      createdAt: r.createdAt
    }));
    res.json(mapped);
  } catch (error) {
    next(error);
  }
});

roadmapRouter.post("/compare-careers", requireAuth, validateBody(compareCareersSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const track1 = body.career1 || body.track1;
    const track2 = body.career2 || body.track2;
    if (!track1 || !track2) {
      return res.status(400).json({ error: "Missing required fields for comparison" });
    }
    const data = await callAI("compare", {
      track1,
      track2,
      language: body.language || "en"
    });
    await createLog(req.user!.id, "compare_careers", req.ip);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

roadmapRouter.post("/resume/analyze", requireAuth, validateBody(resumeAnalyzeSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = await callAI("cv", body);
    await createLog(req.user!.id, "resume_analyze", req.ip);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
