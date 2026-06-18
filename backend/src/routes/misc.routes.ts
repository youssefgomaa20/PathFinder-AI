import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { compareCareersSchema, resumeAnalyzeSchema } from "../schemas/roadmap.schema.js";
import { callAI } from "../services/aiService.js";

export const miscRouter = Router();

miscRouter.post("/compare-careers", requireAuth, validateBody(compareCareersSchema), async (req, res, next) => {
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

miscRouter.post("/resume/analyze", requireAuth, validateBody(resumeAnalyzeSchema), async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = await callAI("cv", body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
