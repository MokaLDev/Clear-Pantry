# Clear-Pantry

> **Demo Version** — This is an early prototype and demonstration of the Clear-Pantry concept. Many features are simulated for presentation purposes and the app is not yet connected to live camera hardware or a production AI backend.

**Clear-Pantry** is a modern, mobile-first kitchen ingredient organizer powered by visual AI. It helps you track what’s in your pantry, monitor depletion levels, and get personalized dietary advice — all through a clean, minimalist interface.

---

## Features

- **AI-Powered Ingredient Analysis** — Point your camera at pantry items to detect ingredients and estimate container capacity. *(Simulated in this demo.)*
- **Smart Home Dashboard** — View key stats, ingredient consumption summaries, and AI-generated healthy diet advice.
- **Consumption Dashboard / Pantry** — Browse detailed inventory levels, review refill history, and log manual restocks.
- **Visual Data Insights** — Track ingredient quantities over time with an interactive line chart.
- **Customizable Settings** — Toggle dark mode, change language, and configure report generation logic to tailor dietary advice.
- **Persistent Demo Data** — Ingredient state, refill logs, and settings are saved to `localStorage` during the session.

---

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Animations:** Motion
- **AI SDK:** `@google/genai` *(included for future integration; current detection is simulated)*
- **Server Runtime:** Express *(prepared for future server-side Gemini API integration)*

---

## Project Structure

```
.
├── index.html              # App entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── metadata.json           # App metadata for Google AI Studio
├── src/
│   ├── App.tsx             # Main app shell, navigation, and state management
│   ├── main.tsx            # React root render
│   ├── index.css           # Global styles
│   ├── types.ts            # TypeScript interfaces
│   ├── data/               # Default ingredients and sample data
│   └── components/
│       ├── WelcomeScreen.tsx   # Login / introduction screen
│       ├── HomeScreen.tsx      # Home dashboard with stats and advice
│       ├── AnalyzeScreen.tsx   # Camera / visual AI screen
│       ├── InventoryScreen.tsx # Pantry, dashboard, and refill logs
│       └── SettingsScreen.tsx  # Settings and preferences
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

The app will be served at `http://localhost:3000`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Demo Notes

- The current camera preview is intentionally blacked out and labeled for future development.
- AI object detection and capacity estimation are simulated for this demo.
- No real user avatar is generated — avatar selection is left for future user customization.
- All ingredient quantities, refills, and settings are stored in the browser's `localStorage` and can be reset from the **Settings** screen.

---

## Future Roadmap

- Connect live mobile camera stream.
- Integrate server-side Gemini AI for real ingredient and container recognition.
- User authentication and cloud-synced pantry data.
- Recipe suggestions based on available ingredients.
- Push notifications for low-stock and expiration alerts.

---

## License

This project is a personal demo and is not currently licensed for public distribution.
