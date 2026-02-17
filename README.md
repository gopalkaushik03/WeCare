# 🌸 WeCare - AI Mental Health Companion

> **A compassionate AI-powered platform for mental health awareness, mood tracking, and emotional support.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)

---

## 🌟 Overview

**WeCare** is an AI-driven mental health companion designed to provide real-time mood analysis, personalized insights, and crisis intervention support. Built with modern web technologies and powered by Google's Gemini AI, WeCare offers a safe, empathetic space for users to track their emotional well-being.

### ✨ Key Features

- **🎭 Real-time Mood Analysis** - AI-powered emotional intelligence using Google Gemini
- **📊 Mood Tracking & Visualization** - Interactive charts and heatmaps to track emotional patterns
- **🚨 Crisis Intervention** - Automatic detection of crisis keywords with immediate resource recommendations
- **💡 Personalized Insights** - Contextual suggestions and cognitive reframing techniques
- **🎨 Premium UI/UX** - Modern, calming interface with smooth animations and dark mode support
- **🔒 Privacy-First** - Local processing with secure API communication

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS with custom design system
- **Animations:** Framer Motion, GSAP
- **3D Graphics:** React Three Fiber (Three.js)
- **Charts:** Recharts
- **UI Components:** Custom components with Radix UI primitives

### Backend
- **Framework:** FastAPI (Python)
- **AI Engine:** Google Gemini API
- **Environment:** Python 3.9+
- **CORS:** Enabled for local development

### AI & Safety
- **Model:** Google Gemini Flash
- **Safety Layer:** Server-side crisis keyword detection
- **Response Format:** Structured JSON with validation

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/wecare.git
cd wecare
```

#### 2️⃣ Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
The frontend will be available at **http://localhost:3000**

#### 3️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
```

#### 4️⃣ Configure Environment Variables

Edit `backend/.env` and add your API key:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### 5️⃣ Start the Backend
```bash
# Make sure you're in the backend directory with venv activated
uvicorn main:app --reload --port 8000
```
The backend API will be available at **http://localhost:8000**

---

## 📁 Project Structure

```
WeCare/
├── app/                    # Next.js app directory (pages)
│   ├── page.jsx           # Landing page
│   ├── mood/              # Mood input page
│   └── analysis/          # AI analysis results page
├── components/            # React components
│   ├── MoodTrendChart.jsx
│   ├── ConsistencyHeatmap.jsx
│   └── ...
├── backend/               # FastAPI backend
│   ├── main.py           # Main API server
│   ├── routes/           # API routes
│   ├── services/         # Business logic (Gemini client)
│   ├── utils/            # Safety utilities
│   ├── prompts/          # AI system prompts
│   └── requirements.txt  # Python dependencies
├── lib/                   # Utility functions
├── context/              # React context providers
├── .env.example          # Environment template
└── package.json          # Node.js dependencies
```

---

## 🎯 Usage

1. **Start both servers** (frontend on :3000, backend on :8000)
2. **Open the app** at http://localhost:3000
3. **Select your mood** and add optional notes
4. **Receive AI analysis** with personalized insights and suggestions
5. **Track your progress** over time with visualizations

---

## 🔒 Security & Privacy

- ✅ API keys stored in `.env` (never committed to Git)
- ✅ `.gitignore` configured to exclude sensitive files
- ✅ Server-side crisis detection for immediate intervention
- ✅ CORS restricted to localhost during development

**⚠️ IMPORTANT:** Always use `.env.example` as a template. Never commit your actual `.env` file.

---

## 🧪 Development

### Run Tests
```bash
# Backend tests
cd backend
pytest
```

### Build for Production
```bash
# Frontend
npm run build
npm start

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

**WeCare is a prototype mental health awareness tool and is NOT a substitute for professional medical advice, diagnosis, or treatment.**

- Always seek the advice of qualified health providers with questions regarding mental health
- If you are in crisis, please contact emergency services or a crisis hotline immediately
- This tool is designed to complement, not replace, professional mental health care

### Crisis Resources
- **National Suicide Prevention Lifeline:** 988 (US)
- **Crisis Text Line:** Text HOME to 741741
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent analysis
- **Next.js & FastAPI** communities for excellent documentation
- **Mental health professionals** who inspire compassionate technology

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

**Made with 💙 for mental health awareness**
