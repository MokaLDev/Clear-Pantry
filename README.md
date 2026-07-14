# Clear-Pantry

> **Demo Version** — This is an early prototype and demonstration of the Clear-Pantry concept. Photo capture, storage, gallery, AI image analysis, AI conversation, AI refill detection, and AI dietary advice are backed by real device and server-side functionality. Dashboard critical reports are intentionally emptied for non-demo accounts (no statistic-based alarms); the demo account still shows curated example cards.

**Clear-Pantry** is a modern, mobile-first kitchen ingredient organizer powered by visual AI. It helps you track what’s in your pantry, monitor depletion levels, and get personalized dietary advice — all through a clean, minimalist interface.

---

## Features

- **User Authentication** — Sign up and log in with a username and password. Accounts are stored in `data/users.json`.
- **Per-Account Pantry Data** — Each account has its own ingredients, refill logs, and settings. New accounts start empty.
- **Demo Account** — A pre-loaded `demo` account showcases the app with sample data and simulated AI content. Demo data resets on every login.
- **Real Camera Preview** — Analyze page streams your device camera with front/back camera switching and live capture.
- **Photo Capture & Storage** — Capture or upload photos; images are saved per-account under `data/images/<username>/`.
- **Photo Gallery** — Browse captured photos with a latest-image preview, grid view, and full-screen detail view.
  - Swipe left/right in detail view to move between photos.
  - Tap a grid photo to open the detail view.
  - Single-photo delete in detail view; multi-select delete in grid view.
- **AI-Powered Image Analysis** — Send any pantry photo to a real vision model (Baidu Qianfan `kimi-k2.6` via the OpenAI-compatible API) and receive a short ingredient summary in the user’s selected language.
- **Extended AI Conversation** — Open a foldable chat drawer on any gallery photo to ask follow-up questions, save the conversation, and continue later.
- **AI Refill Detection** — Tap **Detect Refill** to let the AI scan the photo for newly added ingredients or refills. The confirmation modal lets you choose whether a detection should add to an existing container or create a new one, and optionally enforce a capacity threshold.
- **Structured AI Responses** — AI conversation and refill detection use a JSON schema (`v1.0.0`) for reliable `reply`, `detectedRefills`, `detectedIngredients`, and `actions` fields.
- **Smart Home Dashboard** — View key stats, ingredient consumption summaries, and an AI-generated dietary advice card with a **Regenerate** button. The advice is generated from the current pantry using Baidu Qianfan.
- **Container Management** — Edit ingredient containers directly from the Home screen: swipe to delete, open a full-screen editor to rename, adjust quantity/capacity/unit, toggle capacity thresholds, set category, freshness, and spoilage risk.
- **Consumption Dashboard / Pantry** — Browse detailed inventory levels, review refill history, and log manual restocks.
- **Visual Data Insights** — Track ingredient quantities over time with an interactive line chart based on live pantry data.
- **Multi-Language Support** — Switch between English, Chinese, and Spanish in Settings.
- **Polished UI** — Dark mode with smooth transitions, swipe-to-delete gestures, animated navigation tabs, and fluid gallery interactions.
- **Customizable Settings** — Toggle dark mode, change language, configure report generation logic, and manage your account from the personal center.

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Animations:** Motion
- **AI SDK:** `openai` (OpenAI-compatible client for Baidu Qianfan)
- **Server:** Express + Vite middleware (`server.js`) serves both the API and the SPA

---

## Project Structure

```
.
├── data/
│   ├── users.json              # Legacy mock account database (kept as a backup; no longer used)
│   ├── images/<username>/      # Photos captured or uploaded by each account
│   └── conversations/<username>/ # Legacy saved AI conversations folder (no longer used)
├── prisma/
│   ├── schema.prisma           # Prisma schema for PostgreSQL
│   └── seed.js                 # Seed script for default demo/chef accounts
├── scripts/
│   └── migrate-json-to-db.js   # One-off import from data/users.json
├── .env                        # API key and database URL (gitignored)
├── .env.example                # Template for required environment variables
├── docker-compose.yml          # Docker Compose setup for local PostgreSQL
├── index.html                  # App entry point
├── package.json                # Dependencies and scripts
├── server.js                   # Express dev/production server + auth, account & image APIs
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── metadata.json               # App metadata for Google AI Studio
├── src/
│   ├── lib/
│   │   └── prisma.js           # Prisma client singleton
│   ├── App.tsx                 # Main app shell, navigation, auth gating, and state management
│   ├── main.tsx                # React root render
│   ├── index.css               # Global styles
│   ├── types.ts                # TypeScript interfaces
│   ├── i18n/
│   │   └── translations.ts     # EN / ZH / ES translations
│   ├── data/                   # Default ingredients and sample data
│   └── components/
│       ├── LoginScreen.tsx     # Sign up / log in screen
│       ├── WelcomeScreen.tsx   # Onboarding screen (shown once after sign-up)
│       ├── HomeScreen.tsx      # Home dashboard with stats and advice
│       ├── AnalyzeScreen.tsx   # Camera, gallery, upload, and AI analysis screen
│       ├── InventoryScreen.tsx # Pantry, dashboard, and refill logs
│       └── SettingsScreen.tsx  # Settings, personal center, and logout
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm
- PostgreSQL 14+ (self-hosted; see Database Setup below)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and add your Baidu Qianfan credentials:

```bash
cp .env.example .env
```

Example:

```
API_KEY=your_qianfan_api_key
APP_ID=your_qianfan_app_id   # optional
```

AI image analysis and AI dietary advice fall back gracefully when no `API_KEY` is provided.

### Database Setup

This app uses a self-hosted PostgreSQL database. Choose one of the following options:

**Option A: Docker (recommended if Docker is installed)**

```bash
npm run db:start
```

This starts a Postgres container named `clearpantry-postgres` on port `5432` with a persistent volume.

**Option B: Postgres.app (macOS without Docker)**

1. Download and install [Postgres.app](https://postgresapp.com).
2. Open Postgres.app and create a new database named `clearpantry`.
3. Create a user matching the `DATABASE_URL` in `.env` (default: `clearpantry` / `clearpantry`).

**Option C: Existing Postgres server**

Update `DATABASE_URL` in `.env` to point to your server:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/clearpantry?schema=public
```

