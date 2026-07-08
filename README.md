# Clear-Pantry

> **Demo Version** — This is an early prototype and demonstration of the Clear-Pantry concept. Many features are simulated for presentation purposes and the app is not yet connected to live camera hardware or a production AI backend.

**Clear-Pantry** is a modern, mobile-first kitchen ingredient organizer powered by visual AI. It helps you track what’s in your pantry, monitor depletion levels, and get personalized dietary advice — all through a clean, minimalist interface.

---

## Features

- **User Authentication** — Sign up and log in with a username and password. Accounts are stored in `data/users.json`.
- **Per-Account Pantry Data** — Each account has its own ingredients, refill logs, and settings. New accounts start empty.
- **Demo Account** — A pre-loaded `demo` account showcases the app with sample data and simulated AI content. Demo data resets on every login.
- **AI-Powered Ingredient Analysis** — Point your camera at pantry items to detect ingredients and estimate container capacity. *(Simulated in this demo; only enabled for the demo account.)*
- **Smart Home Dashboard** — View key stats, ingredient consumption summaries, and AI-generated healthy diet advice. *(Demo account only; placeholder state for other accounts.)*
- **Consumption Dashboard / Pantry** — Browse detailed inventory levels, review refill history, and log manual restocks.
- **Visual Data Insights** — Track ingredient quantities over time with an interactive line chart based on live pantry data.
- **Customizable Settings** — Toggle dark mode, change language, configure report generation logic, and manage your account from the personal center.

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Animations:** Motion
- **AI SDK:** `@google/genai` *(included for future integration; current detection is simulated)*
- **Server:** Express + Vite middleware (`server.js`) serves both the API and the SPA

---

## Project Structure

```
.
├── data/
│   └── users.json          # Mock account database (credentials + per-account kitchen data)
├── index.html              # App entry point
├── package.json            # Dependencies and scripts
├── server.js               # Express dev/production server + auth & account APIs
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── metadata.json           # App metadata for Google AI Studio
├── src/
│   ├── App.tsx             # Main app shell, navigation, auth gating, and state management
│   ├── main.tsx            # React root render
│   ├── index.css           # Global styles
│   ├── types.ts            # TypeScript interfaces
│   ├── data/               # Default ingredients and sample data
│   └── components/
│       ├── LoginScreen.tsx     # Sign up / log in screen
│       ├── WelcomeScreen.tsx   # Onboarding screen (shown once after sign-up)
│       ├── HomeScreen.tsx      # Home dashboard with stats and advice
│       ├── AnalyzeScreen.tsx   # Camera / visual AI screen
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

### Development

```bash
npm run dev
```

This starts the Express server with Vite middleware at `http://localhost:3000`. The server also exposes the API endpoints used by the authentication and account systems.

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

---

## Demo vs. Non-Demo Experience

| Feature | Demo Account | Other Accounts |
|---------|--------------|----------------|
| Home critical reports | Hardcoded mock cards | Real critical items or empty placeholders |
| Dietary advice | Rotating AI advice + plan modal | Placeholder for future AI |
| Consumption trends | Hardcoded bar graph | Empty placeholder or live data |
| Analyze camera | Simulated labels & scenarios | Shoot button only; no fake labels |
| Pantry depletion graph | Hardcoded trend lines | Derived from actual ingredient data |
| Data persistence | Resets on login | Persists across sessions |

---

## API Endpoints

The Express server in `server.js` exposes:

- `GET /api/users` — list all accounts (passwords omitted)
- `POST /api/login` — authenticate and return user info
- `POST /api/signup` — create a new account
- `GET /api/account/:userId` — fetch kitchen data and welcome state
- `POST /api/account/:userId` — save kitchen data and/or welcome state (ignored for demo)

---

## Demo Notes

- The current camera preview is intentionally blacked out and labeled for future development.
- AI object detection, capacity estimation, dietary advice, and critical alerts are simulated for the demo account.
- Non-demo accounts see placeholder states for AI-dependent features while retaining full pantry tracking functionality.
- Account credentials are stored in plain text in `data/users.json` for this local demo. A production app must use password hashing and a real database.

---

## Future Roadmap

- Connect live mobile camera stream.
- Integrate server-side Gemini AI for real ingredient and container recognition.
- Cloud-synced pantry data with robust user authentication.
- Recipe suggestions based on available ingredients.
- Push notifications for low-stock and expiration alerts.

---

## License

This project is a personal demo and is not currently licensed for public distribution.
