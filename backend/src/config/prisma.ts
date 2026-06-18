import { PrismaClient, Prisma } from "@prisma/client";

const isDev = process.env.NODE_ENV !== "production";

export const prisma = new PrismaClient({
  log: isDev
    ? [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "stdout", level: "warn" }
      ]
    : [{ emit: "event", level: "error" }]
});

if (isDev) {
  prisma.$on("query" as never, (e: Prisma.QueryEvent) => {
    if (e.duration > 100) {
      console.log(`[Database Query] ${e.duration}ms`);
    }
  });
}

prisma.$on("error" as never, (e: Prisma.LogEvent) => {
  console.error(`[Database Error] ${e.message}`);
});
