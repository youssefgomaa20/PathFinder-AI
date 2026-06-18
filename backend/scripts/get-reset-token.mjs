import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/get-reset-token.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email } });
console.log(user?.resetToken ?? "");
await prisma.$disconnect();
