import fs from "fs";
import path from "path";
import type { Prisma } from "@prisma/client";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth.js";
import { prisma } from "../config/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { profileUpdateSchema } from "../schemas/user.schema.js";
import { HttpError } from "../utils/http-error.js";
import { env } from "../config/env.js";
import { toPublicUser } from "../utils/user-public.js";
import { createLog } from "../services/log.service.js";

export const userRouter = Router();

const uploadsRoot = path.join(process.cwd(), "uploads");
const cvsDir = path.join(uploadsRoot, "cvs");
const imagesDir = path.join(uploadsRoot, "images");

const ensureUploadDirs = (): void => {
  if (!fs.existsSync(cvsDir)) fs.mkdirSync(cvsDir, { recursive: true });
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
};

ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDirs();
    cb(null, cvsDir);
  },
  filename: (req, file, cb) => {
    const uid = (req as { user?: { id: string } }).user?.id ?? "anon";
    const ext = path.extname(file.originalname).toLowerCase() === ".pdf" ? ".pdf" : ".pdf";
    cb(null, `${uid}-${Date.now()}${ext}`);
  }
});

const uploadCv = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed."));
      return;
    }
    cb(null, true);
  }
});

const unlinkIfExists = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  }
};

const fileFromPublicUrl = (url: string | null | undefined, subdir: "cvs" | "images"): string | null => {
  if (!url?.includes(`/uploads/${subdir}/`)) return null;
  return path.join(uploadsRoot, subdir, path.basename(url));
};

userRouter.get("/profile", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });
    if (!user) throw new HttpError(404, "User not found.");
    console.log(`[profile] fetch user=${user.id} email=${user.email}`);
    res.json(toPublicUser(user));
  } catch (error) {
    next(error);
  }
});

userRouter.put("/profile", requireAuth, validateBody(profileUpdateSchema), async (req, res, next) => {
  try {
    const b = req.body as {
      name?: string;
      phone?: string | null;
      address?: string | null;
      bio?: string | null;
      birthDate?: string | null;
      university?: string | null;
      education?: string | null;
      experienceLevel?: string | null;
      level?: string | null;
      specialization?: string | null;
      graduationYear?: string | null;
      careerGoal?: string | null;
      linkedin?: string | null;
      github?: string | null;
      portfolio?: string | null;
      skills?: string[];
    };

    const data: Prisma.UserUpdateInput = {};

    if (b.name !== undefined) data.name = b.name;
    if (b.phone !== undefined) data.phone = b.phone;
    if (b.address !== undefined) data.address = b.address;
    if (b.bio !== undefined) data.bio = b.bio;
    if (b.university !== undefined) data.university = b.university;
    if (b.education !== undefined) data.education = b.education;
    if (b.experienceLevel !== undefined) data.experienceLevel = b.experienceLevel;
    if (b.level !== undefined) data.level = b.level;
    if (b.specialization !== undefined) data.specialization = b.specialization;
    if (b.graduationYear !== undefined) data.graduationYear = b.graduationYear;
    if (b.careerGoal !== undefined) data.careerGoal = b.careerGoal;
    if (b.linkedin !== undefined) data.linkedin = b.linkedin === "" ? null : b.linkedin;
    if (b.github !== undefined) data.github = b.github === "" ? null : b.github;
    if (b.portfolio !== undefined) data.portfolio = b.portfolio === "" ? null : b.portfolio;
    if (b.skills !== undefined) data.skills = b.skills;

    if (b.birthDate !== undefined) {
      if (b.birthDate === null || b.birthDate === "") {
        data.birthDate = null;
      } else {
        const d = new Date(b.birthDate);
        if (Number.isNaN(d.getTime())) throw new HttpError(400, "Invalid birth date.");
        data.birthDate = d;
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data
    });

    console.log(`[profile] update_saved user=${user.id} fields=${Object.keys(data).join(",") || "none"}`);
    await createLog(req.user!.id, "profile_update", req.ip);
    res.json(toPublicUser(user));
  } catch (error) {
    next(error);
  }
});

userRouter.post("/upload-cv", requireAuth, (req, res, next) => {
  uploadCv.single("file")(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      next(new HttpError(400, msg));
      return;
    }
    next();
  });
}, async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) throw new HttpError(400, "No file uploaded.");

    const existing = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const oldCv = fileFromPublicUrl(existing?.cvUrl, "cvs");
    if (oldCv) unlinkIfExists(oldCv);

    const publicUrl = `${env.PUBLIC_API_URL.replace(/\/$/, "")}/uploads/cvs/${file.filename}`;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { cvUrl: publicUrl }
    });

    console.log(`[profile] cv_upload user=${user.id} url=${publicUrl}`);
    await createLog(req.user!.id, "cv_upload", req.ip);
    res.status(201).json({ url: publicUrl, cvUrl: publicUrl, user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/upload-image", requireAuth, async (req, res, next) => {
  try {
    console.log(`[profile] image_upload_start user=${req.user!.id}`);
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      throw new HttpError(400, "Invalid image data.");
    }

    let base64Data = image;
    let ext = "png";

    const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      ext = (match[1] ?? "png").toLowerCase();
      base64Data = match[2] ?? "";
    }
    if (ext === "jpeg") ext = "jpg";

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 1) {
      throw new HttpError(400, "Invalid image data.");
    }
    ensureUploadDirs();

    const existing = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const oldImage = fileFromPublicUrl(existing?.photoUrl, "images");
    if (oldImage) unlinkIfExists(oldImage);

    const filename = `${req.user!.id}-${Date.now()}.${ext}`;
    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `${env.PUBLIC_API_URL.replace(/\/$/, "")}/uploads/images/${filename}`;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { photoUrl: publicUrl }
    });

    console.log(
      `[profile] image_upload_success user=${user.id} bytes=${buffer.length} url=${publicUrl}`
    );
    await createLog(req.user!.id, "profile_image_upload", req.ip);
    res.status(201).json({ url: publicUrl, photoUrl: publicUrl, user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/delete-account", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new HttpError(404, "User not found.");

    const cvPath = fileFromPublicUrl(user.cvUrl, "cvs");
    if (cvPath) unlinkIfExists(cvPath);

    const imagePath = fileFromPublicUrl(user.photoUrl, "images");
    if (imagePath) unlinkIfExists(imagePath);

    console.log(`[profile] account_delete user=${user.id} email=${user.email}`);
    await createLog(user.id, "account_delete_requested", req.ip);
    await prisma.user.delete({ where: { id: user.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