**Initialize the database**

Once Postgres is running, apply the schema and seed the default accounts:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

To import any existing users from the old `data/users.json` file:

```bash
npm run db:migrate-json
```

### Development

Make sure Postgres is running and the database is initialized, then start the app:

```bash
npm run dev
```

This starts the Express server with Vite middleware at `http://localhost:3000`. The server also exposes the API endpoints used by authentication, accounts, images, and AI analysis.

### Build

```bash
npm run build
```

### Production / Preview

```bash
npm run build
NODE_ENV=production node server.js
```

The production server serves the built frontend from `dist/` and connects to the PostgreSQL database defined in `DATABASE_URL`.

### Lint

```bash
npm run lint
```

---

## Authentication & Accounts

Accounts are stored in `data/users.json`. Each user object includes:

```json
{
  "id": "user-001",
  "username": "demo",
  "password": "demo123",
  "info": "Demo household account",
  "seenWelcome": true,
  "kitchen": {
    "ingredients": [],
    "refills": [],
    "config": {}
  }
}
```

### Default accounts

| Username | Password | Description |
|----------|----------|-------------|
| `demo`   | `demo123` | Pre-loaded demo account with sample data and simulated AI content. |
| `chef`   | `kitchen` | Regular account starting with the same example data; changes persist. |

### Behavior

- **New sign-ups** start with an empty kitchen (`ingredients: []`, `refills: []`).
- **Non-demo accounts** persist ingredient, refill, and config changes to `data/users.json`.
- **Demo account** (`demo`) always reloads its canonical sample data on login; session changes are not persisted.
- The **welcome screen** appears only once, immediately after a new account is created.
- **Account deletion** removes the user and all related database rows (kitchen, ingredients, refills, conversations), plus the `data/images/<username>/` folder.

---

## Demo vs. Non-Demo Experience

| Feature | Demo Account | Other Accounts |
|---------|--------------|----------------|
| Home critical reports | Hardcoded mock cards | Real critical items or empty placeholders |
| Dietary advice | AI-generated from pantry with regenerate | AI-generated from pantry with regenerate |
| Consumption trends | Hardcoded bar graph | Empty placeholder or live data |
| Analyze camera | Live camera preview + capture + AI analysis | Live camera preview + capture + AI analysis |
| Photo gallery | Full gallery with swipe navigation | Full gallery with swipe navigation |
| AI image analysis | Real analysis when `API_KEY` is set | Real analysis when `API_KEY` is set |
| Pantry depletion graph | Hardcoded trend lines | Derived from actual ingredient data |
| Data persistence | Resets on login | Persists across sessions |

---

## API Endpoints

The Express server in `server.js` exposes:

### Accounts

- `GET /api/users` — list all accounts (passwords omitted)
- `POST /api/login` — authenticate and return user info
- `POST /api/signup` — create a new account
- `GET /api/account/:userId` — fetch kitchen data and welcome state
- `POST /api/account/:userId` — save kitchen data and/or welcome state (ignored for demo)
- `DELETE /api/account/:userId` — delete an account, its database rows (cascading), and its stored images

### Images

- `POST /api/capture/:userId` — save a base64 image to `data/images/<username>/`
- `GET /api/images/:userId` — list the user’s image filenames
- `GET /api/images/:userId/:filename` — serve a stored image
- `DELETE /api/images/:userId/:filename` — delete a stored image

### AI

- `POST /api/analyze-image/:userId` — analyze a stored image with Baidu Qianfan and return a short ingredient summary
- `POST /api/ai-conversation/:userId` — multi-turn AI assistant that returns structured JSON (`reply`, `detectedRefills`, `detectedIngredients`, etc.)
- `POST /api/diet-advice/:userId` — generate a short, personalized dietary tip from the current pantry

### Conversations

- `GET /api/conversations/:userId` — list saved AI conversations for a user
- `GET /api/conversations/:userId/:conversationId` — load a saved conversation
- `POST /api/conversations/:userId/:conversationId` — save or overwrite a conversation
- `DELETE /api/conversations/:userId/:conversationId` — delete a saved conversation

---

## Demo Notes

- The Analyze page uses a live `getUserMedia` camera preview. On mobile devices a secure context (HTTPS or localhost) is required.
- Dashboard critical reports and consumption trends are curated for the demo account; non-demo accounts see empty placeholder states for these statistic-based features.
- AI image analysis, AI conversation, AI refill detection, and AI dietary advice are powered by the configured Baidu Qianfan model when an `API_KEY` is present.
- Saved AI conversations are stored under `data/conversations/<username>/` and are removed when the account is deleted.
- Non-demo accounts see placeholder states for critical reports and consumption trends, but receive real AI-generated dietary advice plus full pantry tracking, photo capture, gallery, AI conversation, and AI analysis functionality.
- Account credentials are stored in plain text in `data/users.json` for this local demo. A production app must use password hashing and a real database.

---

## Future Roadmap

- Cloud-synced pantry data with robust user authentication.
- Recipe suggestions based on available ingredients.
- Push notifications for low-stock and expiration alerts.
- Barcode / QR scanning for faster item entry.
- Multi-device image sync and backup.

---

## License

This project is a personal demo and is not currently licensed for public distribution.
