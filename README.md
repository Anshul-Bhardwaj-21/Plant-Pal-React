# PlantPal

An AI-powered plant care assistant built with React, TypeScript, and Google Gemini. Identify plants from photos, detect diseases, get personalized care schedules, and track your collection's health over time.

---

## Features

- **AI Plant Identification** — Gemini Vision API with top-3 predictions and confidence scores
- **Disease Detection** — TF.js model (trainable) with Gemini fallback; 15 disease classes
- **Smart Watering Calculator** — Calculates exact ml based on pot size, soil type, weather, and plant height
- **Fertilizer Scheduler** — Personalized NPK recommendations by plant type and age
- **Kitchen Waste Composting Guide** — What to add, what to avoid, and why
- **Multi-Image Age Estimation** — Upload full plant, stem, and leaf photos for AI age analysis
- **Weather Integration** — Real-time conditions + 7-day forecast via OpenWeatherMap; 30-min cache
- **Health Dashboard** — Scores, care history graphs, and activity tracking
- **AI Chatbot** — Context-aware assistant with plant and weather data
- **Gamification** — 7 achievement badges for consistent care
- **Smart Reminders** — Weather-aware watering alerts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Charts | Recharts |
| AI / Vision | Google Gemini API (`@google/generative-ai`) |
| ML (local) | TensorFlow.js (browser inference + Node training) |
| Backend / DB | Firebase Firestore + Storage |
| Weather | OpenWeatherMap API |
| Testing | Vitest, Testing Library |
| Mobile | React Native / Expo (`mobile/`) |

---

## Architecture

```
Browser
  └── React SPA (Vite)
        ├── src/pages/          Route-level components
        ├── src/components/     Reusable UI components
        ├── src/services/       API integrations (Gemini, Firebase, Weather)
        ├── src/hooks/          Custom React hooks
        ├── src/lib/            Firebase config, utilities
        └── src/data/           Static plant database (15 species)

Disease Detection Pipeline
  Training (offline):  scripts/train-model.js  →  public/models/plant-disease/
  Inference (browser): diseaseDetectionService.ts loads model.json
  Fallback:            Gemini Vision API (used until model is trained)

Mobile
  └── mobile/   Expo / React Native app (separate package)

Server
  └── server/   Optional Gemini proxy (Node/Express)
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- A Firebase project (Firestore + Storage enabled)
- Google Gemini API key
- OpenWeatherMap API key

### 1. Clone and install

```bash
git clone <repo-url>
cd Plant-Pal-React
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys. See `.env.example` for all required variables.

> Keys are read via `import.meta.env.VITE_*` at build time. Never commit `.env`.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run dataset:sample` | Generate synthetic training images |
| `npm run train` | Train the disease detection model |

---

## Disease Model Training

The disease detection model is trainable on your own dataset. A sample dataset generator is included for testing the pipeline.

```bash
# 1. Install training dependencies (one time)
npm install jimp --save-dev

# 2. (Optional) Generate synthetic sample data to test the pipeline
npm run dataset:sample

# 3. Train
npm run train
```

**To use real data**, replace the contents of `training-data/<ClassName>/` with actual plant disease images. Folder names must match the class labels in `public/models/plant-disease/classes.json`.

The trained model is saved to `public/models/plant-disease/` and loaded automatically by the app on next run.

> Recommended dataset: [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset) (50k+ labeled images, 38 classes).

---

## Project Structure

```
Plant-Pal-React/
├── public/
│   └── models/plant-disease/   Trained TF.js model (auto-generated)
├── scripts/
│   ├── train-model.js          Model training script (Node)
│   └── generate-sample-dataset.js
├── server/                     Optional Gemini proxy server
├── mobile/                     Expo React Native app
├── src/
│   ├── components/             UI components
│   ├── data/                   Static plant database
│   ├── hooks/                  Custom hooks
│   ├── lib/                    Firebase, utilities
│   ├── pages/                  Route pages
│   ├── services/               External API services
│   ├── test/                   Test setup
│   └── types/                  TypeScript types
├── training-data/              Local training images (gitignored)
├── .env.example                Environment variable template
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_WEATHER_API_KEY` | Yes | OpenWeatherMap API key |

All variables are prefixed `VITE_` and exposed to the browser bundle. Do not store server-only secrets here.

---

## Screenshots

> Screenshots coming soon. Run the app locally to see the full UI.

---

## Roadmap

- [ ] Replace sample training data with real PlantVillage dataset
- [ ] Firebase Authentication (user accounts)
- [ ] Growth timeline with photo history
- [ ] Push notifications for watering reminders
- [ ] Offline support (PWA)
- [ ] Mobile app feature parity with web

---

## License

MIT
