# Clear-Pantry

> **Demo Version** — This is an early prototype and demonstration of the Clear-Pantry concept. AI-dependent dashboard widgets are still simulated for the demo account, but photo capture, storage, gallery, and image analysis are now backed by real device and server-side functionality.

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
- **Smart Home Dashboard** — View key stats, ingredient consumption summaries, and AI-generated healthy diet advice. *(Demo account only; placeholder state for other accounts.)*
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
│   ├── users.json              # Mock account database (credentials + per-account kitchen data)
│   └── images/<username>/      # Photos captured or uploaded by each account
├── .env                        # API key for AI image analysis (gitignored)
├── .env.example                # Template for required environment variables
├── index.html                  # App entry point
├── package.json                # Dependencies and scripts
├── server.js                   # Express dev/production server + auth, account & image APIs
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── metadata.json               # App metadata for Google AI Studio
├── src/
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

AI image analysis is skipped gracefully when no `API_KEY` is provided.

### Development

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

The production server serves the built frontend from `dist/` and uses `data/users.json` as the account database.

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
- **Account deletion** also removes the corresponding `data/images/<username>/` folder.

---

## Demo vs. Non-Demo Experience

| Feature | Demo Account | Other Accounts |
|---------|--------------|----------------|
| Home critical reports | Hardcoded mock cards | Real critical items or empty placeholders |
| Dietary advice | Rotating AI advice + plan modal | Placeholder for future AI |
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
- `DELETE /api/account/:userId` — delete an account and its stored images

### Images

- `POST /api/capture/:userId` — save a base64 image to `data/images/<username>/`
- `GET /api/images/:userId` — list the user’s image filenames
- `GET /api/images/:userId/:filename` — serve a stored image
- `DELETE /api/images/:userId/:filename` — delete a stored image

### AI

- `POST /api/analyze-image/:userId` — analyze a stored image with Baidu Qianfan and return a short ingredient summary

---

## Demo Notes

- The Analyze page uses a live `getUserMedia` camera preview. On mobile devices a secure context (HTTPS or localhost) is required.
- AI object detection, capacity estimation, dietary advice, and critical alerts are simulated for the demo account dashboard, but image analysis on the Analyze page is powered by the configured Baidu Qianfan model when an `API_KEY` is present.
- Non-demo accounts see placeholder states for AI-dependent dashboard features while retaining full pantry tracking, photo capture, gallery, and image analysis functionality.
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
