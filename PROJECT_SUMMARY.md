# WeCare – AI-Based Mental Health Awareness Platform

## 🌟 Project Overview
WeCare is a premium, motion-first mental health awareness platform designed to provide users with AI-driven emotional analysis, professional support connections, and motivational resources. The project features a state-of-the-art interface with deep animations and a robust FastAPI backend.

## 🏗️ Technical Architecture

### Frontend (Modern Web Stack)
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Core Principles**: Motion-first design, dark mode aesthetics, glassmorphism, and responsive layouts.

### Backend (Python Microservice)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/)
- **Environment**: Python 3.9+ with `python-dotenv` and `uvicorn`.

---

## 🚀 Key Features (Completed & Functional)

### 1. Emotional Analysis Engine
- **Logic**: Analyzes user mood, feelings, and notes.
- **Backend**: `POST /analyze` endpoint in FastAPI.
- **Frontend**: `EmotionalCore.jsx` component provides a rich interactive experience for users to express their state.

### 2. Motion-First User Interface
- **Parallax Backgrounds**: `ParallaxBackground.jsx` for depth.
- **Interactive Cards**: `MotionCard.jsx` and `MoodCard.jsx` with hover effects and entry transitions.
- **Animated Input**: `AnimatedInput.jsx` for a premium typing experience.

### 3. Professional Support Directory
- **Component**: `ProfessionalSupport.jsx`
- **Logic**: `professionalSupport.js` manages filtering and listing of qualified mental health professionals.
- **Features**: Searchable directory of doctors, clinics, and therapists.

### 4. Motivational Content Hub
- **Component**: `VideoSection.jsx`
- **Data**: `motivationalVideos.js` provides a curated list of uplifting videos.

### 5. Safety & Compliance
- **Safety Filters**: `backend/utils/safety.py` ensures AI responses are appropriate.
- **Disclaimers**: `SafetyDisclaimer.jsx` ensures users understand the platform is supportive but not a clinical replacement.

---

## 📂 Project Structure

### Backend
```text
backend/
├── main.py              # Application entry point
├── routes/              # API Route definitions
│   └── analyze.py       # AI Analysis endpoints
├── services/            # Business logic (Gemini AI service)
├── utils/               # Safety checks and utilities
├── tests/               # Pytest suite
└── .env                 # Configuration (API Keys)
```

### Frontend
```text
app/                     # Next.js App Router (Pages)
components/              # Reusable UI components
│   ├── Navbar.jsx       # Navigation system
│   ├── Footer.jsx       # Global footer
│   └── ...              # Feature-specific components
lib/                     # Data and utility logic
│   ├── api.js           # API communication layer
│   └── motion.js        # Global animation variants
```

---

## 🛠️ Setup & Local Development

### 1. Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Configure `.env` with `GEMINI_API_KEY`.
4. Run: `python main.py`.

### 2. Frontend Setup
1. Navigate to root directory.
2. Install dependencies: `npm install`.
3. Run: `npm run dev`.
4. Open: `http://localhost:3000`.

---

## ✅ Current Status
- [x] Full-stack communication established.
- [x] Gemini AI integration functional.
- [x] Premium Motion-UI implemented.
- [x] Professional directory logic completed.
- [x] Safety protocols integrated.

---
*Created by Antigravity - Senior Project Architect*
