import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const DEMO_USER_ID = 'user-001';

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

async function createServer() {
  const app = express();
  app.use(express.json());

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
          language: 'English (US)',
          reportGenerationLogic: ''
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
