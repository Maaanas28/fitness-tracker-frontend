import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplet, Plus, Minus, RotateCcw } from 'lucide-react'

function WaterTracker() {
  const navigate = useNavigate()
  const [waterIntake, setWaterIntake] = useState(0)
  const dailyGoal = 8 // 8 glasses (2000ml)
  const glassSize = 250 // ml

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('waterIntake')
    const savedDate = localStorage.getItem('waterDate')
    const today = new Date().toDateString()

    if (savedDate === today && saved) {
      setWaterIntake(parseInt(saved))
    } else {
      // Reset for new day
      setWaterIntake(0)
      localStorage.setItem('waterDate', today)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('waterIntake', waterIntake.toString())
  }, [waterIntake])

  const addGlass = () => {
    if (waterIntake < dailyGoal) {
      setWaterIntake(waterIntake + 1)
    }
  }

  const removeGlass = () => {
    if (waterIntake > 0) {
      setWaterIntake(waterIntake - 1)
    }
  }

  const reset = () => {
    setWaterIntake(0)
  }

  const percentage = Math.min((waterIntake / dailyGoal) * 100, 100)
  const totalMl = waterIntake * glassSize
  const goalMl = dailyGoal * glassSize
  const remaining = Math.max(goalMl - totalMl, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Droplet className="text-blue-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Water Tracker</h1>
              <p className="text-gray-400 text-sm">Stay hydrated throughout the day</p>
            </div>
          </div>
        </div>
        <button 
          onClick={reset}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Main Card */}
        <div className="bg-gray-800 p-8 rounded-2xl mb-6">
          {/* Water Glass Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-64">
              {/* Glass Container */}
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-b-3xl">
                {/* Water Fill */}
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-b-3xl transition-all duration-500 ease-out"
                  style={{ height: `${percentage}%` }}
                >
                  {/* Waves Effect */}
                  <div className="absolute top-0 w-full h-4 bg-blue-300/50 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-white drop-shadow-lg">{Math.round(percentage)}%</p>
                  <p className="text-white/80 text-sm mt-1">of daily goal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-1">Consumed</p>
              <p className="text-2xl font-bold text-blue-500">{waterIntake}</p>
              <p className="text-gray-500 text-xs">glasses</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-1">Goal</p>
              <p className="text-2xl font-bold text-white">{dailyGoal}</p>
              <p className="text-gray-500 text-xs">glasses</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm mb-1">Remaining</p>
              <p className="text-2xl font-bold text-lime-500">{dailyGoal - waterIntake}</p>
              <p className="text-gray-500 text-xs">glasses</p>
            </div>
          </div>

          {/* Volume Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Volume</p>
                <p className="text-2xl font-bold text-white">{totalMl} ml</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Goal</p>
                <p className="text-2xl font-bold text-blue-500">{goalMl} ml</p>
              </div>
            </div>
            {remaining > 0 && (
              <p className="text-blue-400 text-sm mt-3 text-center">
                �??� Drink {remaining}ml more to reach your goal!
              </p>
            )}
            {waterIntake >= dailyGoal && (
              <p className="text-lime-500 text-sm mt-3 text-center font-semibold">
                �??? Goal achieved! Great job staying hydrated!
              </p>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <button
              onClick={removeGlass}
              disabled={waterIntake === 0}
              className={`flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                waterIntake === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <Minus size={24} />
              Remove Glass
            </button>
            <button
              onClick={addGlass}
              disabled={waterIntake >= dailyGoal}
              className={`flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                waterIntake >= dailyGoal
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus size={24} />
              Add Glass
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">�??� Hydration Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                <Droplet className="text-blue-500" size={16} />
              </div>
              <div>
                <p className="text-white font-semibold">Start Your Day Right</p>
                <p className="text-gray-400 text-sm">Drink a glass of water first thing in the morning</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                <Droplet className="text-blue-500" size={16} />
              </div>
              <div>
                <p className="text-white font-semibold">Set Reminders</p>
                <p className="text-gray-400 text-sm">Drink water every 1-2 hours throughout the day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                <Droplet className="text-blue-500" size={16} />
              </div>
              <div>
                <p className="text-white font-semibold">Before Meals</p>
                <p className="text-gray-400 text-sm">Drink a glass 30 minutes before eating</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                <Droplet className="text-blue-500" size={16} />
              </div>
              <div>
                <p className="text-white font-semibold">During Workouts</p>
                <p className="text-gray-400 text-sm">Increase intake during and after exercise</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaterTracker
