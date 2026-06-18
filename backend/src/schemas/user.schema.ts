import { z } from "zod";

/** Accept bare domains and normalize to https:// for storage. */
export const normalizeOptionalUrl = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, "")}`;
};

const urlOrEmpty = z.preprocess(
  normalizeOptionalUrl,
  z.union([z.string().url().max(500), z.null()])
);

export const profileUpdateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    phone: z.string().max(40).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    bio: z.string().max(5000).optional().nullable(),
    birthDate: z.string().optional().nullable(),
    university: z.string().max(200).optional().nullable(),
    education: z.string().max(2000).optional().nullable(),
    experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().nullable(),
    level: z.enum(["Junior", "Mid-Level", "Senior", "Lead"]).optional().nullable(),
    specialization: z.string().max(200).optional().nullable(),
    graduationYear: z.string().max(20).optional().nullable(),
    careerGoal: z.string().max(500).optional().nullable(),
    linkedin: urlOrEmpty.optional().nullable(),
    github: urlOrEmpty.optional().nullable(),
    portfolio: urlOrEmpty.optional().nullable(),
    skills: z.array(z.string().min(1).max(80)).max(100).optional()
  })
  .strict();
