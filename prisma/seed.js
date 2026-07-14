import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function parseDate(value) {
  const d = value ? new Date(value) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function seed() {
  let raw;
  try {
    raw = await fs.readFile(USERS_FILE, 'utf-8');
  } catch (err) {
    console.error('Could not read data/users.json:', err.message);
    process.exit(1);
  }

  const data = JSON.parse(raw);
  const users = Array.isArray(data.users) ? data.users : [];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { username: u.username.toLowerCase() } });
    if (existing) {
      console.log(`Skipping existing user: ${u.username}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 10);
    const config = u.kitchen?.config || {};

    const user = await prisma.user.create({
      data: {
        id: u.id,
        username: u.username.toLowerCase(),
        passwordHash,
        info: u.info || 'Personal kitchen account',
        seenWelcome: u.seenWelcome ?? false,
        isDemo: u.id === 'user-001',
        kitchen: {
          create: {
            darkMode: config.darkMode ?? false,
            language: config.language ?? 'en',
            reportGenerationLogic:
              config.reportGenerationLogic ??
              'Prioritize high-protein ingredients and items with high spoilage risk.'
          }
        }
      },
      include: { kitchen: true }
    });

    const kitchenId = user.kitchen.id;

    const ingredients = (u.kitchen?.ingredients || []).map((i) => ({
      kitchenId,
      ingredientId: i.id,
      name: i.name,
      category: i.category,
      currentQty: i.currentQty ?? 0,
      maxQty: i.maxQty ?? i.currentQty ?? 0,
      unit: i.unit,
      percentage: i.percentage ?? 100,
      status: i.status ?? 'normal',
      freshness: i.freshness ?? 50,
      spoilageRisk: i.spoilageRisk ?? 'Low',
      lastUpdated: parseDate(i.lastUpdated),
      isCustom: i.isCustom ?? false,
      hasThreshold: i.hasThreshold ?? true
    }));

    const refills = (u.kitchen?.refills || []).map((r) => ({
      kitchenId,
      ingredientName: r.ingredientName,
      qtyAdded: r.qtyAdded,
      method: r.method ?? 'MANUAL',
      confidence: r.confidence ?? 0,
      timestamp: r.timestamp ?? new Date().toISOString()
    }));

    if (ingredients.length > 0) {
      await prisma.ingredient.createMany({ data: ingredients });
    }
    if (refills.length > 0) {
      await prisma.refillRecord.createMany({ data: refills });
    }

    console.log(`Seeded user: ${u.username}`);
  }

  console.log('Seeding complete.');
}

// Run when executed directly: node prisma/seed.js
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (err) => {
      console.error(err);
      await prisma.$disconnect();
      process.exit(1);
    });
}
