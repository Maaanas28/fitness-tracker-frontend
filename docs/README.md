# AI Fitness Tracker — Complete Project Documentation

> Full-stack fitness tracking web application with real-time AI coaching, JWT authentication, Google OAuth, and MongoDB persistence.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [AI Integration](#ai-integration)
8. [Folder Structure](#folder-structure)
9. [Setup & Running Locally](#setup--running-locally)
10. [Environment Variables](#environment-variables)
11. [Test Results](#test-results)
12. [Deployment](#deployment)
13. [Interview Q&A](#interview-qa)

---

## Project Overview

AI Fitness Tracker is a production-grade full-stack web application that allows users to track workouts, diet, water intake, body progress, and get AI-powered coaching — all tied to a real MongoDB database with per-user data isolation.

Every feature is backed by real database calls. There is no fake or hardcoded data shown to the user after login.

**Live ports (local):**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## Features

### Authentication
- Email/password signup and login with JWT
- Google OAuth 2.0 login (Passport.js)
- Two-Factor Authentication (2FA) with TOTP (speakeasy + QR code)
- Token stored in localStorage, auto-cleared on logout
- All API routes protected with JWT middleware
- Automatic 401 handling — logs user out if token expires

### Dashboard
- Real-time stats: total workouts, calories burned, water intake, active streak
- Data aggregated live from MongoDB across all modules
- Animated counters and charts

### Workout Tracker
- Log exercises with sets, reps, weight, notes
- Save completed workouts to database
- View full workout history
- Save and load workout templates
- Volume and calorie calculations per session

### Workout Plan Generator (AI)
- Input: experience level, goal, days per week, session duration, equipment
- AI generates a full multi-day workout plan via Groq API (llama-3.3-70b-versatile)
- Smart fallback plan if AI is unavailable
- Save generated plans and export to PDF

### Diet Tracker
- Log meals with name, calories, protein, carbs, fat, meal type
- Daily calorie and macro goal tracking
- Calorie target calculator integrated
- AI-powered meal suggestions
- History stored in database, fetched by date

### Water Tracker
- Track daily water intake by glasses/ml
- Daily goal with progress ring
- History stored per user in database

### Progress Page
- Log body weight, body fat %, and measurements (chest, waist, hips, arms, legs)
- Upload progress photos (stored as base64 in database)
- 5 real-data charts:
  - Weight progress (last 8 entries)
  - Workout frequency by month (last 5 months)
  - Daily calorie intake vs. goal (last 7 days)
  - Macro distribution pie chart (last 20 meals)
  - Progress photo timeline

### Body Analysis (AI)
- Input body stats and goals
- AI generates body type assessment, strengths, areas to improve, training and nutrition plan
- Results saved to database
- Fallback response if AI is unavailable

### Exercise Library (AI)
- Searchable exercise database
- AI-powered exercise recommendations based on muscle group and equipment
- Save favorites to database per user

### Fitness Calculators
- BMI Calculator
- TDEE (Total Daily Energy Expenditure)
- Macro Calculator
- One Rep Max (1RM)
- Calorie deficit/surplus
- Results saved to database and auto-loaded to Profile

### AI Assistant (Chat)
- Full conversational AI coach powered by Groq API
- System prompt injected with the users REAL data (profile, workouts, nutrition, water, progress)
- Responses are data-driven, not generic
- Chat history maintained within session
- Quick prompt buttons: workouts, nutrition, progress, recovery

### Profile Page
- Save and update personal info: name, age, weight, height, gender, fitness goal, activity level, experience
- Change password
- 2FA setup (QR code scan)
- Google account link status

### Rest Timer
- Countdown timer for rest between sets
- Preset intervals (30s, 60s, 90s, 2min, 3min)
- Audio alert on completion

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI framework |
| Vite | 7.3.1 | Build tool and dev server |
| React Router | 7.13.0 | Client-side routing (SPA) |
| Framer Motion | 12.34.2 | Animations and transitions |
| Recharts | 3.7.0 | Data visualization charts |
| Bootstrap | 5.3.8 | Base CSS utility |
| Tailwind CSS | 3.4.1 | Utility-first CSS classes |
| Lucide React | 0.575.0 | Icon library |
| react-hot-toast | 2.6.0 | Toast notifications |
| date-fns | 4.1.0 | Date formatting |
| jsPDF + autotable | 4.2.0 | PDF export |
| canvas-confetti | 1.9.3 | Celebration animations |
| react-countup | 6.5.3 | Animated number counters |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18.2 | Web framework |
| Mongoose | 8.0.0 | MongoDB ODM |
| MongoDB | local/cloud | Database |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Passport.js | 0.7.0 | Google OAuth strategy |
| passport-google-oauth20 | 2.0.0 | Google OAuth 2.0 |
| express-session | 1.17.3 | Session management |
| speakeasy | 2.0.0 | TOTP 2FA |
| qrcode | 1.5.4 | QR code generation |
| dotenv | 16.3.1 | Environment variable loading |
| nodemon | 3.0.1 | Hot reload in dev |

### AI / External API

| Service | Purpose |
|---------|---------|
| Groq API (llama-3.3-70b-versatile) | AI chat, workout plans, meal suggestions, body analysis |

---

## Architecture

```
Browser (React SPA)
       |
       |  HTTP/REST (JSON)
       v
Express API Server (Node.js : 5000)
       |
       |-- JWT Auth Middleware (every protected route)
       |-- Passport.js (Google OAuth flow)
       |
       |-- /api/auth           signup, login, Google OAuth, 2FA
       |-- /api/workouts       CRUD workout sessions
       |-- /api/meals          CRUD meal logs
       |-- /api/progress       CRUD body progress entries
       |-- /api/water          CRUD daily water logs
       |-- /api/favorites      CRUD exercise favorites
       |-- /api/body-analysis  CRUD body analysis results
       |-- /api/calculations   CRUD calculator results
       |-- /api/ai/chat        Groq API proxy (key stays server-side)
              |
              v
         Groq API (llama-3.3-70b-versatile)
       |
       v
MongoDB (per-user data isolation via userId on every document)
```

**Key design decisions:**
- The Groq API key is NEVER exposed to the browser. All AI calls go through `/api/ai/chat` (backend proxy), which verifies JWT before forwarding to Groq.
- All database documents include a `userId` field. Queries always filter by `req.userId` decoded from the JWT so users can never see each other's data.
- The frontend has a fallback mode for every AI feature so the UI never crashes if the AI call fails.

---

## Database Schema

### User
```js
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  googleId: String,
  twoFactorSecret: String,
  twoFactorEnabled: Boolean,
  createdAt: Date
}
```

### Workout
```js
{
  userId: ObjectId,
  date: String,
  exercises: Number,
  completedSets: Number,
  volume: Number,        // kg
  calories: Number,
  duration: Number,      // minutes
  workoutData: Array     // full exercise log with sets/reps
}
```

### Meal
```js
{
  userId: ObjectId,
  date: String,
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  mealType: String       // breakfast, lunch, dinner, snack
}
```

### Progress
```js
{
  userId: ObjectId,
  date: String (unique per user),
  weight: Number,
  bodyFat: Number,
  measurements: { chest, waist, hips, arms, legs: Number },
  photos: [String],
  notes: String
}
```

### Water
```js
{
  userId: ObjectId,
  date: String (unique per user),
  amount: Number,        // ml consumed
  goal: Number           // ml daily goal
}
```

### Favorite
```js
{
  userId: ObjectId,
  exerciseId: String,
  exerciseName: String,
  category: String
}
```

### BodyAnalysis
```js
{
  userId: ObjectId,
  name: String,
  photoUrl: String,
  focusAreas: [String],
  trainingPlan: String,
  aiAnalysis: Object,
  createdAt: Date
}
```

### Calculation
```js
{
  userId: ObjectId,
  calculationType: String,  // bmi, tdee, macro, 1rm
  inputs: Object,
  results: Object,
  createdAt: Date
}
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| GET | `/me` | Yes | Get current user profile |
| PUT | `/me` | Yes | Update profile |
| PUT | `/change-password` | Yes | Change password |
| GET | `/google` | No | Start Google OAuth |
| GET | `/google/callback` | No | Google OAuth callback |
| POST | `/2fa/generate` | Yes | Generate 2FA secret and QR code |
| POST | `/2fa/verify` | Yes | Verify and enable 2FA |
| POST | `/2fa/disable` | Yes | Disable 2FA |

### Workouts — `/api/workouts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all workouts for user |
| POST | `/` | Save new workout |
| DELETE | `/:id` | Delete workout |

### Meals — `/api/meals`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all meals for user |
| GET | `/date/:date` | Get meals by date |
| POST | `/` | Save meal |
| DELETE | `/:id` | Delete meal |

### Progress — `/api/progress`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all progress entries |
| POST | `/` | Upsert progress entry by date |
| DELETE | `/:id` | Delete entry |

### Water — `/api/water`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all water records |
| GET | `/today` | Get todays water record |
| POST | `/` | Upsert water record |
| DELETE | `/:id` | Delete record |

### Favorites — `/api/favorites`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all favorites |
| POST | `/` | Add favorite exercise |
| DELETE | `/:exerciseId` | Remove favorite |

### Body Analysis — `/api/body-analysis`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all analyses |
| GET | `/:id` | Get single analysis |
| POST | `/` | Create analysis |
| PUT | `/:id` | Update analysis |
| DELETE | `/:id` | Delete analysis |

### Calculations — `/api/calculations`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all saved calculations |
| GET | `/:type` | Get by type (bmi, tdee, macro, 1rm) |
| POST | `/` | Save calculation |
| DELETE | `/:id` | Delete calculation |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | Yes | Proxy to Groq API. Body: `{ messages: [{role, content}] }` |

---

## AI Integration

### How it works

1. **AI Assistant** — User messages + full user data system prompt sent to `/api/ai/chat`. Backend forwards to Groq with the real API key. Response returned to frontend.

2. **Workout Plan Generator** — Frontend builds a detailed prompt (goal, experience, days, equipment) and calls Groq. Returns structured JSON with named days and exercises.

3. **Body Analysis** — User inputs (weight, height, body fat, goals, focus areas) sent to AI. Returns structured JSON: body type, strengths, weaknesses, training plan, nutrition plan, estimated timeline.

4. **Diet Tracker** — AI suggests meals based on calorie goal and protein targets.

5. **Exercise Library** — AI suggests exercises based on selected muscle group and equipment.

### Fallback Strategy

If the AI API fails (no key, rate limit, network error), every feature has a fallback so the app never crashes:
- Workout generator: Smart static plans adjusted by experience and goal
- Meal suggestions: High-protein or low-cal meal lists
- Body Analysis: Structured generic assessment JSON
- AI Assistant: Helpful offline message

### Model Used
- Model: `llama-3.3-70b-versatile` via Groq API
- Temperature: 0.7
- Max tokens: 2048
- Free tier: 14,400 requests/day

---

## Folder Structure

```
fitness-tracker-frontend-main/
|-- backend/
|   |-- config/
|   |   `-- passport.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Workout.js
|   |   |-- Meal.js
|   |   |-- Progress.js
|   |   |-- Water.js
|   |   |-- Favorite.js
|   |   |-- BodyAnalysis.js
|   |   `-- Calculation.js
|   |-- routes/
|   |   |-- auth.js
|   |   |-- workouts.js
|   |   |-- meals.js
|   |   |-- progress.js
|   |   |-- water.js
|   |   |-- favorites.js
|   |   |-- bodyAnalysis.js
|   |   |-- calculations.js
|   |   `-- ai.js
|   |-- scripts/
|   |   |-- free-port.js
|   |   |-- smoke-test.ps1
|   |   `-- seed-*.js
|   |-- server.js
|   |-- package.json
|   `-- .env
|
|-- frontend/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- LandingPage.jsx
|   |   |   |-- LoginPage.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- WorkoutTracker.jsx
|   |   |   |-- WorkoutPlanGenerator.jsx
|   |   |   |-- DietTracker.jsx
|   |   |   |-- WaterTracker.jsx
|   |   |   |-- ProgressPage.jsx
|   |   |   |-- BodyAnalysis.jsx
|   |   |   |-- ExerciseLibrary.jsx
|   |   |   |-- CalculatorPage.jsx
|   |   |   |-- AIAssistant.jsx
|   |   |   |-- ProfilePage.jsx
|   |   |   |-- RestTimer.jsx
|   |   |   |-- AuthCallback.jsx
|   |   |   `-- NotFoundPage.jsx
|   |   |-- services/
|   |   |   `-- api.js
|   |   |-- utils/
|   |   |   `-- ai.js
|   |   |-- hooks/
|   |   |   `-- useApi.js
|   |   |-- components/
|   |   |   `-- LoadingSkeleton.jsx
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   |-- public/
|   |-- index.html
|   |-- vite.config.js
|   |-- tailwind.config.js
|   |-- package.json
|   `-- .env
|
`-- docs/
    `-- README.md   (this file)
```

---

## Setup & Running Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Groq API key (free at console.groq.com)

### Step 1 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Configure environment

**backend/.env**
```
PORT=5000
BODY_LIMIT=5mb
MONGO_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your-strong-random-secret
SESSION_SECRET=your-session-secret
BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GROQ_API_KEY=your-groq-api-key
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_GROQ_API_KEY=your-groq-api-key
```

### Step 3 — Run Backend (Terminal 1)

```bash
cd backend
npm run dev
```

### Step 4 — Run Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

### Step 5 — Open App

Go to http://localhost:5173 in your browser.

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No (default: 5000) | Server port |
| MONGO_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | Secret for signing JWTs |
| SESSION_SECRET | Yes | Express session secret |
| CORS_ORIGINS | Yes | Allowed origins (comma-separated) |
| FRONTEND_URL | Yes | Frontend URL for OAuth redirects |
| GOOGLE_CLIENT_ID | For Google Login | OAuth client ID |
| GOOGLE_CLIENT_SECRET | For Google Login | OAuth client secret |
| GOOGLE_CALLBACK_URL | For Google Login | OAuth callback URL |
| GROQ_API_KEY | For AI features | Groq API key |
| BODY_LIMIT | No (default: 5mb) | Max request body size |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | No (default: localhost) | Backend API base URL |
| VITE_GROQ_API_KEY | Optional | Groq key for direct frontend calls |

---

## Test Results

### Backend Smoke Test — 19/19 PASS

```
Run: cd backend && npm run smoke

[PASS] GET /api/health returns status=ok
[PASS] POST /api/auth/signup returns token
[PASS] GET /api/auth/me returns created user
[PASS] POST /api/workouts creates workout
[PASS] GET /api/workouts returns list
[PASS] POST /api/meals creates meal
[PASS] GET /api/meals returns list
[PASS] POST /api/progress upserts progress
[PASS] GET /api/progress returns list
[PASS] POST /api/water creates or updates water record
[PASS] GET /api/water/today returns record
[PASS] POST /api/favorites creates favorite
[PASS] GET /api/favorites returns list
[PASS] POST /api/body-analysis creates entry
[PASS] GET /api/body-analysis returns list
[PASS] POST /api/calculations creates calculation
[PASS] GET /api/calculations returns list
[PASS] GET /api/workouts without token returns 401
[PASS] POST /api/auth/login with >5mb payload returns 413

Passed: 19   Failed: 0
```

### Frontend Build
```
npm run build  ->  built in ~10s  (zero errors)
npm run lint   ->  no errors, no warnings
```

### AI Live Test
```
POST /api/ai/chat with valid JWT -> Groq responds  OK
```

---

## Deployment

### Frontend (Vercel)

1. Import repository in Vercel
2. Framework preset: Vite
3. Root directory: frontend
4. Build command: npm run build
5. Output directory: dist
6. Environment variable: VITE_API_URL=https://your-backend.com/api

The vercel.json includes SPA rewrite rules so React Router works on page refresh.

### Backend (Railway / Render / any Node host)

1. Deploy the backend/ folder
2. Set all environment variables in the host dashboard
3. Update CORS_ORIGINS to your deployed frontend URL
4. Update FRONTEND_URL to your deployed frontend URL
5. Update GOOGLE_CALLBACK_URL to https://your-backend.com/api/auth/google/callback

---

## Interview Q&A

**Q: How does authentication work?**
A: User signs up with email/password. Password is hashed with bcrypt before storage. On login, server verifies the hash and issues a signed JWT. Frontend stores the token in localStorage and sends it as a Bearer token in every API request. Backend middleware verifies the JWT on every protected route and extracts userId.

**Q: How do you prevent one user from seeing another users data?**
A: Every database document has a userId field. Every query filters by req.userId decoded from the verified JWT. There is no way to access another users data through the API.

**Q: How does the AI chat work without exposing the API key?**
A: All AI requests go through /api/ai/chat which is a backend proxy. The Groq API key lives only in backend/.env and is never sent to the browser. The route also requires a valid JWT so unauthenticated users cannot abuse it.

**Q: What happens if the AI service is down?**
A: Every AI feature has a fallback. Workout generator falls back to smart static templates adjusted by experience and goal. Body analysis returns a structured generic assessment. The app never crashes due to AI unavailability.

**Q: How is the Progress Page data calculated?**
A: Weight graph: pulls progress entries from DB, sorts by date, takes last 8. Workout frequency: groups workouts by month, counts per month. Calorie chart: sums meal calories per day for last 7 days. Macro pie: sums protein/carbs/fat from last 20 meals, calculates percentages.

**Q: How does Google OAuth work?**
A: User clicks Login with Google -> redirected to /api/auth/google -> Passport.js redirects to Google consent screen -> Google redirects back to /api/auth/google/callback -> Passport finds or creates user in MongoDB -> server issues JWT -> redirects frontend to /auth/callback?token=... -> frontend stores token.

**Q: How does 2FA work?**
A: User enables 2FA from Profile. Backend generates a TOTP secret with speakeasy, returns a QR code. User scans with Google Authenticator. On next login user enters the 6-digit code. Backend verifies against the stored secret before issuing the JWT.

**Q: What is the complete tech stack?**
A: Frontend: React 19, Vite, React Router, Framer Motion, Recharts, Tailwind CSS. Backend: Node.js, Express, MongoDB with Mongoose, JWT, Passport.js, speakeasy for 2FA. AI: Groq API with llama-3.3-70b-versatile.

---

Last updated: July 2026
Backend: 19/19 API tests passing
Build: clean, zero lint errors
