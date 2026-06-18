import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rows = await prisma.$queryRawUnsafe(
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
);

console.log(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
