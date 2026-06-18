import { prisma } from "../config/prisma.js";

export const createLog = async (userId: string | null, action: string, ip?: string): Promise<void> => {
  await prisma.log.create({
    data: {
      userId: userId ?? undefined,
      action,
      ip
    }
  });
};
