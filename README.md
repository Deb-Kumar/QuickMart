# QuickMart ⚡ — 10-Minute Express Grocery Delivery

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

> **QuickMart** is a hyper-local quick-commerce grocery delivery platform built with modern web technologies. It features express 10-minute order simulation, real-time dark store status updates, an AI-powered culinary assistant (**Chef Quicky**), dynamic dietary meal planning, and hybrid cloud-local data persistence.

---

## 📸 Key Features

### ⚡ Express 10-Minute Dispatch & Order Simulation
- **Dynamic State Tracking:** Orders transition smoothly through live stages (`Confirmed` ➔ `Packing at Dark Store` ➔ `Out for Delivery` ➔ `Delivered`).
- **Simulated Fleet & Courier Details:** Live rider profiling with vehicle assignment, contact options, and arrival time estimation.
- **Celebration Flow:** Real-time checkout confirmation with interactive canvas confetti animations.

### 🤖 Gemini-Powered Culinary Intelligence
- **"Chef Quicky" Concierge:** Integrated with Google Gemini 2.5 Flash via `@google/genai` to suggest recipes, assemble ingredient baskets, and answer cooking queries.
- **1-Click AI Recipe Planner:** Generate complete meals from natural language cravings and instantly bundle all required ingredients into your cart.
- **Smart Substitutions:** Recommends healthier or budget-friendly alternative ingredients directly from product detail modals.
- **Graceful Fallback:** Built-in offline fallback ensures full recommendation functionality even when external API credentials are absent.

### 🛒 High-Performance Commerce Experience
- **Interactive Cart & Drawer:** Quantity adjustments, free delivery threshold progress meter, and multi-tier discount engine (`QUICK20`, `FRESH10`).
- **Dynamic Catalog & Filtering:** 9 curated categories with live stock counters, multi-criteria sorting (Price, Rating, Delivery Speed), and instant text search.
- **Favorites & Saved Items:** Bookmark frequently ordered products with one-tap access.

### 🔐 Hybrid Cloud & Offline-First Persistence
- **Firebase Firestore Synchronization:** Real-time cloud sync for active carts, customer favorites, and order history.
- **Local Storage Continuity:** Automatic offline fallback preserves user baskets and order history without requiring cloud connectivity.
- **Frictionless Authentication:** Automatic anonymous session creation on entry with seamless optional Google One-Tap/Popup sign-in.

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│               Client: React 19 + TypeScript            │
│       Tailwind CSS v4 • Motion • Lucide React          │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       REST / JSON API          Firebase Cloud Sync
                │                        │
