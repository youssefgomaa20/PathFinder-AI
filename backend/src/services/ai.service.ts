import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const mapAIError = (error: unknown): never => {
  console.error("[AI Service Error]:", error);
  throw new HttpError(502, "AI request failed. Please try again.");
};

export const generateRoadmapWithAI = async (input: {
  goal: string;
  field: string;
  skills?: string[];
  experience?: string;
  language?: "en" | "ar";
}): Promise<Record<string, unknown>> => {
  try {
    const prompt = `You must return ONLY valid JSON and absolutely nothing else. Create an EXTREMELY detailed, step-by-step career roadmap.
Goal: ${input.goal}
Field: ${input.field}
Skills: ${(input.skills ?? []).join(", ") || "Not provided"}
Experience: ${input.experience ?? "Not provided"}
Language: ${input.language === 'ar' ? 'Arabic (Respond entirely in Arabic)' : 'English'}

Structure:
{
  "careerOverview": "...",
  "skillsToLearn": ["..."],
  "learningPlan": [{"step": 1, "title": "...", "description": "What to learn: ...\\nHow to learn: ...\\nTools: ...\\nProject: ...", "duration": "..."}],
  "salaryExpectations": {"junior": "...", "mid": "...", "senior": "...", "freelance": "..."},
  "jobOpportunities": [{"title": "...", "remote": "..."}],
  "prosAndCons": {"pros": ["..."], "cons": ["..."]},
  "freeResources": [{"name": "...", "url": "...", "type": "..."}],
  "finalRecommendation": "..."
}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    return mapAIError(error);
  }
};

export const compareCareersWithAI = async (
  career1: string,
  career2: string,
  language?: "en" | "ar"
): Promise<Record<string, unknown>> => {
  try {
    const prompt = `You must return ONLY valid JSON and absolutely nothing else. Compare ${career1} and ${career2}. Provide a FULL, extremely detailed comparison.
Language: ${language === 'ar' ? 'Arabic (Respond entirely in Arabic)' : 'English'}

Structure:
{
  "overview": { "career1": "...", "career2": "..." },
  "difficulty": { "career1": "...", "career2": "..." },
  "requiredLanguages": { "career1": ["..."], "career2": ["..."] },
  "frameworks": { "career1": ["..."], "career2": ["..."] },
  "salaryRange": { "career1": "...", "career2": "..." },
  "demand": { "career1": "...", "career2": "..." },
  "remoteOpportunities": { "career1": "...", "career2": "..." },
  "timeToLearn": { "career1": "...", "career2": "..." },
  "personalityType": { "career1": "...", "career2": "..." },
  "futureGrowth": { "career1": "...", "career2": "..." },
  "aiRisk": { "career1": "...", "career2": "..." },
  "freelancePotential": { "career1": "...", "career2": "..." },
  "recommendedForBeginners": { "career1": "...", "career2": "..." },
  "prosCons": { "career1": { "pros": ["..."], "cons": ["..."] }, "career2": { "pros": ["..."], "cons": ["..."] } },
  "finalRecommendation": "..."
}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    return mapAIError(error);
  }
};

export const analyzeResumeWithAI = async (input: {
  name: string;
  careerGoal: string;
  skills: string[];
  education?: string;
  experience?: string;
  language?: "en" | "ar";
}): Promise<Record<string, unknown>> => {
  try {
    const prompt = `You must return ONLY valid JSON and absolutely nothing else. Build ATS-friendly professional resume data for:
Name: ${input.name || ''}
Goal: ${input.careerGoal || ''}
Skills: ${(input.skills || []).join(", ")}
Education: ${input.education ?? "N/A"}
Experience: ${input.experience ?? "N/A"}
Language: ${input.language === 'ar' ? 'Arabic (Respond entirely in Arabic)' : 'English'}

Structure:
{
  "personalInfo": {"fullName": "...", "professionalTitle": "...", "email": "...", "phone": "...", "location": "...", "linkedin": "...", "github": "...", "portfolio": "..."},
  "summary": "...",
  "technicalSkills": ["..."],
  "softSkills": ["..."],
  "languages": ["..."],
  "experience": [{"title": "...", "company": "...", "date": "...", "description": ["..."]}],
  "internships": [{"title": "...", "company": "...", "date": "...", "description": ["..."]}],
  "projects": [{"title": "...", "description": ["..."]}],
  "education": [{"degree": "...", "institution": "...", "date": "..."}],
  "certifications": [{"name": "...", "issuer": "...", "date": "..."}],
  "achievements": ["..."],
  "volunteerWork": [{"role": "...", "organization": "...", "date": "...", "description": ["..."]}]
}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    return mapAIError(error);
  }
};
