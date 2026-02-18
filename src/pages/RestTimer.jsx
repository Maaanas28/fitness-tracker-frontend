import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX } from 'lucide-react'

function RestTimer() {
  const navigate = useNavigate()
  const [time, setTime] = useState(60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // Preset times
  const presets = [30, 60, 90, 120, 180]

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false)
            if (soundEnabled) playSound()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, time, soundEnabled])

  const playSound = () => {
    // Create beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(60)
  }

  const addTime = (seconds) => {
    setTime(time + seconds)
  }

  const setPreset = (seconds) => {
    setIsRunning(false)
    setTime(seconds)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const percentage = time > 0 ? ((60 - time) / 60) * 100 : 100

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
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Play className="text-orange-500" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Rest Timer</h1>
              <p className="text-gray-400 text-sm">Time your workout rest periods</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Main Timer Card */}
        <div className="bg-gray-800 p-8 rounded-2xl mb-6">
          {/* Circular Timer Display */}
          <div className="flex justify-center mb-8">
            <div className="relative w-80 h-80">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="#374151"
                  strokeWidth="20"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="#84cc16"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-7xl font-bold text-white mb-2">{formatTime(time)}</p>
                <p className="text-gray-400 text-lg">
                  {isRunning ? 'Resting...' : time === 0 ? 'Time\'s Up!' : 'Ready'}
                </p>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={toggleTimer}
              disabled={time === 0}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                time === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : isRunning
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-lime-500 hover:bg-lime-600 text-black'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={24} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={24} />
                  Start
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RotateCcw size={24} />
              Reset
            </button>
          </div>

          {/* Add/Remove Time */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => addTime(-10)}
              disabled={isRunning || time <= 10}
              className={`py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                isRunning || time <= 10
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              }`}
            >
              <Minus size={20} />
              10s
            </button>
            <button
              onClick={() => addTime(10)}
              disabled={isRunning}
              className={`py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-lime-500/20 text-lime-500 hover:bg-lime-500/30'
              }`}
            >
              <Plus size={20} />
              10s
            </button>
          </div>
        </div>

        {/* Preset Times */}
        <div className="bg-gray-800 p-6 rounded-2xl mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Presets</h3>
          <div className="grid grid-cols-5 gap-3">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setPreset(preset)}
                disabled={isRunning}
                className={`py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  isRunning
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : time === preset
                    ? 'bg-lime-500 text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {preset}s
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-800 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-4">�??� Rest Period Guidelines</h3>
          <div className="space-y-3">
            <div className="bg-lime-500/10 border border-lime-500/30 p-4 rounded-lg">
              <p className="text-lime-500 font-semibold mb-1">Strength Training (Heavy)</p>
              <p className="text-gray-300 text-sm">Rest 2-3 minutes between sets</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <p className="text-blue-500 font-semibold mb-1">Hypertrophy (Muscle Building)</p>
              <p className="text-gray-300 text-sm">Rest 60-90 seconds between sets</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
              <p className="text-orange-500 font-semibold mb-1">Endurance/Circuit Training</p>
              <p className="text-gray-300 text-sm">Rest 30-60 seconds between sets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestTimer
