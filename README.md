# 🥗 CalorieAI — AI-Powered Nutrition Tracker

A premium, **mobile-first** calorie and protein tracking app with AI meal photo recognition, barcode scanning, food search, and a beautiful Apple-style dark UI. Installable as a PWA.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Meal Photo Analysis** | Take a photo of any meal — Claude AI identifies every food and estimates calories, protein, carbs, and fat |
| 📊 **Barcode Scanner** | Look up any packaged food by barcode using OpenFoodFacts (2M+ products, no API key needed) |
| 🔍 **Food Search** | Search the OpenFoodFacts database with instant results |
| ✏️ **Manual Entry** | Add custom foods with full macro control |
| 📈 **Daily Dashboard** | Animated progress rings, macro cards, per-meal sections |
| 🎯 **Goals** | Set calorie/protein/carb/fat goals; choose from presets or use custom sliders |
| 📅 **History** | Weekly bar/line charts + daily food log with day picker |
| 📱 **PWA** | Install on iPhone or Android home screen like a native app |

---

## 🚀 Quick Start

### 1 — Clone & install dependencies

```bash
git clone <your-repo-url>
cd calorieai
npm install
```

### 2 — Create environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Get a free key at → **https://console.anthropic.com**

> **Note:** The barcode scanner and food search use OpenFoodFacts (free, no key needed). Only the AI photo feature requires an Anthropic key.

### 3 — Run development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser (or on your phone via your local IP).

---

## 📁 Project Structure

```
calorieai/
├── app/
│   ├── api/
│   │   ├── analyze-meal/route.ts   # AI photo analysis (Anthropic Claude)
│   │   ├── scan-barcode/route.ts   # Barcode lookup (OpenFoodFacts)
│   │   └── search-food/route.ts    # Food name search (OpenFoodFacts)
│   ├── globals.css                 # Global styles + Tailwind
│   ├── layout.tsx                  # Root layout with PWA meta tags
│   ├── page.tsx                    # Dashboard (home)
│   ├── scan/page.tsx               # Camera + AI + Barcode page
│   ├── history/page.tsx            # Weekly charts + food log
│   └── goals/page.tsx              # Goal setting with presets & sliders
├── components/
│   ├── AddFoodModal.tsx            # Bottom-sheet for search / manual add
│   ├── BottomNav.tsx               # Persistent tab bar
│   ├── MacroBar.tsx                # Animated macro progress bar
│   ├── ProgressRing.tsx            # SVG animated progress ring
│   ├── PWARegister.tsx             # Service worker registration
│   └── Skeleton.tsx                # Loading skeleton components
├── hooks/
│   └── usePWA.ts                   # PWA registration hook
├── lib/
│   ├── store.ts                    # Zustand global state + localStorage
│   └── utils.ts                    # Helper utilities
├── public/
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service worker (offline cache)
├── .env.example                    # Environment variable template
├── next.config.mjs
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes (for AI photos) | Your Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | No | Production URL (for PWA, optional) |

---

## 📱 Install as PWA (iPhone)

1. Open the app in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — it appears on your home screen like a native app!

**Android:** Chrome will show an "Install app" banner automatically.

---

## 🚢 Deploy to Vercel (Recommended)

### One-click deploy:

1. Push your code to a GitHub repo
2. Go to **https://vercel.com/new**
3. Import your repo
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Click **Deploy** — done in ~60 seconds!

### Manual CLI deploy:

```bash
npm install -g vercel
vercel
# Follow prompts, add ANTHROPIC_API_KEY when asked
```

### Other platforms

The app is a standard Next.js 14 app and runs anywhere Next.js is supported:
- **Railway** — `railway up`
- **Render** — connect GitHub repo, set env vars
- **AWS Amplify** — connect GitHub, auto-detects Next.js
- **Docker** — `docker build -t calorieai . && docker run -p 3000:3000 calorieai`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand + localStorage (persist) |
| AI Vision | Anthropic Claude (claude-opus-4-5) |
| Food Database | OpenFoodFacts API (free, no key) |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | Web App Manifest + Service Worker |
| Dates | date-fns |

---

## 🔧 Customisation

### Change daily goal defaults
Edit `lib/store.ts` → `goals` object:
```ts
goals: {
  calories: 2000,  // kcal
  protein: 150,    // g
  carbs: 250,      // g
  fat: 65,         // g
},
```

### Change AI model
Edit `app/api/analyze-meal/route.ts`:
```ts
model: 'claude-opus-4-5',  // change to claude-haiku-4-5-20251001 for faster/cheaper
```

### Add a database (optional)
The app currently stores everything in the browser's localStorage via Zustand persist. To add a real database:
1. Add `prisma` and a database URL to `.env.local`
2. Replace the Zustand API calls in `app/api/meals/route.ts` with Prisma queries
3. Add NextAuth.js for user authentication

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Camera not working | Use HTTPS (required for camera on mobile). In dev, use `localhost` (exempt) |
| AI analysis fails | Check `ANTHROPIC_API_KEY` is set correctly in `.env.local` |
| Barcode not found | Try a different barcode — OpenFoodFacts has 2M+ but not every product |
| PWA not installing | Must be served over HTTPS in production |
| Data not persisting | Check browser localStorage isn't blocked (private/incognito may clear it) |

---

## 📄 License

MIT — free to use, modify, and deploy.
