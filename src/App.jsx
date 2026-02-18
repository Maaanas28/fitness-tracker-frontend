import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import CalculatorPage from './pages/CalculatorPage'
import WorkoutTracker from './pages/WorkoutTracker'
import DietTracker from './pages/DietTracker'
import ExerciseLibrary from './pages/ExerciseLibrary'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import WaterTracker from './pages/WaterTracker'
import RestTimer from './pages/RestTimer'
import WorkoutPlanGenerator from './pages/WorkoutPlanGenerator'
import BodyAnalysis from './pages/BodyAnalysis'
import AIAssistant from './pages/AIAssistant'

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="bg-zinc-900 border-2 border-red-600 rounded-2xl p-8 max-w-md text-center">
            <AlertTriangle className="text-red-600 mx-auto mb-4 animate-pulse" size={64} />
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              SYSTEM ERROR
            </h1>
            <p className="text-gray-400 mb-4 text-sm">
              Something went wrong. The application encountered an unexpected error.
            </p>
            <div className="bg-black/50 p-3 rounded-xl mb-6 text-left">
              <p className="text-xs text-red-500 font-mono break-all">
                {this.state.error?.toString()}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wider transition-colors w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              icon: '✅',
              style: {
                border: '1px solid #22c55e',
              },
            },
            error: {
              icon: '❌',
              style: {
                border: '1px solid #ef4444',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/workout" element={<WorkoutTracker />} />
          <Route path="/diet" element={<DietTracker />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/water" element={<WaterTracker />} />
          <Route path="/timer" element={<RestTimer />} />
          <Route path="/workout-plan" element={<WorkoutPlanGenerator />} />
          <Route path="/body-analysis" element={<BodyAnalysis />} />
          <Route path="/ai" element={<AIAssistant />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
