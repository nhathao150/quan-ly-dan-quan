const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.militiaRecord.findMany();
  console.log(records);
}
main().catch(console.error).finally(() => prisma.$disconnect());
