# 🏋️‍♂️ FitPulse - AI Fitness & Nutrition Tracker

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, full-stack fitness and nutrition tracking web application built with **React 19**, **Vite**, **Tailwind CSS**, **Express**, and **MongoDB**. **FitPulse** leverages AI (Groq API integration) to provide personalized workout generator plans, intelligent diet advice, 2FA security, water logging, interactive analytics charts, and PDF exports.

---

## 🚀 Features

- 📊 **Interactive Dashboard**: Real-time stats, weekly workout frequency charts, macro breakdowns, water intake trackers, and streak counts.
- 🤖 **AI Fitness & Nutrition Assistant**: Powered by Groq AI (with smart offline fallbacks) to generate customized workout routines, diet recommendations, and advice.
- 🏋️ **Workout Tracker & Generator**: Log exercises, sets, reps, weights, duration, and exercise types. Includes a built-in Rest Timer and custom plan builder.
- 🥗 **Diet & Meal Logging**: Track daily calories and macros (Protein, Carbs, Fats) across Breakfast, Lunch, Dinner, and Snacks.
- 💧 **Water Intake Log**: Log daily hydration with visual progress bars, custom target goals, and quick-add buttons.
- 📈 **Progress Analytics & PDF Export**: Track weight history over time, monitor body metrics, and export workout/diet reports directly to PDF.
- 🧮 **Body Analysis & Calculators**: Built-in calculators for BMI, BMR, TDEE, Body Fat %, Calorie Surplus/Deficit, and Macro splits.
- 🔐 **Secure Auth & 2FA**: Email/Password login, Google OAuth 2.0 integration, JWT authentication, and 2-Factor Authentication (TOTP / Authenticator Apps).
- 📖 **Exercise Library**: Searchable database of exercises filtered by muscle target and equipment.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Build**: React 19, Vite 7
- **Styling**: Tailwind CSS 3.4, Bootstrap 5.3
- **Animations**: Framer Motion 12, Canvas Confetti
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **State & Router**: React Context API, React Router 7
- **Toasts**: react-hot-toast

### Backend
- **Server**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: JWT, Passport.js (Google OAuth 2.0)
- **Security & 2FA**: Speakeasy, QRCode, bcryptjs, CORS, Express Sessions
- **AI Engine**: Groq API integration with automated fallback handling
- **Dev Tools**: Nodemon, PowerShell smoke testing, automated port cleaner script (`free-port.js`)

---

## 📁 Repository Structure

```text
fitness-tracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Skeleton, RestTimer, Modals)
│   │   ├── context/          # React Context (AuthContext, ThemeContext)
│   │   ├── pages/            # Page components (Dashboard, WorkoutTracker, DietTracker, AIAssistant, etc.)
│   │   └── utils/            # Helper utilities (api, AI generator fallbacks, PDF export)
│   ├── public/               # Static assets
│   ├── package.json          # Frontend scripts & dependencies
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── vite.config.js        # Vite configuration
│
├── backend/                  # Express REST API backend
│   ├── models/               # Mongoose data schemas (User, Workout, Meal, Water, Progress, etc.)
│   ├── routes/               # API endpoints (auth, ai, workouts, meals, water, progress, etc.)
│   ├── scripts/              # Database seeding scripts & utility tooling
│   ├── server.js             # Express server entry point
│   └── package.json          # Backend scripts & dependencies
│
├── docs/                     # Additional documentation & integration guides
└── README.md                 # Main project documentation
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URL

---

### 2. Installation

Clone the repository and install dependencies for both `frontend` and `backend`:

```bash
# Clone the repository
git clone https://github.com/your-username/fitness-tracker.git
cd fitness-tracker

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

---

### 3. Environment Setup

#### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cd backend
cp .env.example .env
```

*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Configure the environment variables in `backend/.env`:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/fitness-tracker

# Auth Secrets
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_super_secret_session_key

# CORS & URLs
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Optional: AI Integration
GROQ_API_KEY=your_groq_api_key_here

# Optional: Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend Configuration (`frontend/.env`) - Optional
Create a `.env` file in the `frontend/` directory if custom API URLs are needed:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 4. Database Seeding (Optional)

Populate your database with rich demo data and sample users:

```bash
cd backend

# Seed default demo data (workouts, meals, water logs, progress)
npm run seed:rich

# Seed user-specific history
npm run seed:lkman:rich
```

---

### 5. Running the Application

#### Option A: Run Full-Stack Concurrently (Recommended)
You can start both backend (port 5000) and frontend (port 5173) with a single command from `frontend/`:

```bash
cd frontend
npm run dev:full
```

#### Option B: Run Services Separately

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend App):**
```bash
cd frontend
npm run dev
```

Open your browser and navigate to:
- 🌐 **Frontend App**: `http://localhost:5173`
- 📡 **Backend Health Check**: `http://localhost:5000/api/health`

---

## 📡 API Endpoints Overview

| Route | Method | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `/api/auth/register` | `POST` | Register new user account | ❌ |
| `/api/auth/login` | `POST` | Authenticate user & issue JWT | ❌ |
| `/api/auth/google` | `GET` | Initiate Google OAuth flow | ❌ |
| `/api/auth/2fa/setup` | `POST` | Generate 2FA QR Code & Secret | ✅ |
| `/api/auth/2fa/verify` | `POST` | Verify 2FA token | ✅ |
| `/api/workouts` | `GET` / `POST` | Fetch user workouts / Log workout | ✅ |
| `/api/meals` | `GET` / `POST` | Fetch meal logs / Log meal | ✅ |
| `/api/water` | `GET` / `POST` | Fetch water logs / Log water intake | ✅ |
| `/api/progress` | `GET` / `POST` | Fetch progress logs / Record weight/metrics | ✅ |
| `/api/ai/chat` | `POST` | Query AI Fitness Assistant | ✅ |
| `/api/ai/generate-workout` | `POST` | AI Routine Generator | ✅ |
| `/api/calculations` | `POST` | Perform BMR, TDEE, BMI calculations | ❌ |

---

## 🌐 Deployment Guidelines

### Deploying Frontend on Vercel

1. Push your code to GitHub.
2. Connect your repository on [Vercel](https://vercel.com).
3. Set the **Root Directory** to `frontend`.
4. Configure the Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend-api-domain.com/api`
6. Deploy! (`frontend/vercel.json` ensures Client-side SPA Routing support).

---

## 📚 Additional Documentation

- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [Backend Documentation](docs/README.md)
- [Google OAuth Setup Guide](backend/GOOGLE_AUTH_SETUP.md)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

