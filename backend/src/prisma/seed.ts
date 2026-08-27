import { PrismaClient } from '@prisma/client';
import { SeedService } from '../services/seedService';

const prisma = new PrismaClient();

async function main() {
  await SeedService.seedDatabase(prisma);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
