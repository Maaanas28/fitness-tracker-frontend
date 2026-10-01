# 🏋️‍♂️ FitPulse - Full-Stack AI Fitness & Nutrition Tracker

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)

**FitPulse** is a production-ready, full-stack fitness and nutrition application. Built with **React 19**, **Vite**, **Tailwind CSS**, **Express**, and **MongoDB**, it provides users with personalized workout generation, macro tracking, progress analytics, 2-Factor Authentication (2FA), and AI-driven coaching powered by the **Groq API**.

---

## 📌 Project Overview & Technical Highlights

FitPulse connects a modern single-page application (SPA) with a RESTful Express API and MongoDB database. All data displayed across dashboards, charts, and logs is tied to isolated per-user MongoDB records.

### Key Engineering Highlights:
- **Data Isolation & Security**: User data is strictly isolated using `userId` indexing across all schemas. All endpoints are protected by custom JWT middleware.
- **2-Factor Authentication (2FA)**: Full TOTP implementation using `speakeasy` and `qrcode` for authenticator app support.
- **AI Integration with Fallback Architecture**: Backend acts as a secure proxy to the Groq LLM API (`llama-3.3-70b-versatile`). The frontend includes static fallback algorithms ensuring 100% uptime even if external AI services are unavailable or rate-limited.
- **Data Visualization & Export**: Interactive charts built with Recharts (weight trends, workout frequencies, macro splits) and PDF summary export functionality via `jsPDF`.

---

## 🚀 Key Features

### 📊 1. Interactive Dashboard
- Aggregates live data from MongoDB: active streaks, weekly workout counts, total calories burned, and hydration status.
- Interactive micro-animations, quick-action shortcuts, and visual progress indicators.

### 🤖 2. AI Workout Generator & Fitness Coach
- Custom workout routine generation based on user experience, fitness goals, target days, and equipment.
- Conversational AI assistant contextually injected with user metrics and history for personalized advice.

### 🏋️ 3. Workout Logger & Rest Timer
- Log exercises, sets, reps, duration, and calculated total volume (kg).
- Built-in customizable Rest Timer with preset intervals (30s, 60s, 90s, 2m, 3m) and audio alerts.

### 🥗 4. Diet & Macro Tracker
- Daily nutrition log (Breakfast, Lunch, Dinner, Snacks) tracking Protein, Carbs, Fats, and total Calories.
- Calorie target calculator integrated with daily goal progress bars.

### 💧 5. Water Intake Tracker
- Log daily hydration intake in milliliters.
- Interactive progress ring and quick-add preset buttons.

### 📈 6. Progress Analytics & PDF Exporter
- Historical weight and body metric tracking (chest, waist, hips, arms, legs).
- Export workout and nutrition history reports directly to PDF files.

### 🧮 7. Fitness Calculators & Body Analysis
- Calculators for BMI, BMR, TDEE, One-Rep Max (1RM), and Calorie Surplus/Deficit.
- AI body analysis generating tailored recommendations based on target focus areas.

### 🔐 8. Authentication & Account Security
- Email/Password authentication with bcrypt password hashing.
- Google OAuth 2.0 integration via Passport.js.
- 2FA TOTP setup and verification with QR code scanning.

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React 19 SPA)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JSON + JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express API Server (Port 5000)              │
│  ├── JWT Authentication Middleware                          │
│  ├── Passport.js (Google OAuth 2.0)                         │
│  ├── REST Routes (/api/auth, /workouts, /meals, /water, etc)│
│  └── AI Proxy Endpoint (/api/ai/chat)                       │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
  ┌───────────────────────────┐  ┌───────────────────────────┐
  │   MongoDB Database        │  │   Groq AI API             │
  │   (Mongoose ODM Schemas)  │  │   (llama-3.3-70b-versatile)│
  └───────────────────────────┘  └───────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Core**: React 19, Vite 7
- **Styling**: Tailwind CSS 3.4, Bootstrap 5.3
- **State & Routing**: React Context API, React Router 7
- **Data Visualization**: Recharts
- **Icons & UI Extras**: Lucide React, Framer Motion, Canvas Confetti, react-hot-toast
- **PDF Export**: jsPDF, jsPDF-AutoTable

