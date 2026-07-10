import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const IMAGES_DIR = path.join(__dirname, 'data', 'images');
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

async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [] };
  }
}

async function writeUsers(data) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

async function findUserById(id) {
  const data = await readUsers();
  return data.users.find((u) => u.id === id);
}

function sanitizeUser(user) {
  // Return user info without the password to the client.
  const { password, ...rest } = user;
  return rest;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function resolveUserImagePath(userId, filename) {
  const user = await findUserById(userId);
  if (!user || !user.username) return null;
  const userDir = path.resolve(path.join(IMAGES_DIR, user.username));
  const filePath = path.resolve(path.join(userDir, path.basename(filename)));
  // Security: ensure the resolved path stays inside the user's own folder.
  if (!filePath.startsWith(userDir + path.sep)) return null;
  return filePath;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // GET all users (for client-side validation fallback)
  app.get('/api/users', async (_req, res) => {
    const data = await readUsers();
    res.json({ users: data.users.map(sanitizeUser) });
  });

  // POST login
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const data = await readUsers();
    const user = data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      res.json({ success: true, user: sanitizeUser(user) });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
  });

  // POST sign-up - creates account with a copy of the demo kitchen
  app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required.' });
      return;
    }

    const data = await readUsers();
    if (data.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      res.status(409).json({ success: false, message: 'Username already exists.' });
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      info: 'Personal kitchen account',
      seenWelcome: false,
      kitchen: {
        ingredients: [],
        refills: [],
        config: {
          darkMode: false,
          language: 'en',
          reportGenerationLogic: 'Prioritize high-protein ingredients and list expiration dates in DD/MM/YYYY format...'
        }
      }
    };

    data.users.push(newUser);
    await writeUsers(data);
    res.json({ success: true, user: sanitizeUser(newUser) });
  });

  // GET account kitchen + welcome state
  app.get('/api/account/:userId', async (req, res) => {
    const data = await readUsers();
    const user = data.users.find((u) => u.id === req.params.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({
      success: true,
      seenWelcome: user.seenWelcome,
      kitchen: deepClone(user.kitchen)
    });
  });

  // DELETE account
  app.delete('/api/account/:userId', async (req, res) => {
    const data = await readUsers();
    const index = data.users.findIndex((u) => u.id === req.params.userId);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const user = data.users[index];

    // Remove account data
    data.users.splice(index, 1);
    await writeUsers(data);

    // Remove the user's captured images
    if (user.username) {
      const userImagesDir = path.join(IMAGES_DIR, user.username);
      try {
        await fs.rm(userImagesDir, { recursive: true, force: true });
        console.log(`Removed user images directory: ${userImagesDir}`);
      } catch (err) {
        console.error('Failed to remove user images:', err);
      }
    }

    res.json({ success: true });
  });

  // POST account kitchen + welcome state
  // NOTE: kitchen updates are ignored for the demo account so it always resets.
  app.post('/api/account/:userId', async (req, res) => {
    const { seenWelcome, kitchen } = req.body;
    const data = await readUsers();
    const index = data.users.findIndex((u) => u.id === req.params.userId);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const user = data.users[index];

    if (typeof seenWelcome === 'boolean') {
      user.seenWelcome = seenWelcome;
    }

    // Demo account: never persist kitchen changes.
    if (user.id !== DEMO_USER_ID && kitchen) {
      user.kitchen = deepClone(kitchen);
    }

    await writeUsers(data);
    res.json({ success: true });
  });

  // POST capture image from camera and save under data/images/:username
  app.post('/api/capture/:userId', async (req, res) => {
    const { image } = req.body;
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      res.status(400).json({ success: false, message: 'Invalid image data.' });
      return;
    }

    const user = await findUserById(req.params.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userDir = path.join(IMAGES_DIR, user.username);
    await fs.mkdir(userDir, { recursive: true });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const filename = `${Date.now()}.jpg`;
    const filePath = path.join(userDir, filename);
    await fs.writeFile(filePath, buffer);

    res.json({
      success: true,
      filename,
      path: `data/images/${user.username}/${filename}`
    });
  });

  // GET list of captured images for a user
  app.get('/api/images/:userId', async (req, res) => {
    const user = await findUserById(req.params.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userDir = path.join(IMAGES_DIR, user.username);
    let images = [];
    try {
      const entries = await fs.readdir(userDir);
      images = entries
        .filter((f) => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'))
        .sort((a, b) => b.localeCompare(a));
    } catch {
      images = [];
    }

    res.json({ success: true, images });
  });

  // GET a specific user image (security-checked)
  app.get('/api/images/:userId/:filename', async (req, res) => {
    const filePath = await resolveUserImagePath(req.params.userId, req.params.filename);
    if (!filePath) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    try {
      const buffer = await fs.readFile(filePath);
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(buffer);
    } catch (err) {
      res.status(404).json({ success: false, message: 'Image not found.' });
    }
  });

  // DELETE a specific user image
  app.delete('/api/images/:userId/:filename', async (req, res) => {
    const filePath = await resolveUserImagePath(req.params.userId, req.params.filename);
    if (!filePath) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    try {
      await fs.unlink(filePath);
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

    const filePath = await resolveUserImagePath(req.params.userId, filename);
    if (!filePath) {
      res.status(404).json({ success: false, message: 'Image not found.' });
      return;
    }

    if (!openai) {
      res.status(503).json({ success: false, message: 'AI service is not configured.' });
      return;
    }

    try {
      const buffer = await fs.readFile(filePath);
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
