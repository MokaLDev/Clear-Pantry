import { seed } from '../prisma/seed.js';
import { prisma } from '../src/lib/prisma.js';

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('Migration failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
