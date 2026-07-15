import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import OpenAI from 'openai';
import bcrypt from 'bcryptjs';
import COS from 'cos-nodejs-sdk-v5';
import { prisma } from './src/lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const IMAGES_DIR = path.join(__dirname, 'data', 'images');
const CONVERSATIONS_DIR = path.join(__dirname, 'data', 'conversations');
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const DEMO_USER_ID = 'user-001';

if (!process.env.API_KEY) {
  console.warn('WARNING: API_KEY environment variable is not set. AI image analysis will fail.');
}

const defaultHeaders = {};
if (process.env.APP_ID) {
  defaultHeaders.appid = process.env.APP_ID;
}

const openai = process.env.API_KEY
  ? new OpenAI({
      baseURL: 'https://qianfan.baidubce.com/v2',
      apiKey: process.env.API_KEY,
      defaultHeaders
    })
  : null;

// Tencent Cloud COS configuration (optional; falls back to local disk if not set)
const cosClient = process.env.COS_SECRET_ID && process.env.COS_SECRET_KEY
  ? new COS({
      SecretId: process.env.COS_SECRET_ID,
      SecretKey: process.env.COS_SECRET_KEY
    })
  : null;
const COS_BUCKET = process.env.COS_BUCKET || '';
const COS_REGION = process.env.COS_REGION || '';
const COS_BASE_URL = process.env.COS_BASE_URL || '';

function cosEnabled() {
  return !!(cosClient && COS_BUCKET && COS_REGION);
}

function cosKey(username, filename) {
  return `images/${username}/${path.basename(filename)}`;
}

async function cosUrl(key) {
  // If a public CDN / custom domain is configured, use it directly.
  if (COS_BASE_URL) {
    return `${COS_BASE_URL.replace(/\/$/, '')}/${key}`;
  }
  // Otherwise build a public COS URL. This requires the bucket/objects to be public-read.
  return `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${key}`;
}

