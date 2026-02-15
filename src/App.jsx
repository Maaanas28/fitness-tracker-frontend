import { Routes, Route } from 'react-router-dom'
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

function App() {
  return (
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
    </Routes>
  )
}

export default App