import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { optionalBearerAuth, requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { compareCareersSchema, resumeAnalyzeSchema } from "../schemas/roadmap.schema.js";
import { callAI } from "../services/aiService.js";
import { universalAssistant } from "../services/universal-ai.service.js";
import { z } from "zod";

const careerRoadmapSchema = z.object({
  careerGoal: z.string().min(3),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  field: z.string().optional(),
  challenges: z.string().optional(),
  language: z.enum(["en", "ar"]).optional()
});

const saveSchema = z.object({
  careerTitle: z.string().min(2),
  roadmapData: z.string().min(2),
  type: z.string().optional()
});

const universalAssistantSchema = z.object({
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

export const pathfinderRouter = Router();

pathfinderRouter.use(optionalBearerAuth);

const parseProfileSkills = (skills: string[] | undefined): string[] => {
  if (!skills?.length) return [];
  return skills
    .map((s) => {
      try {
        const parsed = JSON.parse(s) as { name?: string };
        return parsed.name ?? s;
      } catch {
        return s;
      }
    })
    .filter(Boolean);
};

pathfinderRouter.post("/career-roadmap", validateBody(careerRoadmapSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    let profileContext: Record<string, unknown> = {};

    if (req.user?.id) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (user) {
        const profileSkills = parseProfileSkills(user.skills);
        profileContext = {
          careerGoal: user.careerGoal ?? undefined,
          education: user.education ?? undefined,
          university: user.university ?? undefined,
          specialization: user.specialization ?? undefined,
          experience: user.experienceLevel ?? undefined,
          level: user.level ?? undefined,
          profileSkills: profileSkills.length ? profileSkills.join(", ") : undefined
        };
      }
    }

    const chatSkills = Array.isArray(body.skills) ? body.skills : [];
    const profileSkills = (profileContext.profileSkills as string | undefined)?.split(", ").filter(Boolean) ?? [];
    const mergedSkills = chatSkills.length ? chatSkills : profileSkills;

    const careerGoal =
      body.careerGoal ||
      (profileContext.careerGoal as string) ||
      "General IT";

    const data = await callAI("chatbot", {
      careerGoal,
      goal: careerGoal,
      field: body.field ?? careerGoal,
      skills: mergedSkills,
      experience: body.experience || profileContext.experience || "",
      challenges: body.challenges || "",
      education: profileContext.education,
      university: profileContext.university,
      specialization: profileContext.specialization,
      level: profileContext.level,
      profileSkills: profileContext.profileSkills,
      language: body.language || "en"
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

pathfinderRouter.post("/compare-careers", validateBody(compareCareersSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const track1 = body.career1 || body.track1;
    const track2 = body.career2 || body.track2;
    if (!track1 || !track2) {
      return res.status(400).json({ error: "Missing required fields for comparison" });
    }
    const data = await callAI("compare", { track1, track2, language: body.language || "en" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

pathfinderRouter.post("/resume", validateBody(resumeAnalyzeSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = await callAI("cv", body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

pathfinderRouter.post("/universal-assistant", validateBody(universalAssistantSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const result = await universalAssistant({
      question: body.question,
      language: body.language || "en",
      conversationHistory: body.conversationHistory
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

pathfinderRouter.post("/saved-roadmaps", requireAuth, validateBody(saveSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const parsed = JSON.parse(req.body.roadmapData) as Record<string, unknown>;
    const type = req.body.type || "roadmap";
    
    let saved;
    if (type === "compare") {
      saved = await prisma.savedComparison.create({
        data: {
          userId,
          careerTitle: req.body.careerTitle,
          roadmapData: parsed as Prisma.InputJsonValue
        }
      });
      // Add type to the response for the frontend
      (saved as any).type = "compare";
    } else if (type === "resume") {
      saved = await prisma.savedResume.create({
        data: {
          userId,
          careerTitle: req.body.careerTitle,
          roadmapData: parsed as Prisma.InputJsonValue
        }
      });
      (saved as any).type = "resume";
    } else {
      saved = await prisma.savedRoadmap.create({
        data: {
          userId,
          careerTitle: req.body.careerTitle,
          roadmapData: parsed as Prisma.InputJsonValue
        }
      });
      (saved as any).type = type; // "roadmap" or "chat"
    }
    
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

pathfinderRouter.get("/saved-roadmaps", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const [roadmaps, comparisons, resumes] = await Promise.all([
      prisma.savedRoadmap.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.savedComparison.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.savedResume.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    ]);

    const mapped = [
      ...roadmaps.map((r: any) => ({
        id: r.id,
        type: (Array.isArray(r.roadmapData) || String(r.roadmapData).trim().startsWith("[") || r.careerTitle.includes("Conversation")) ? "chat" : "roadmap",
        careerTitle: r.careerTitle,
        roadmapData: JSON.stringify(r.roadmapData),
        completedSteps: r.completedSteps || [],
        createdAt: r.createdAt
      })),
      ...comparisons.map((r: any) => ({
        id: r.id,
        type: "compare",
        careerTitle: r.careerTitle,
        roadmapData: JSON.stringify(r.roadmapData),
        completedSteps: [],
        createdAt: r.createdAt
      })),
      ...resumes.map((r: any) => ({
        id: r.id,
        type: "resume",
        careerTitle: r.careerTitle,
        roadmapData: JSON.stringify(r.roadmapData),
        completedSteps: [],
        createdAt: r.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(mapped);
  } catch (error) {
    next(error);
  }
});

pathfinderRouter.delete("/saved-roadmaps/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    
    // Attempt to delete from all 3, only one will succeed
    await Promise.allSettled([
      prisma.savedRoadmap.deleteMany({ where: { id, userId } }),
      prisma.savedComparison.deleteMany({ where: { id, userId } }),
      prisma.savedResume.deleteMany({ where: { id, userId } })
    ]);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