function cosCall(method, params) {
  return new Promise((resolve, reject) => {
    cosClient[method](params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

async function listCosImages(username) {
  const prefix = `images/${username}/`;
  const data = await cosCall('getBucket', {
    Bucket: COS_BUCKET,
    Region: COS_REGION,
    Prefix: prefix,
    MaxKeys: 1000
  });
  return (data.Contents || [])
    .map((item) => path.basename(item.Key))
    .filter((name) => name && (/\.(jpg|jpeg)$/i).test(name));
}

async function uploadCosImage(username, filename, buffer) {
  const key = cosKey(username, filename);
  await cosCall('putObject', {
    Bucket: COS_BUCKET,
    Region: COS_REGION,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg'
  });
  return { filename, url: await cosUrl(key) };
}

async function getCosImageBuffer(username, filename) {
  const key = cosKey(username, filename);
  // Omit Output to get a Buffer by default. Passing Output: 'buffer' is a
  // known SDK pitfall: it treats the string 'buffer' as a filename stream.
  const data = await cosCall('getObject', {
    Bucket: COS_BUCKET,
    Region: COS_REGION,
    Key: key
  });

  if (!data || !data.Body) return null;

  // The SDK may return a Buffer, a binary string, or a stream.
  if (Buffer.isBuffer(data.Body)) {
    return data.Body;
  }
  if (typeof data.Body === 'string') {
    return Buffer.from(data.Body, 'binary');
  }
  if (data.Body && typeof data.Body.on === 'function') {
    const chunks = [];
    for await (const chunk of data.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  return Buffer.from(data.Body);
}

async function deleteCosImage(username, filename) {
  const key = cosKey(username, filename);
  await cosCall('deleteObject', {
    Bucket: COS_BUCKET,
    Region: COS_REGION,
    Key: key
  });
}

async function deleteAllCosImages(username) {
  const prefix = `images/${username}/`;
  const data = await cosCall('getBucket', {
    Bucket: COS_BUCKET,
    Region: COS_REGION,
    Prefix: prefix,
    MaxKeys: 1000
  });
  const objects = (data.Contents || []).map((item) => ({ Key: item.Key }));
  if (objects.length) {
    await cosCall('deleteMultipleObject', {
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Objects: objects
    });
  }
}

function sanitizeUser(user) {
  // Return user info without the password hash to the client.
  return {
    id: user.id,
    username: user.username,
    info: user.info,
    seenWelcome: user.seenWelcome,
    isDemo: user.isDemo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function serializeKitchen(kitchen) {
  if (!kitchen) {
    return { ingredients: [], refills: [], config: { darkMode: false, language: 'en', reportGenerationLogic: '' } };
  }
  return {
    config: {
      darkMode: kitchen.darkMode,
      language: kitchen.language,
      reportGenerationLogic: kitchen.reportGenerationLogic
    },
    ingredients: kitchen.ingredients.map((i) => ({
      id: i.ingredientId,
      name: i.name,
      category: i.category,
      currentQty: i.currentQty,
      maxQty: i.maxQty,
      unit: i.unit,
      percentage: i.percentage,
      status: i.status,
      freshness: i.freshness,
      spoilageRisk: i.spoilageRisk,
      lastUpdated: i.lastUpdated.toISOString(),
      isCustom: i.isCustom,
      hasThreshold: i.hasThreshold,
      color: i.color ?? '#dbeafe',
      icon: i.icon ?? '🥫'
    })),
    refills: kitchen.refills.map((r) => ({
      id: r.id,
      ingredientId: r.ingredientId,
      ingredientName: r.ingredientName,
      notes: r.notes,
      qtyAdded: r.qtyAdded,
      method: r.method,
      confidence: r.confidence,
      timestamp: r.timestamp
    }))
  };
}

async function upsertKitchenForUser(userId, kitchen) {
  const config = kitchen?.config || {};
  const ingredients = Array.isArray(kitchen?.ingredients) ? kitchen.ingredients : [];
  const refills = Array.isArray(kitchen?.refills) ? kitchen.refills : [];

  const ingredientData = ingredients.length ? ingredients.map(ingredientCreateArgs) : null;
  const refillData = refills.length ? refills.map(refillCreateArgs) : null;

  const existingKitchen = await prisma.kitchen.findUnique({ where: { userId } });
  if (!existingKitchen) {
    // Should not happen because signup creates a kitchen, but handle gracefully.
    await prisma.kitchen.create({
      data: {
        userId,
        darkMode: config.darkMode ?? false,
        language: config.language ?? 'en',
        reportGenerationLogic: config.reportGenerationLogic ?? '',
        ...(ingredientData ? { ingredients: { createMany: { data: ingredientData } } } : {}),
        ...(refillData ? { refills: { createMany: { data: refillData } } } : {})
      }
    });
    return;
  }

  const kitchenId = existingKitchen.id;

  await prisma.$transaction([
    prisma.ingredient.deleteMany({ where: { kitchenId } }),
    prisma.refillRecord.deleteMany({ where: { kitchenId } }),
    prisma.kitchen.update({
      where: { userId },
      data: {
        darkMode: config.darkMode ?? existingKitchen.darkMode,
        language: config.language ?? existingKitchen.language,
        reportGenerationLogic: config.reportGenerationLogic ?? existingKitchen.reportGenerationLogic,
        ...(ingredientData ? { ingredients: { createMany: { data: ingredientData } } } : {}),
        ...(refillData ? { refills: { createMany: { data: refillData } } } : {})
      }
    })
  ]);
}

function ingredientCreateArgs(i) {
  return {
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
    lastUpdated: i.lastUpdated ? new Date(i.lastUpdated) : new Date(),
    isCustom: i.isCustom ?? false,
    hasThreshold: i.hasThreshold ?? true,
    color: i.color ?? '#dbeafe',
    icon: i.icon ?? '🥫'
  };
}

function refillCreateArgs(r) {
  return {
    ingredientId: r.ingredientId || null,
    ingredientName: r.ingredientName,
    notes: r.notes ?? '',
    qtyAdded: r.qtyAdded,
    method: r.method ?? 'MANUAL',
    confidence: r.confidence ?? 0,
    timestamp: r.timestamp ?? new Date().toISOString()
  };
}

async function resolveUserImagePath(userId, filename) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.username) return null;
  const userDir = path.resolve(path.join(IMAGES_DIR, user.username));
  const filePath = path.resolve(path.join(userDir, path.basename(filename)));
  // Security: ensure the resolved path stays inside the user's own folder.
  if (!filePath.startsWith(userDir + path.sep)) return null;
  return filePath;
}

async function getImageBuffer(userId, filename) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.username) return null;
  if (cosEnabled()) {
    return getCosImageBuffer(user.username, filename);
  }
  const filePath = await resolveUserImagePath(userId, filename);
  if (!filePath) return null;
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function resolveUserConversationDir(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.username) return null;
  const userDir = path.resolve(path.join(CONVERSATIONS_DIR, user.username));
  return userDir;
}

function isValidConversationId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}

function getLanguageName(language) {
  const languageNames = { en: 'English', zh: 'Chinese', es: 'Spanish' };
  return languageNames[language] || 'English';
}

function buildAiSystemPrompt(language, mode, kitchenContext) {
  const languageName = getLanguageName(language);

  const baseInstructions = `You are a precise kitchen inventory assistant. The user is looking at a photo from their pantry. Respond in ${languageName}.`;

  const schemaInstructions = `
Return your response as a single JSON object matching this schema:
{
  "version": "1.0.0",
  "reply": "<human-readable answer, can use Markdown>",
  "requiresConfirmation": <boolean>,
  "detectedRefills": [
    {
      "ingredientName": "string (required)",
      "quantity": <number (required)>,
      "unit": "g | ml | pcs | %",
      "confidence": <number 0-100>,
      "category": "string",
      "notes": "string"
    }
  ],
  "detectedIngredients": [
    {
      "name": "string (required)",
      "category": "string (required)",
      "currentQty": <number (required)>,
      "maxQty": <number (required)>,
      "unit": "g | ml | pcs | %",
      "freshness": <number 0-100>,
      "spoilageRisk": "High | Medium | Low",
      "confidence": <number 0-100>,
      "notes": "string"
    }
  ],
  "actions": []
}

Rules:
- "reply" is required and should be a concise, friendly message.
- Set "requiresConfirmation" to true whenever you include detectedRefills or detectedIngredients that the user must approve before they are written to the pantry.
- If the user is just asking a question, you may leave detectedRefills and detectedIngredients empty and set requiresConfirmation to false.
- If the user asks you to record a refill or add an ingredient, populate the relevant arrays and set requiresConfirmation to true.
- Do not wrap the JSON in markdown code fences. Output raw JSON only.`;

  const contextInstructions = kitchenContext
    ? `
Current pantry context (so you can avoid duplicates and suggest accurate quantities):
${JSON.stringify(kitchenContext, null, 2)}`
    : '';

  if (mode === 'refill') {
    return `${baseInstructions}
The user wants you to detect new refills or newly added ingredients from the attached photo.
Inspect the image carefully. For each visible item, emit a detectedRefill entry with quantity, unit, and confidence.
Use the pantry context to decide if an item matches an existing ingredient. If it matches, set ingredientName to the exact existing ingredient name so the client can add the quantity to that container. If it does not match any existing ingredient, set ingredientName to the new item's name and set isNewIngredient to true.
Only use detectedRefills in this mode; leave detectedIngredients empty.
Set requiresConfirmation to true unless the image contains nothing detectable.
${contextInstructions}
${schemaInstructions}`;
  }

  return `${baseInstructions}
Answer the user's question or follow their request about the attached photo. The image may contain food, raw ingredients, packaged groceries, refills, or any other kitchen-related items.
${contextInstructions}
${schemaInstructions}`;
}

function extractJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through to regex extraction
    }
  }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeAiResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    return { version: '1.0.0', reply: String(raw || ''), requiresConfirmation: false };
  }
  return {
    version: raw.version || '1.0.0',
    reply: typeof raw.reply === 'string' ? raw.reply : '',
    requiresConfirmation: !!raw.requiresConfirmation,
    detectedRefills: Array.isArray(raw.detectedRefills) ? raw.detectedRefills : [],
    detectedIngredients: Array.isArray(raw.detectedIngredients) ? raw.detectedIngredients : [],
    actions: Array.isArray(raw.actions) ? raw.actions : []
  };
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // GET all users (for client-side validation fallback)
  app.get('/api/users', async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json({ users: users.map(sanitizeUser) });
  });

  // POST login
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid username or password.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid username or password.' });
      return;
    }

    res.json({ success: true, user: sanitizeUser(user) });
  });

  // POST sign-up - creates account with an empty kitchen
  app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required.' });
      return;
    }

    const normalizedUsername = username.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Username already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: `user-${Date.now()}`,
        username: normalizedUsername,
        passwordHash,
        info: 'Personal kitchen account',
        seenWelcome: false,
        isDemo: false,
        kitchen: {
          create: {
            darkMode: false,
            language: 'en',
            reportGenerationLogic: 'Prioritize high-protein ingredients and list expiration dates in DD/MM/YYYY format...'
          }
        }
      }
    });

    res.json({ success: true, user: sanitizeUser(user) });
  });

  // GET account kitchen + welcome state
  app.get('/api/account/:userId', async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: { kitchen: { include: { ingredients: true, refills: true } } }
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({
      success: true,
      seenWelcome: user.seenWelcome,
      kitchen: serializeKitchen(user.kitchen)
    });
  });

  // DELETE account
  app.delete('/api/account/:userId', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Cascading delete removes Kitchen, Ingredients, Refills, and Conversations.
    await prisma.user.delete({ where: { id: req.params.userId } });

    // Remove the user's captured images
    if (user.username) {
      try {
        if (cosEnabled()) {
          await deleteAllCosImages(user.username);
          console.log(`Removed COS images for user: ${user.username}`);
        } else {
          const userImagesDir = path.join(IMAGES_DIR, user.username);
          await fs.rm(userImagesDir, { recursive: true, force: true });
          console.log(`Removed user images directory: ${userImagesDir}`);
        }
      } catch (err) {
        console.error('Failed to remove user images:', err);
      }

      // Remove the user's saved AI conversations (legacy disk folder)
      const userConversationsDir = path.join(CONVERSATIONS_DIR, user.username);
      try {
        await fs.rm(userConversationsDir, { recursive: true, force: true });
        console.log(`Removed user conversations directory: ${userConversationsDir}`);
      } catch (err) {
        console.error('Failed to remove user conversations:', err);
      }
    }

    res.json({ success: true });
  });

  // POST account kitchen + welcome state
  // NOTE: kitchen updates are ignored for the demo account so it always resets.
  app.post('/api/account/:userId', async (req, res) => {
    const { seenWelcome, kitchen } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (typeof seenWelcome === 'boolean') {
      await prisma.user.update({
        where: { id: req.params.userId },
        data: { seenWelcome }
      });
    }

    // Demo account: never persist kitchen changes.
    if (!user.isDemo && kitchen) {
      try {
        await upsertKitchenForUser(req.params.userId, kitchen);
      } catch (err) {
        console.error('Failed to persist kitchen for user', req.params.userId, err);
        res.status(500).json({ success: false, message: 'Failed to save kitchen data.' });
        return;
      }
    }

    res.json({ success: true });
  });

  // POST capture image from camera and save under data/images/:username (or COS)
  app.post('/api/capture/:userId', async (req, res) => {
    const { image } = req.body;
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      res.status(400).json({ success: false, message: 'Invalid image data.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const filename = `${Date.now()}.jpg`;

    try {
      if (cosEnabled()) {
        const { url } = await uploadCosImage(user.username, filename, buffer);
        res.json({ success: true, filename, path: cosKey(user.username, filename), url });
      } else {
        const userDir = path.join(IMAGES_DIR, user.username);
        await fs.mkdir(userDir, { recursive: true });
        const filePath = path.join(userDir, filename);
        await fs.writeFile(filePath, buffer);
        res.json({ success: true, filename, path: `data/images/${user.username}/${filename}` });
      }
    } catch (err) {
      console.error('Failed to save capture:', err);
      res.status(500).json({ success: false, message: 'Failed to save image.' });
    }
  });

  // GET list of captured images for a user
  app.get('/api/images/:userId', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    let images = [];
    try {
      if (cosEnabled()) {
        images = await listCosImages(user.username);
      } else {
        const userDir = path.join(IMAGES_DIR, user.username);
        const entries = await fs.readdir(userDir);
        images = entries
          .filter((f) => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'))
          .sort((a, b) => b.localeCompare(a));
      }
    } catch (err) {
      console.error('Failed to list images:', err);
      images = [];
    }

    res.json({ success: true, images });
  });

  // GET a specific user image (security-checked)
  // With COS + a public CDN base URL this redirects to COS directly.
  // Otherwise the server proxies the object (works for private buckets too).
  app.get('/api/images/:userId/:filename', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user || !user.username) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    try {
      if (cosEnabled()) {
        if (COS_BASE_URL) {
          const key = cosKey(user.username, req.params.filename);
          const url = await cosUrl(key);
          return res.redirect(302, url);
        }
        const buffer = await getCosImageBuffer(user.username, req.params.filename);
        if (!buffer) {
          res.status(404).json({ success: false, message: 'Image not found.' });
          return;
        }
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(buffer);
      }

      const filePath = await resolveUserImagePath(req.params.userId, req.params.filename);
      if (!filePath) {
        res.status(404).json({ success: false, message: 'Image not found.' });
        return;
      }
      const buffer = await fs.readFile(filePath);
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(buffer);
    } catch (err) {
      console.error('Failed to serve image:', err);
      res.status(404).json({ success: false, message: 'Image not found.' });
    }
  });

  // DELETE a specific user image
  app.delete('/api/images/:userId/:filename', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user || !user.username) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    try {
      if (cosEnabled()) {
        await deleteCosImage(user.username, req.params.filename);
      } else {
        const filePath = await resolveUserImagePath(req.params.userId, req.params.filename);
        if (!filePath) {
          res.status(404).json({ success: false, message: 'Image not found.' });
          return;
        }
        await fs.unlink(filePath);
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to delete image:', err);
      res.status(500).json({ success: false, message: 'Failed to delete image.' });
    }
  });

  // POST analyze a user image with AI
  app.post('/api/analyze-image/:userId', async (req, res) => {
    const { filename, language = 'en' } = req.body;
    if (!filename || typeof filename !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid filename.' });
      return;
    }

    const buffer = await getImageBuffer(req.params.userId, filename);
    if (!buffer) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    if (!openai) {
      res.status(503).json({ success: false, message: 'AI service is not configured.' });
      return;
    }

    try {
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      const languageNames = { en: 'English', zh: 'Chinese', es: 'Spanish' };
      const languageName = languageNames[language] || 'English';

      const response = await openai.chat.completions.create({
        model: 'kimi-k2.6',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              {
                type: 'text',
                text: `Respond in ${languageName}. Identify the food ingredients or items visible in this pantry photo. Keep your answer to 1-2 sentences.`
              }
            ]
          },
          { role: 'assistant', content: '' }
        ],
        stop: [],
        enable_thinking: true
      });

      const result = response.choices?.[0]?.message?.content || '';
      res.json({ success: true, result });
    } catch (err) {
      const message = err?.message || String(err);
      const responseData = err?.response?.data || err?.error;
      console.error('AI analysis failed:', message, responseData || '');
      res.status(500).json({ success: false, message: 'AI analysis failed.' });
    }
  });

  // POST /api/ai-conversation/:userId
  // Multi-turn AI assistant that returns structured JSON for chat and refill detection.
  app.post('/api/ai-conversation/:userId', async (req, res) => {
    const { filename, mode = 'chat', language = 'en', messages = [], kitchenContext } = req.body;

    if (!filename || typeof filename !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid filename.' });
      return;
    }

    const buffer = await getImageBuffer(req.params.userId, filename);
    if (!buffer) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    if (!openai) {
      res.status(503).json({ success: false, message: 'AI service is not configured.' });
      return;
    }

    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const systemPrompt = buildAiSystemPrompt(language, mode, kitchenContext);

    const baseMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || [])
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: m.content }))
    ];

    const makeAttemptMessages = (reminder) => [
      ...baseMessages,
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl } },
          {
            type: 'text',
            text: mode === 'refill'
              ? `Detect all refills and newly added ingredients in this image. Return JSON only.${reminder}`
              : `Respond to my previous message about this image. Return JSON only.${reminder}`
          }
        ]
      },
      { role: 'assistant', content: '' }
    ];

    const MAX_ATTEMPTS = 2;
    let lastRawContent = '';
    let lastParsed = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const reminder = attempt > 1
          ? ' IMPORTANT: your previous response was not valid JSON. Return ONLY a raw JSON object, no markdown code fences, no explanations.'
          : '';

        const response = await openai.chat.completions.create({
          model: 'kimi-k2.6',
          messages: makeAttemptMessages(reminder),
          stop: [],
          enable_thinking: false,
          max_tokens: 1024
        });

        lastRawContent = response.choices?.[0]?.message?.content || '';
        lastParsed = extractJson(lastRawContent);

        if (lastParsed) {
          // Success path: valid JSON extracted.
          const normalized = normalizeAiResponse(lastParsed);
          res.json({ success: true, message: normalized, raw: lastRawContent });
          return;
        }

        console.warn(`AI conversation attempt ${attempt} produced non-JSON output. Raw:`, lastRawContent.slice(0, 200));
      } catch (err) {
        lastError = err;
        const message = err?.message || String(err);
        const responseData = err?.response?.data || err?.error;
        console.error(`AI conversation attempt ${attempt} failed:`, message, responseData || '');
      }
    }

    // If we get here, no attempt returned valid JSON or an API call failed.
    if (lastError) {
      const errMsg = lastError?.message || String(lastError);
      const userMessage = errMsg.toLowerCase().includes('timeout')
        ? 'AI service timed out. Please try again.'
        : `AI service error: ${errMsg}`;
      res.status(503).json({ success: false, message: userMessage });
      return;
    }

    // API succeeded but model never returned valid JSON. Return the raw text so the client can show it instead of a cryptic error.
    res.json({
      success: true,
      message: {
        version: '1.0.0',
        reply: lastRawContent || 'The AI did not return a parseable response. Please try again.',
        requiresConfirmation: false,
        detectedRefills: [],
        detectedIngredients: [],
        actions: []
      },
      raw: lastRawContent
    });
  });

  // POST /api/diet-advice/:userId
  // Generate a short, personalized dietary tip based on the user's pantry.
  app.post('/api/diet-advice/:userId', async (req, res) => {
    const { ingredients = [], language = 'en', focus = 'balanced' } = req.body;

    if (!openai) {
      res.status(503).json({ success: false, message: 'AI service is not configured.' });
      return;
    }

    const languageName = getLanguageName(language);
    const ingredientSummary = Array.isArray(ingredients) && ingredients.length
      ? ingredients.map((i) => {
          const parts = [`${i.name}: ${i.currentQty}/${i.maxQty ?? i.currentQty}${i.unit} (${i.percentage ?? 100}%)`];
          if (i.spoilageRisk) parts.push(`spoilage: ${i.spoilageRisk}`);
          if (typeof i.freshness === 'number') parts.push(`freshness: ${i.freshness}%`);
          return parts.join(', ');
        }).join('\n')
      : 'No ingredients available.';

    let lastErr = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: 'kimi-k2.6',
          messages: [
            {
              role: 'system',
              content: `You are a helpful nutrition assistant. The user wants a short, practical dietary tip based on the ingredients currently in their kitchen. Respond in ${languageName}. Keep it to 1-2 sentences. Be concise and actionable. Each request has a different focus; make sure your tip reflects the focus and uses specific ingredients and their stock/freshness when relevant. Avoid repeating the exact same wording every time.`
            },
            {
              role: 'user',
              content: `Focus for this tip: ${focus}.\n\nHere is what I have in my kitchen:\n${ingredientSummary}\n\nGive me one short dietary tip based on the focus above.`
            }
          ],
          max_tokens: 256
        });

        const advice = response.choices?.[0]?.message?.content?.trim() || '';
        if (advice) {
          res.json({ success: true, advice });
          return;
        }
        lastErr = new Error('Empty advice response.');
      } catch (err) {
        lastErr = err;
        const message = err?.message || String(err);
        const responseData = err?.response?.data || err?.error;
        console.error(`Diet advice generation failed (attempt ${attempt}):`, message, responseData || '');
      }
    }

    res.status(500).json({ success: false, message: 'Diet advice generation failed.' });
  });

  // GET saved conversations for a user
  app.get('/api/conversations/:userId', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId: req.params.userId },
        orderBy: { updatedAt: 'desc' }
      });

      res.json({
        success: true,
        conversations: conversations.map((c) => {
          const excerpt = Array.isArray(c.messages)
            ? c.messages.slice(-2).map((m) => m.content).join(' ').slice(0, 80)
            : '';
          return {
            id: c.conversationId,
            imageFilename: c.imageFilename,
            excerpt,
            updatedAt: c.updatedAt.toISOString()
          };
        })
      });
    } catch (err) {
      console.error('Failed to list conversations:', err);
      res.status(500).json({ success: false, message: 'Failed to list conversations.' });
    }
  });

  // GET a specific saved conversation
  app.get('/api/conversations/:userId/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    if (!isValidConversationId(conversationId)) {
      res.status(400).json({ success: false, message: 'Invalid conversation id.' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        userId_conversationId: {
          userId: req.params.userId,
          conversationId
        }
      }
    });

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    res.json({
      success: true,
      conversation: {
        id: conversation.conversationId,
        imageFilename: conversation.imageFilename,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages
      }
    });
  });

  // POST create or update a saved conversation
  app.post('/api/conversations/:userId/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    if (!isValidConversationId(conversationId)) {
      res.status(400).json({ success: false, message: 'Invalid conversation id.' });
      return;
    }

    const { imageFilename, messages } = req.body;
    if (!imageFilename || !Array.isArray(messages)) {
      res.status(400).json({ success: false, message: 'imageFilename and messages are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    try {
      const conversation = await prisma.conversation.upsert({
        where: {
          userId_conversationId: {
            userId: req.params.userId,
            conversationId
          }
        },
        update: {
          imageFilename,
          messages,
          updatedAt: new Date()
        },
        create: {
          userId: req.params.userId,
          conversationId,
          imageFilename,
          messages
        }
      });

      res.json({
        success: true,
        conversation: {
          id: conversation.conversationId,
          imageFilename: conversation.imageFilename,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
          messages: conversation.messages
        }
      });
    } catch (err) {
      console.error('Failed to save conversation:', err);
      res.status(500).json({ success: false, message: 'Failed to save conversation.' });
    }
  });

  // DELETE a saved conversation
  app.delete('/api/conversations/:userId/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    if (!isValidConversationId(conversationId)) {
      res.status(400).json({ success: false, message: 'Invalid conversation id.' });
      return;
    }

    try {
      await prisma.conversation.delete({
        where: {
          userId_conversationId: {
            userId: req.params.userId,
            conversationId
          }
        }
      });
      res.json({ success: true });
    } catch (err) {
      if (err.code === 'P2025') {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
      } else {
        console.error('Failed to delete conversation:', err);
        res.status(500).json({ success: false, message: 'Failed to delete conversation.' });
      }
    }
  });

  if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Clear-Pantry server running at http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