┌───────────────▼───────────────┐ ┌──────▼───────────────┐
│     Express 4 + Vite Server   │ │   Firebase Services  │
│  • Catalog & Orders API       │ │  • Cloud Firestore   │
│  • Google Gemini 2.5 SDK      │ │  • Google Auth       │
│  • Vite SPA Middleware        │ │                      │
└───────────────────────────────┘ └──────────────────────┘
```

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19**, **TypeScript** | Component-driven architecture, type safety |
| **Styling & Motion** | **Tailwind CSS v4**, **Motion** | Fluid responsive layouts, transitions, animations |
| **Icons & Media** | **Lucide React**, **Canvas Confetti** | Streamlined SVG icon library & celebratory visual cues |
| **Backend & Server** | **Express 4**, **tsx**, **esbuild** | Unified REST endpoints + integrated Vite middleware |
| **Artificial Intelligence** | **Google Gen AI SDK** | Gemini 3.6 Flash (`gemini-3.6-flash`) via `@google/genai` |
| **Cloud Database & Auth** | **Firebase Firestore & Auth** | Real-time listeners and token-based Google authentication |
| **Build & Bundling** | **Vite 6** | High-speed HMR, Rollup production optimization |

---

## 📂 Project Structure

```text
QuickMart/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD workflow
├── dist/                         # Production build artifacts (client + server.cjs)
├── public/                       # Static public assets (404.html, icons)
├── src/
│   ├── components/               # Reusable React UI components
│   │   ├── AIAssistantDrawer.tsx # Gemini AI Chef Quicky side drawer
│   │   ├── AddressModal.tsx      # Delivery location selector
│   │   ├── AuthModal.tsx         # Google sign-in and account profile modal
│   │   ├── CartSidebar.tsx       # Slide-out basket with promo code engine
│   │   ├── CategoryBar.tsx       # Category navigation bar
│   │   ├── CheckoutModal.tsx     # Payment selection & order submission
│   │   ├── ErrorBoundary.tsx     # Graceful UI exception boundary
│   │   ├── HeroSection.tsx       # Promotional banners and coupon codes
│   │   ├── LiveOrderTrackerModal.tsx # Live delivery state machine visualizer
│   │   ├── MealPlannerModal.tsx  # Natural language AI recipe-to-cart planner
│   │   ├── Navbar.tsx            # Sticky header with search, address & cart badge
│   │   ├── OrderHistoryModal.tsx # Past orders review & reordering
│   │   ├── ProductCard.tsx       # Interactive product item card
│   │   └── ProductModal.tsx      # Nutritional facts, origins & smart swaps
│   ├── lib/
│   │   └── firebase.ts           # Firebase SDK initialization & Firestore helpers
│   ├── App.tsx                   # Main application container & state manager
│   ├── data.ts                   # Comprehensive catalog inventory & promo codes
│   ├── index.css                 # Global Tailwind CSS imports
│   ├── main.tsx                  # React DOM root entry point
│   └── types.ts                  # Core TypeScript domain models & interfaces
├── .env.example                  # Environment variable blueprint
├── package.json                  # Dependencies & execution scripts
├── server.ts                     # Express server & Gemini API integration
├── tsconfig.json                 # TypeScript compiler configuration
├── vercel.json                   # Vercel Single-Page-App rewrite rules
└── vite.config.ts                # Vite build and development configuration
```

---

## ⚙️ Environment Variables

QuickMart uses standard environment variables for configuration. A template is provided in `.env.example`:

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Configure your credentials:
   ```env
   # Gemini AI Configuration (Server-Side)
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   APP_URL="http://localhost:3000"

   # Firebase Client Configuration (Vite)
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
   VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
   VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

*(Note: If `GEMINI_API_KEY` is omitted, the app automatically switches to built-in culinary mock data without breaking any user flows).*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20` or newer
- **npm**: `v10` or newer

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run Development Server
Start the Express server with live Vite development middleware:
```bash
npm run dev
```
The application will launch on:
- **Local:** [http://localhost:3000](http://localhost:3000)
- **Network:** `http://0.0.0.0:3000`

### 3. Type Checking & Verification
Execute TypeScript validation:
```bash
npm run lint
```

### 4. Build for Production
Bundle both the frontend SPA and the backend server:
```bash
npm run build
```
This generates the optimized web bundle in `dist/` and compiles the production server script to `dist/server.cjs`.

### 5. Run Production Server
```bash
npm start
```

---

## 📡 API Reference

The backend exposes the following RESTful endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and current server timestamp |
| `GET` | `/api/categories` | Returns all product categories with real-time item counts |
| `GET` | `/api/products` | Query catalog with optional `category`, `search`, and `sort` parameters |
| `POST` | `/api/orders` | Place a new simulated order with cart items and address |
| `GET` | `/api/orders` | Retrieve simulated orders with dynamic elapsed delivery status |
| `POST` | `/api/ai/assistant` | Conversational Gemini AI chef assistance with cart-aware suggestions |
| `POST` | `/api/ai/meal-planner` | AI recipe generator returning bundled catalog products |
| `POST` | `/api/ai/substitute` | Suggests healthy or cost-effective ingredient alternatives |

---

## 🌐 Deployment

### Vercel / Netlify (Static Frontend)
- Deploy directly from GitHub using the root directory.
- Build command: `npm run build`
- Output directory: `dist`
- Configured with `vercel.json` for SPA URL rewrites.

### GitHub Pages
- A fully automated GitHub Actions workflow is provided in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
- Simply push to `main` or `master` to deploy to GitHub Pages.

### Container / Cloud Run / Render / Railway (Full-Stack)
- Set environment variables (`GEMINI_API_KEY`, etc.) in your hosting provider's dashboard.
- Start command: `npm start` (runs `node dist/server.cjs` on port `3000`).

---

## 📄 License

This project is licensed under the MIT License.
