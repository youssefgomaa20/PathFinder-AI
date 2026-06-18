const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Roadmaps:', await prisma.savedRoadmap.count());
    console.log('Comparisons:', await prisma.savedComparison.count());
    console.log('Resumes:', await prisma.savedResume.count());
}
main().finally(() => prisma.$disconnect());
