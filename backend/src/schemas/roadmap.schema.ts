import { z } from "zod";

export const generateRoadmapSchema = z.object({
  goal: z.string().min(2).max(1000),
  field: z.string().min(2).max(1000),
  skills: z.array(z.string().min(1)).optional(),
  experience: z.string().max(5000).optional(),
  challenges: z.string().max(5000).optional(),
  language: z.enum(["en", "ar"]).optional()
});

export const saveRoadmapSchema = z.object({
  goal: z.string().min(3).max(300),
  field: z.string().min(2).max(100),
  aiResponse: z.record(z.string(), z.unknown()),
  type: z.string().optional()
});

export const compareCareersSchema = z.object({
  career1: z.string().min(2).max(100).optional(),
  career2: z.string().min(2).max(100).optional(),
  track1: z.string().min(2).max(100).optional(),
  track2: z.string().min(2).max(100).optional(),
  language: z.enum(["en", "ar"]).optional()
});

export const resumeAnalyzeSchema = z.object({
  fullName: z.string().min(2).max(100),
  professionalTitle: z.string().max(150).optional(),
  careerObjective: z.string().max(2000).optional(),
  email: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  linkedin: z.string().max(200).optional(),
  github: z.string().max(200).optional(),
  portfolio: z.string().max(200).optional(),
  technicalSkills: z.string().max(10000).optional(),
  softSkills: z.string().max(10000).optional(),
  languages: z.string().max(5000).optional(),
  workExperience: z.string().max(30000).optional(),
  internships: z.string().max(20000).optional(),
  projects: z.string().max(30000).optional(),
  education: z.string().max(10000).optional(),
  certifications: z.string().max(10000).optional(),
  training: z.string().max(10000).optional(),
  achievements: z.string().max(10000).optional(),
  volunteerWork: z.string().max(15000).optional(),
  language: z.enum(["en", "ar"]).optional(),
  
  // Fallbacks for older requests
  name: z.string().optional(),
  careerGoal: z.string().optional(),
  skills: z.union([z.array(z.string()), z.string()]).optional(),
  experience: z.string().optional()
});