### Backend
- **Runtime & Server**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **Auth & Security**: JSON Web Tokens (JWT), Passport.js (Google OAuth 2.0), Speakeasy (TOTP 2FA), QRCode, bcryptjs, CORS

---

## 📁 Repository Structure

```text
fitness-tracker/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # UI Components (Navbar, RestTimer, Skeleton, Modals)
│   │   ├── context/          # State Management (AuthContext, ThemeContext)
│   │   ├── pages/            # Views (Dashboard, WorkoutTracker, DietTracker, AIAssistant, etc.)
│   │   └── utils/            # API client, PDF exporter, AI fallback logic
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express REST API
│   ├── models/               # Mongoose Schemas (User, Workout, Meal, Water, Progress, etc.)
│   ├── routes/               # API Controllers (auth, workouts, meals, water, progress, ai)
│   ├── scripts/              # Seeding & utility scripts
│   ├── server.js             # API Entry point
│   └── package.json
│
├── docs/                     # Additional Documentation & Integration Guides
└── README.md
```

---

## 🗄️ Database Schemas Overview

- **User**: Name, Email, Hashed Password, Google ID, 2FA Secret/Status.
- **Workout**: User ID, Date, Exercises, Completed Sets, Volume (kg), Calories Burned, Duration, Set Details.
- **Meal**: User ID, Date, Meal Name, Calories, Protein, Carbs, Fat, Meal Type (Breakfast/Lunch/Dinner/Snack).
- **Water**: User ID, Date, Amount (ml), Daily Goal (ml).
- **Progress**: User ID, Date, Weight, Body Fat %, Body Measurements, Notes.
- **BodyAnalysis**: User ID, Focus Areas, AI Analysis Output, Training Plan.
- **Calculation**: User ID, Calculation Type (BMI, TDEE, Macro, 1RM), Input Metrics, Result Object.

---

## 📡 Key REST API Endpoints

| Route | Method | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `/api/auth/register` | `POST` | Create new user account | ❌ |
| `/api/auth/login` | `POST` | Authenticate & issue JWT | ❌ |
| `/api/auth/google` | `GET` | Initiate Google OAuth 2.0 flow | ❌ |
| `/api/auth/2fa/setup` | `POST` | Generate 2FA secret & QR code | ✅ |
| `/api/auth/2fa/verify` | `POST` | Verify TOTP code and enable 2FA | ✅ |
| `/api/workouts` | `GET` / `POST` | Fetch user workouts / Log new workout session | ✅ |
| `/api/meals` | `GET` / `POST` | Fetch meal history / Log meal & macros | ✅ |
| `/api/water` | `GET` / `POST` | Fetch water intake / Log hydration | ✅ |
| `/api/progress` | `GET` / `POST` | Fetch body metrics / Record weight entry | ✅ |
| `/api/ai/chat` | `POST` | Secure backend proxy to Groq AI | ✅ |
| `/api/calculations` | `POST` | Perform & store BMR / TDEE / BMI results | ❌ |

---

## ⚙️ Local Setup & Running Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string

---

### 2. Installation

```bash
# Clone repository
git clone https://github.com/Maaanas28/fitness-tracker-frontend.git
cd fitness-tracker-frontend

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

---

### 3. Environment Setup

Create `.env` in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fitness-tracker
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Optional: Groq AI & Google OAuth
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

### 4. Running the Application

**Option A: Full-Stack Concurrent Run (Recommended)**
From the `frontend/` directory:
```bash
cd frontend
npm run dev:full
```

**Option B: Separate Terminals**
```bash
# Terminal 1 - Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend SPA (Port 5173)
cd frontend
npm run dev
```

- 🌐 **Frontend Application**: `http://localhost:5173`
- 📡 **Backend Health Check**: `http://localhost:5000/api/health`

---

## 📚 Further Documentation

- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [Backend Documentation](docs/README.md)
- [Google OAuth Setup Guide](backend/GOOGLE_AUTH_SETUP.md)

