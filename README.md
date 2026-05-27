<div align="center">

<br/>

# 🌸 WeCare

### *An AI-Powered Mental Health Companion*

**Real-time mood analysis · CBT-driven insights · Crisis detection · Sonic therapy**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://we-care-one-navy.vercel.app/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

[**🔴 Live Demo**](https://we-care-one-navy.vercel.app/) · [**📖 Docs**](docs/) · [**🐛 Report Bug**](https://github.com/gopalkaushik03/WeCare/issues) · [**✨ Request Feature**](https://github.com/gopalkaushik03/WeCare/issues)

<br/>

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#-environment-variables)
  - [Running Locally](#-running-locally)
- [API Reference](#-api-reference)
- [Database Schema](#️-database-schema)
- [Deployment](#️-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About the Project

**WeCare** is an AI-assisted mental health awareness and self-reflection platform. It functions as an interactive digital sanctuary — bridging the gap between passive journaling and active therapy.

Using **Google Gemini 2.5 Flash** and structured **Cognitive Behavioral Therapy (CBT)** frameworks, WeCare reads, analyzes, and reframes user inputs into actionable emotional insights. It tracks moods over time, detects crisis signals instantly, and wraps it all in a beautifully crafted glassmorphic UI.

> *Built for emotional honesty. Designed for calm. Powered by empathy.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Real-time Mood Analysis** | AI emotional intelligence via Gemini with structured CBT response frameworks |
| 🧠 **Cognitive Load Engine** | Evaluates implicit distress signals (typing speed, backspaces) for richer AI context |
| 📊 **Mood Tracking & Visualization** | GitHub-style streak heatmaps and emotional trajectory line charts |
| 🚨 **Crisis Intervention** | Regex-layer crisis detection that bypasses the LLM for instant hotline resources |
| 🎧 **Sonic Therapy** | Spotify playlists dynamically matched to your emotional state |
| 🪴 **Zen Garden** | Gamified digital plant that evolves with your consistency and streak |
| 🧘 **Focus Timer** | Pomodoro timer overlaid with a real-time breathing visualizer |
| 🗑️ **Thought Shredder** | Interactive Cognitive Defusion tool for temporary rumination relief |
| 🎨 **Premium UI/UX** | Glassmorphic, 3D-integrated design with Three.js particle backgrounds |
| 💬 **Command Palette** | Keyboard-first `⌘K` navigation across all app sections |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | Full-stack React framework with App Router |
| [React 18](https://react.dev/) | Component model with concurrent features |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling with custom design tokens |
| [Framer Motion](https://www.framer.com/motion/) | Declarative animations and page transitions |
| [Three.js / React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 3D particle backgrounds and interactive scenes |
| [Recharts](https://recharts.org/) | Mood trend and trajectory data charts |
| [GSAP](https://gsap.com/) | Advanced scroll-triggered animations |
| [Lenis](https://lenis.darkroom.engineering/) | Smooth scroll engine |
| [cmdk](https://cmdk.paco.me/) | Command palette (⌘K) component |
| [Lucide React](https://lucide.dev/) | Consistent icon system |

### Backend
| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | High-performance async Python web framework |
| [Google Gemini API](https://ai.google.dev/) | Core AI model (`gemini-2.5-flash`) |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud-hosted document database |
| [Motor](https://motor.readthedocs.io/) | Async MongoDB driver for Python |
| [Pydantic v2](https://docs.pydantic.dev/) | Data validation and settings management |
| [PyJWT + Passlib](https://pyjwt.readthedocs.io/) | JWT auth and password hashing (bcrypt) |
| [SlowAPI](https://github.com/laurentS/slowapi) | Rate limiting middleware |
| [Uvicorn](https://www.uvicorn.org/) | ASGI production server |

---

## 🏗️ Architecture

WeCare uses a **decoupled service architecture** — a stateless Next.js frontend talks to a dedicated FastAPI backend, which owns the AI and database layers.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (User)                      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌────────────────────────────────────────────────────────┐
│           Next.js Frontend  (Vercel)                    │
│  App Router · Framer Motion · Three.js · Recharts       │
└────────────────────────┬───────────────────────────────┘
                         │ REST  /api/v1
                         ▼
┌────────────────────────────────────────────────────────┐
│           FastAPI Backend  (Render)                     │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐  ┌──────────────┐  │
│  │   Routes    │──▶│   Services   │─▶│  Pydantic    │  │
│  │  auth       │   │ gemini_client│  │  Models      │  │
│  │  analyze    │   │ auth_service │  └──────────────┘  │
│  │  entries    │   └──────────────┘                     │
│  │  trajectory │                                         │
│  └─────────────┘                                         │
└──────────┬───────────────────┬─────────────────────────┘
           │ motor async        │ google-genai SDK
           ▼                    ▼
┌──────────────────┐  ┌───────────────────────┐
│  MongoDB Atlas   │  │  Google Gemini 2.5    │
│  (mood_entries,  │  │  Flash API             │
│   analysis_logs) │  └───────────────────────┘
└──────────────────┘
```

### Request Lifecycle

```
User types mood + journal
        │
        ▼
[Frontend] calculates Cognitive Load Score
        │
        ▼
POST /api/v1/analyze
        │
        ▼
[Backend] Regex Crisis Check ──────► (if match) return hotline instantly
        │
        ▼
[Backend] Fetch last 5 entries from MongoDB (longitudinal context)
        │
        ▼
[Gemini 2.5 Flash] structured JSON response (Summary · Insight · CBT Reframe · Action)
        │
        ▼
POST /api/v1/entries  →  persist to MongoDB
        │
        ▼
[Frontend] renders AI response into UI cards
```

---

## 📁 Folder Structure

```
WeCare/
│
├── 📂 app/                          # Next.js App Router (pages & layouts)
│   ├── 📂 analysis/                 # Analysis results page
│   ├── 📂 api/                      # Next.js API route handlers
│   │   └── 📂 analyze/              # Proxy route for Gemini calls
│   ├── 📂 dashboard/                # User dashboard (heatmap, trajectory)
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── 📂 login/                    # Login page
│   ├── 📂 mood/                     # Mood entry page
│   ├── 📂 signup/                   # Signup page
│   ├── globals.css                  # Global styles & design tokens
│   ├── layout.jsx                   # Root layout (Navbar, fonts, providers)
│   ├── loading.jsx                  # Global loading UI
│   ├── page.jsx                     # Landing / home page
│   └── template.jsx                 # Page transition wrapper
│
├── 📂 backend/                      # FastAPI Python backend
│   ├── 📂 prompts/                  # Gemini prompt templates
│   ├── 📂 routes/                   # API route handlers
│   │   ├── analyze.py               # POST /analyze  (AI processing)
│   │   ├── auth.py                  # POST /login, /signup
│   │   ├── entries.py               # CRUD /entries + /streak
│   │   └── trajectory.py            # GET /me/trajectory
│   ├── 📂 services/                 # Business logic layer
│   │   ├── gemini_client.py         # Gemini API integration + crisis detection
│   │   └── auth_service.py          # JWT creation & verification
│   ├── 📂 utils/                    # Shared helpers
│   ├── 📂 tests/                    # Backend test suite
│   ├── db.py                        # MongoDB connection + collection helpers
│   ├── main.py                      # FastAPI app factory, CORS, routers
│   ├── models.py                    # Pydantic request/response models
│   ├── requirements.txt             # Production Python dependencies
│   ├── requirements-dev.txt         # Dev-only dependencies
│   └── .env.example                 # Environment variable template
│
├── 📂 components/                   # Reusable React components
│   ├── 📂 deprecated/               # Old components (kept for reference)
│   ├── AnimatedInput.jsx            # Animated form input
│   ├── AuroraBackground.jsx         # Aurora gradient effect
│   ├── BentoGrid.jsx                # Bento layout grid
│   ├── BreathingOrb.jsx             # Focus timer breathing visual
│   ├── CanvasParticles.jsx          # WebGL particle background
│   ├── CommandPalette.jsx           # ⌘K global command palette
│   ├── ConsistencyHeatmap.jsx       # GitHub-style streak heatmap
│   ├── EmotionalCore.jsx            # Core mood visualization
│   ├── Experience.jsx               # Three.js scene experience
│   ├── FocusTimer.jsx               # Pomodoro / focus timer
│   ├── Footer.jsx                   # Site footer
│   ├── GlobalPlayer.jsx             # Persistent audio player state
│   ├── InfiniteMarquee.jsx          # Scrolling text marquee
│   ├── MoodCard.jsx                 # Mood display card
│   ├── MoodMusicPlayer.jsx          # Emotion-matched Spotify player
│   ├── MoodTrendChart.jsx           # Recharts trend visualization
│   ├── MotionCard.jsx               # Framer Motion card wrapper
│   ├── Navbar.jsx                   # Top navigation bar
│   ├── ParallaxBackground.jsx       # Scroll parallax wrapper
│   ├── ProfessionalSupport.jsx      # Therapist resource directory
│   ├── Scene.jsx                    # R3F scene root
│   ├── SceneErrorBoundary.jsx       # WebGL error boundary
│   ├── SOSButton.jsx                # Crisis SOS button + modal
│   ├── SafetyDisclaimer.jsx         # Legal / safety disclaimer
│   ├── SonicTherapy.jsx             # Sonic therapy section
│   ├── SpotlightCard.jsx            # Mouse-tracking spotlight card
│   ├── StaggeredText.jsx            # Staggered text animation
│   ├── ThemeSwitcher.jsx            # Dark/light mode toggle
│   ├── TiltCard.jsx                 # 3D tilt interaction card
│   ├── TrajectoryWidget.jsx         # Mini trajectory dashboard widget
│   ├── VideoSection.jsx             # Embedded motivational video
│   ├── WeeklyInsight.jsx            # Weekly AI summary widget
│   └── Widgets.jsx                  # Dashboard widget collection
│
├── 📂 context/                      # React Context providers
│   ├── MoodContext.jsx              # Global mood state
│   └── UserContext.jsx              # Auth / user session state
│
├── 📂 lib/                          # Shared frontend utilities & data
│   ├── api.js                       # Typed API client (axios/fetch wrappers)
│   ├── apiConfig.js                 # Base URL configuration
│   ├── data.js                      # Static seed/mock data
│   ├── mongodb.js                   # MongoDB client (Next.js API routes)
│   ├── motion.js                    # Shared Framer Motion variants
│   ├── motivationalVideos.js        # Curated video content list
│   ├── professionalSupport.js       # Therapist directory data
│   ├── utils.js                     # General utility functions
│   └── visualEngine.js             # Canvas/visual helper functions
│
├── 📂 docs/                         # Project documentation
│   └── deployment_rules.md          # Deployment constraints & rules
│
├── .env.example                     # Root environment variable template
├── .gitignore                       # Git ignore rules
├── jsconfig.json                    # JS path aliases
├── next.config.js                   # Next.js configuration
├── package.json                     # Frontend dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS configuration
└── README.md                        # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** `>= 18.x` and **npm**
- **[Python](https://www.python.org/)** `>= 3.9`
- A **[Google Gemini API Key](https://aistudio.google.com/app/apikey)** (free tier available)
- A **[MongoDB Atlas](https://www.mongodb.com/atlas)** cluster (free M0 tier works)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/gopalkaushik03/WeCare.git
cd WeCare
```

**2. Install frontend dependencies**

```bash
npm install
```

**3. Set up the Python backend**

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 🔐 Environment Variables

Create two `.env` files from the provided templates:

**Root (`.env.local`) — Next.js frontend:**

```bash
cp .env.example .env.local
```

```ini
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Backend (`backend/.env`) — FastAPI:**

```bash
cp backend/.env.example backend/.env
```

```ini
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<db_user>:<uri_encoded_password>@<cluster>.mongodb.net/?appName=WeCare
MONGODB_DB=wecare

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never commit your real `.env` or `.env.local` files.** They are already listed in `.gitignore`.

---

### 💻 Running Locally

Open **two terminal windows:**

**Terminal 1 — Frontend (Next.js)**

```bash
# From project root
npm run dev
```

➜ App available at **http://localhost:3000**

**Terminal 2 — Backend (FastAPI)**

```bash
# From /backend with venv activated
uvicorn main:app --reload --port 8000
```

➜ API available at **http://localhost:8000**  
➜ Interactive Swagger docs at **http://localhost:8000/docs**

---

## 🔌 API Reference

All endpoints are served under the `/api/v1` prefix.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/signup` | Register a new user | ❌ |
| `POST` | `/auth/login` | Login and receive JWT | ❌ |
| `POST` | `/analyze` | Run Gemini AI analysis on mood + journal | ✅ |
| `POST` | `/entries` | Persist an entry (with AI result) to MongoDB | ✅ |
| `GET` | `/entries` | Fetch recent historical entries | ✅ |
| `GET` | `/entries/streak` | Get current interaction streak count | ✅ |
| `GET` | `/me/trajectory` | Return data for linear regression chart | ✅ |

---

## 🗄️ Database Schema

WeCare uses **MongoDB Atlas** with the `motor` async driver and **Pydantic v2** models for strict validation.

### Collections

#### `mood_entries`
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "created_at": "ISODate",
  "mood_score": "int (1–10)",
  "journal_text": "string",
  "cognitive_load_score": "float",
  "ai_response": {
    "summary": "string",
    "insight": "string",
    "cbt_reframe": "string",
    "action_plan": "string",
    "crisis_detected": "boolean"
  }
}
```

#### `analysis_logs`
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "timestamp": "ISODate",
  "prompt_excerpt": "string",
  "model_used": "string",
  "latency_ms": "int"
}
```

#### `users` *(Phase 2)*
```json
{
  "_id": "ObjectId",
  "email": "string",
  "hashed_password": "string",
  "created_at": "ISODate"
}
```

---

## ☁️ Deployment

| Layer | Platform | Notes |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com/) | Auto-deploys from `main` branch |
| **Backend** | [Render](https://render.com/) Free Tier | Web service running `uvicorn main:app` |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) M0 Free | Serverless cluster |
| **AI** | Google AI Studio | Gemini 2.5 Flash API |

> ⚠️ **Cold Start Warning:** Render's free tier spins down after inactivity. The **first request** after a period of rest may take **30–50 seconds**. Subsequent requests are fast.

### Deploying to Vercel

```bash
# Push to GitHub — Vercel auto-deploys on every push to main
git push origin main
```

Set these environment variables in your **Vercel project settings:**

```ini
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-BACKEND.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### Deploying the Backend to Render

1. Connect your GitHub repo to Render
2. Set **Build Command:** `pip install -r requirements.txt`
3. Set **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Add the same environment variables from `backend/.env`

---

## 🔮 Roadmap

- [x] Core mood logging + Gemini AI analysis
- [x] MongoDB persistence + streak tracking
- [x] Crisis intervention (regex layer)
- [x] Sonic therapy + Spotify playlist matching
- [x] Glassmorphic UI + Three.js particle backgrounds
- [x] Emotional trajectory chart (linear regression)
- [x] Focus timer + breathing visualizer
- [ ] **Full JWT authentication** (replace simulated `local_user`)
- [ ] **Emotion Prediction Models** (Random Forest / LSTM for dip forecasting)
- [ ] **Biometric Input** (optical-flow webcam stress assessment)
- [ ] **Enhanced Crisis Layer** (offline SLM replacing regex)
- [ ] **Mobile app** (React Native)
- [ ] **Therapist Scheduling** (calendar integration)

---

## 🤝 Contributing

Contributions are what make the open source community amazing. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request** targeting the `main` branch

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Made with 💙 for mental health awareness**

*If you or someone you know is in crisis, please reach out:*  
**iCall (India):** 9152987821 · **Vandrevala Foundation:** 1860-2662-345

<br/>

⭐ Star this repo if WeCare helped you · [Report a Bug](https://github.com/gopalkaushik03/WeCare/issues) · [Request a Feature](https://github.com/gopalkaushik03/WeCare/issues)

</div>
