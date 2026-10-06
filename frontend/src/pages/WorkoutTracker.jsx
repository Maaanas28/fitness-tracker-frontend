import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Trash2, Check, X, Timer, 
  ChevronRight, Activity, Calendar, Flame, Target, BarChart3, Minus,
  Bookmark, Save, FolderOpen, Edit3, MessageSquare, TrendingUp,
  Sparkles, RefreshCw, Dumbbell, Play, Zap, FileText, Share2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'
import toast from 'react-hot-toast'
import { EmptyState } from '../components/EmptyState'
import { WorkoutSkeleton } from '../components/LoadingSkeleton'
import { useApi, apiPost } from '../hooks/useApi'

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl p-4 bg-[#141419] text-white font-mono text-xs shadow-2xl border-none">
      <p className="font-bold text-sm mb-1 text-cyan-400">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-zinc-400">Volume:</span>
        <span className="font-bold text-white">{payload[0]?.value?.toLocaleString() || 0} kg</span>
      </div>
    </div>
  )
}

function WorkoutTracker() {
  const navigate = useNavigate()
  const { data: apiWorkouts, loading: workoutsLoading, refetch: refetchWorkouts } = useApi('/workouts')
  const [isLoading, setIsLoading] = useState(true)

  // Modals & Panels state
  const [activeTab, setActiveTab] = useState('today') // 'today' | 'history' | 'templates'
  const [showAddTerminal, setShowAddTerminal] = useState(false)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(null) // { exerciseId, setIndex }
  const [noteText, setNoteText] = useState('')

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Active workout
  const [currentWorkout, setCurrentWorkout] = useState(() => {
    const saved = localStorage.getItem('currentWorkout')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  // Workout templates
  const [workoutTemplates, setWorkoutTemplates] = useState(() => {
    const saved = localStorage.getItem('workoutTemplates')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return [
      {
        id: 'tmpl_push',
        name: 'Push Day (Chest, Shoulders, Triceps)',
        exercises: [
          { name: 'Barbell Bench Press', sets: [{ reps: 10, weight: 60, completed: true }, { reps: 8, weight: 70, completed: true }, { reps: 6, weight: 80, completed: false }] },
          { name: 'Overhead Shoulder Press', sets: [{ reps: 12, weight: 40, completed: true }, { reps: 10, weight: 45, completed: true }] },
          { name: 'Tricep Rope Pushdown', sets: [{ reps: 15, weight: 30, completed: true }, { reps: 12, weight: 35, completed: true }] }
        ]
      },
      {
        id: 'tmpl_pull',
        name: 'Pull Day (Back & Biceps)',
        exercises: [
          { name: 'Conventional Deadlift', sets: [{ reps: 5, weight: 100, completed: true }, { reps: 5, weight: 120, completed: true }] },
          { name: 'Lat Pulldown', sets: [{ reps: 10, weight: 55, completed: true }, { reps: 8, weight: 65, completed: true }] },
          { name: 'Barbell Bicep Curls', sets: [{ reps: 12, weight: 30, completed: true }, { reps: 10, weight: 35, completed: true }] }
        ]
      },
      {
        id: 'tmpl_legs',
        name: 'Leg Day (Quads & Hamstrings)',
        exercises: [
          { name: 'Barbell Back Squat', sets: [{ reps: 10, weight: 80, completed: true }, { reps: 8, weight: 100, completed: true }, { reps: 6, weight: 110, completed: false }] },
          { name: 'Romanian Deadlift', sets: [{ reps: 12, weight: 70, completed: true }, { reps: 10, weight: 80, completed: true }] },
          { name: 'Leg Press', sets: [{ reps: 15, weight: 150, completed: true }, { reps: 12, weight: 170, completed: true }] }
        ]
      }
    ]
  })

  // Quick exercise terminal inputs
  const [exerciseInput, setExerciseInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')

  // Custom template creation inputs
  const [tmplExerciseInput, setTmplExerciseInput] = useState('')
  const [customTmplExercises, setCustomTmplExercises] = useState([])

  const handleAddTmplExercise = () => {
    if (!tmplExerciseInput.trim()) return
    setCustomTmplExercises((prev) => [
      ...prev,
      {
        name: tmplExerciseInput.trim(),
        sets: [
          { weight: 20, reps: 10, completed: true },
          { weight: 20, reps: 10, completed: true },
          { weight: 20, reps: 10, completed: true }
        ]
      }
    ])
    setTmplExerciseInput('')
  }

  const handleRemoveTmplExercise = (idx) => {
    setCustomTmplExercises((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Enter template name')
      return
    }

    const templateExercises = currentWorkout.length > 0
      ? currentWorkout.map((ex) => ({
          name: ex.name,
          sets: (ex.sets || []).map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }))
        }))
      : customTmplExercises

    if (!templateExercises.length) {
      toast.error('Add at least one exercise to your template')
      return
    }

    const newTmpl = {
      id: `tmpl_${Date.now()}`,
      name: newTemplateName.trim(),
      exercises: templateExercises
    }

    setWorkoutTemplates((prev) => [newTmpl, ...prev])
    setNewTemplateName('')
    setCustomTmplExercises([])
    setTmplExerciseInput('')
    setShowCreateTemplate(false)
    toast.success('Template saved successfully! 🎉')
  }

  useEffect(() => {
    localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout))
  }, [currentWorkout])

  useEffect(() => {
    localStorage.setItem('workoutTemplates', JSON.stringify(workoutTemplates))
  }, [workoutTemplates])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  // Timer Tick
  useEffect(() => {
    let interval = null
    if (isTimerRunning && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds((prev) => prev - 1), 1000)
    } else if (restSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      toast.success('Rest time finished! Start your next set.')
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restSeconds])

  const startRestTimer = (seconds = 60) => {
    setRestSeconds(seconds)
    setIsTimerRunning(true)
  }

  const workoutsList = useMemo(() => (Array.isArray(apiWorkouts) ? apiWorkouts : []), [apiWorkouts])

  // Total session volume
  const sessionVolume = useMemo(() => {
    return currentWorkout.reduce((total, ex) => {
      const exVol = ex.sets.reduce((setSum, s) => {
        return setSum + (s.completed ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0)
      }, 0)
      return total + exVol
    }, 0)
  }, [currentWorkout])

  const totalCompletedSets = useMemo(() => {
    return currentWorkout.reduce((count, ex) => count + ex.sets.filter((s) => s.completed).length, 0)
  }, [currentWorkout])

  // Chart data
  const historyChartData = useMemo(() => {
    const rows = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()

      const dayWorkouts = workoutsList.filter((w) => w.date === dateKey)
      const dayVol = dayWorkouts.reduce((sum, w) => {
        return sum + (w.exercises || []).reduce((eSum, ex) => {
          return eSum + (ex.sets || []).reduce((sSum, s) => sSum + ((Number(s.weight) || 0) * (Number(s.reps) || 0)), 0)
        }, 0)
      }, 0)

      rows.push({
        day: dayLabel,
        volume: dayVol > 0 ? dayVol : (dateKey === new Date().toISOString().split('T')[0] ? sessionVolume : 0)
      })
    }
    return rows
  }, [workoutsList, sessionVolume])

  // Exercise Management Handlers
  const handleAddExercise = () => {
    if (!exerciseInput.trim()) {
      toast.error('Enter exercise name')
      return
    }

    const weightVal = Number(weightInput) || 0
    const repsVal = Number(repsInput) || 10

    const newEx = {
      id: Date.now() + Math.random(),
      name: exerciseInput.trim().toUpperCase(),
      sets: [{ id: Date.now() + 1, weight: weightVal, reps: repsVal, completed: true, note: '' }]
    }

    setCurrentWorkout((prev) => [...prev, newEx])
    setExerciseInput('')
    setWeightInput('')
    setRepsInput('')
    setShowAddTerminal(false)
    toast.success(`Added ${newEx.name}`)
  }

  const handleAddSet = (exerciseId) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex
        const lastSet = ex.sets[ex.sets.length - 1] || { weight: 20, reps: 10 }
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { id: Date.now() + Math.random(), weight: lastSet.weight, reps: lastSet.reps, completed: false, note: '' }
          ]
        }
      })
    )
  }

  const handleToggleSet = (exerciseId, setIndex) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex
        const updatedSets = ex.sets.map((s, idx) => {
          if (idx !== setIndex) return s
          const nextVal = !s.completed
          if (nextVal) startRestTimer(60)
          return { ...s, completed: nextVal }
        })
        return { ...ex, sets: updatedSets }
      })
    )
  }

  const handleUpdateSet = (exerciseId, setIndex, field, value) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex
        const updatedSets = ex.sets.map((s, idx) => {
          if (idx !== setIndex) return s
          return { ...s, [field]: Number(value) || 0 }
        })
        return { ...ex, sets: updatedSets }
      })
    )
  }

  const handleRemoveSet = (exerciseId, setIndex) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex
        const updatedSets = ex.sets.filter((_, idx) => idx !== setIndex)
        return { ...ex, sets: updatedSets }
      }).filter((ex) => ex.sets.length > 0)
    )
  }

  const handleRemoveExercise = (exerciseId) => {
    setCurrentWorkout((prev) => prev.filter((ex) => ex.id !== exerciseId))
    toast.success('Exercise removed')
  }

  // Template Handlers
  const handleLoadTemplate = (template) => {
    const loaded = template.exercises.map((ex) => ({
      id: Date.now() + Math.random(),
      name: ex.name.toUpperCase(),
      sets: ex.sets.map((s, idx) => ({
        id: Date.now() + idx + Math.random(),
        weight: s.weight,
        reps: s.reps,
        completed: s.completed ?? true,
        note: s.note || ''
      }))
    }))
    setCurrentWorkout(loaded)
    setActiveTab('today')
    toast.success(`Loaded template: ${template.name}!`)
  }



  const handleDeleteTemplate = (templateId) => {
    setWorkoutTemplates((prev) => prev.filter((t) => t.id !== templateId))
    toast.success('Template deleted')
  }

  // Notes Modal Handler
  const handleSaveNote = () => {
    if (!showNoteModal) return
    const { exerciseId, setIndex } = showNoteModal
    setCurrentWorkout((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex
        const updatedSets = ex.sets.map((s, idx) => {
          if (idx !== setIndex) return s
          return { ...s, note: noteText }
        })
        return { ...ex, sets: updatedSets }
      })
    )
    setShowNoteModal(null)
    setNoteText('')
    toast.success('Note saved for set!')
  }

  // Save Workout Session
  const handleSaveWorkout = async () => {
    if (!currentWorkout.length) {
      toast.error('Add exercises before saving')
      return
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const payload = {
      date: todayStr,
      duration: 45,
      exercises: currentWorkout.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          completed: s.completed ?? true,
          note: s.note || ''
        }))
      }))
    }

    const saved = await apiPost('/workouts', payload)
    if (saved) {
      await refetchWorkouts()
    }

    setCurrentWorkout([])
    localStorage.removeItem('currentWorkout')
    toast.success('Workout session saved successfully!')
  }

  const handleClearWorkout = () => {
    if (window.confirm('Clear current workout session?')) {
      setCurrentWorkout([])
      localStorage.removeItem('currentWorkout')
      toast.success('Session cleared')
    }
  }

  if (isLoading || workoutsLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] p-8">
        <WorkoutSkeleton />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen w-full bg-[#09090b] text-[#E4E4E7] select-none pb-16"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      {/* ─── HEADER WITH BACK BUTTON ────────────────────────────────────────────── */}
      <header className="px-6 md:px-10 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white transition-all border-none flex items-center justify-center cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white flex items-center gap-2">
              Workout Tracker
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Log live sets, track volume & personal records</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Kanit' }}>
              {sessionVolume.toLocaleString()} <span className="text-xs font-normal text-zinc-500">KG LIFTED</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
              {totalCompletedSets} SETS COMPLETED
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-8 space-y-8">
        
        {/* ─── ACTION TRIGGER BAR & NAVIGATION TABS ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeTab === 'today' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Active Session
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeTab === 'templates' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Templates ({workoutTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeTab === 'history' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
              }`}
            >
              History ({workoutsList.length})
            </button>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/workout-plan')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-300 bg-white/[0.05] hover:bg-white/10 border-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span>AI Plan Generator</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddTerminal(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Exercise</span>
            </motion.button>
          </div>
        </div>

        {/* ─── TAB CONTENT 1: ACTIVE SESSION ───────────────────────────────────── */}
        {activeTab === 'today' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Active Workout Session (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Presets Bar */}
              <div className="rounded-[24px] bg-white/[0.03] p-5 space-y-3 border-none">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    Load Preset Routine
                  </span>
                  {currentWorkout.length > 0 && (
                    <button
                      onClick={() => setShowCreateTemplate(true)}
                      className="text-xs font-bold text-cyan-400 hover:underline border-none bg-transparent cursor-pointer flex items-center gap-1"
                    >
                      <Bookmark size={14} />
                      Save Current as Template
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {workoutTemplates.slice(0, 3).map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleLoadTemplate(tmpl)}
                      className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-left transition-all border-none flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-bold text-xs text-white uppercase truncate group-hover:text-cyan-400">{tmpl.name}</span>
                      <Play size={12} className="text-zinc-500 group-hover:text-white shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Session List */}
              {currentWorkout.length === 0 ? (
                <div className="rounded-[24px] bg-white/[0.02] p-12 text-center border-none space-y-4">
                  <EmptyState
                    icon={Dumbbell}
                    title="No Exercises Logged Yet"
                    message="Click '+ Add Exercise' or load a routine template above to start your workout."
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAddTerminal(true)}
                    className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all cursor-pointer"
                  >
                    + Add First Exercise
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-5">
                  <AnimatePresence>
                    {currentWorkout.map((exercise, exIndex) => (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="rounded-[24px] p-6 bg-white/[0.03] hover:bg-white/[0.05] transition-all space-y-4 border-none"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center font-bold text-xs text-zinc-400 font-mono">
                              0{exIndex + 1}
                            </span>
                            <h3 className="font-bold text-base text-white uppercase tracking-wide">{exercise.name}</h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddSet(exercise.id)}
                              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-bold text-cyan-400 transition-colors border-none cursor-pointer flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Set
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(exercise.id)}
                              className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/[0.05] transition-colors border-none cursor-pointer"
                              title="Remove exercise"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Sets Table Header */}
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2">
                          <div className="col-span-2 text-center">Set</div>
                          <div className="col-span-4 text-center">Weight (kg)</div>
                          <div className="col-span-3 text-center">Reps</div>
                          <div className="col-span-1 text-center">Note</div>
                          <div className="col-span-2 text-center">Done</div>
                        </div>

                        {/* Sets Rows */}
                        <div className="space-y-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div
                              key={set.id || setIndex}
                              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-all ${
                                set.completed ? 'bg-white/[0.04]' : 'bg-white/[0.01]'
                              }`}
                            >
                              <div className="col-span-2 text-center font-bold font-mono text-xs text-zinc-400">
                                #{setIndex + 1}
                              </div>
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => handleUpdateSet(exercise.id, setIndex, 'weight', e.target.value)}
                                  className="w-full bg-black/40 border-none rounded-xl px-3 py-1.5 text-center font-bold text-xs text-cyan-400 focus:outline-none"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => handleUpdateSet(exercise.id, setIndex, 'reps', e.target.value)}
                                  className="w-full bg-black/40 border-none rounded-xl px-3 py-1.5 text-center font-bold text-xs text-amber-400 focus:outline-none"
                                />
                              </div>
                              <div className="col-span-1 text-center">
                                <button
                                  onClick={() => {
                                    setShowNoteModal({ exerciseId: exercise.id, setIndex })
                                    setNoteText(set.note || '')
                                  }}
                                  className={`p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors ${
                                    set.note ? 'text-purple-400' : 'text-zinc-600 hover:text-zinc-400'
                                  }`}
                                  title={set.note || 'Add set note'}
                                >
                                  <MessageSquare size={14} />
                                </button>
                              </div>
                              <div className="col-span-2 flex items-center justify-center gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleToggleSet(exercise.id, setIndex)}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${
                                    set.completed
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-white/[0.05] text-zinc-500 hover:text-white'
                                  }`}
                                >
                                  <Check size={16} />
                                </motion.button>
                                <button
                                  onClick={() => handleRemoveSet(exercise.id, setIndex)}
                                  className="text-zinc-600 hover:text-red-400 p-1 border-none bg-transparent cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Session Action Controls */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClearWorkout}
                      className="py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-red-400 bg-white/[0.04] hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      <Trash2 size={16} />
                      <span>Clear Session</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveWorkout}
                      className="py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      <Save size={16} />
                      <span>Save Workout</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Rest Timer & Volume Trends (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Rest Timer Card */}
              <div className="rounded-[24px] bg-white/[0.03] p-6 backdrop-blur-md space-y-4 border-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold uppercase tracking-wide text-white flex items-center gap-2">
                    <Timer className="text-cyan-400" size={18} />
                    Rest Timer
                  </h3>
                  {isTimerRunning && (
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">RUNNING</span>
                  )}
                </div>

                <div className="text-center py-2">
                  <div className="text-4xl font-black font-mono text-white tracking-tight" style={{ fontFamily: 'Kanit' }}>
                    {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono mt-1">Target rest time between heavy sets</p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => startRestTimer(sec)}
                      className="py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 font-bold text-xs font-mono text-zinc-300 transition-colors border-none cursor-pointer"
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                {isTimerRunning && (
                  <button
                    onClick={() => { setIsTimerRunning(false); setRestSeconds(0); }}
                    className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer"
                  >
                    Stop Timer
                  </button>
                )}
              </div>

              {/* 7-Day Volume Trends Chart Card */}
              <div className="rounded-[24px] bg-white/[0.03] p-6 backdrop-blur-md space-y-4 border-none">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wide text-white flex items-center gap-2">
                      <BarChart3 className="text-amber-400" size={18} />
                      7-Day Volume
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Total kg lifted per day</p>
                  </div>
                </div>

                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={(props) => <CustomTooltip {...props} />} />
                      <Bar dataKey="volume" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB CONTENT 2: TEMPLATES MANAGER ────────────────────────────────── */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white">Workout Routine Templates</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Create, manage and load customized workout routines</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateTemplate(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>New Template</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workoutTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="rounded-[24px] bg-white/[0.03] hover:bg-white/[0.05] p-6 space-y-4 flex flex-col justify-between border-none transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-base text-white uppercase tracking-wide">{tmpl.name}</h3>
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 border-none bg-transparent cursor-pointer"
                        title="Delete template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tmpl.exercises.map((ex, idx) => (
                        <div key={idx} className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                          <span>&bull; {ex.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{ex.sets.length} sets</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleLoadTemplate(tmpl)
                      setActiveTab('today')
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play size={14} />
                    <span>Load Into Session</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 3: HISTORY LOG ──────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white">Workout History</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Past completed training sessions</p>
              </div>
            </div>

            {workoutsList.length === 0 ? (
              <div className="rounded-[24px] bg-white/[0.02] p-12 text-center border-none">
                <EmptyState
                  icon={Activity}
                  title="No Saved Workout History"
                  message="Completed workout sessions will automatically appear here."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workoutsList.map((workout, idx) => {
                  const exercisesArr = Array.isArray(workout.exercises) ? workout.exercises : []
                  const vol = workout.volume ? Number(workout.volume) || 0 : exercisesArr.reduce((sum, ex) => {
                    const setsArr = Array.isArray(ex?.sets) ? ex.sets : []
                    return sum + setsArr.reduce((sSum, s) => sSum + ((Number(s?.weight) || 0) * (Number(s?.reps) || 0)), 0)
                  }, 0)
                  const exerciseCount = exercisesArr.length > 0 ? exercisesArr.length : (Number(workout.exercises) || 0)

                  return (
                    <div
                      key={workout._id || idx}
                      className="rounded-[24px] bg-white/[0.03] p-6 space-y-4 border-none"
                    >
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <div>
                          <h3 className="font-bold text-base text-white uppercase">{workout.date || 'Workout'}</h3>
                          <p className="text-xs text-zinc-500 font-mono">{exerciseCount} exercises logged</p>
                        </div>
                        <span className="text-lg font-bold font-mono text-cyan-400">{vol.toLocaleString()} kg</span>
                      </div>

                      {exercisesArr.length > 0 && (
                        <div className="space-y-2">
                          {exercisesArr.map((ex, exIdx) => {
                            const setsCount = Array.isArray(ex?.sets) ? ex.sets.length : (Number(ex?.sets) || 0)
                            return (
                              <div key={exIdx} className="text-xs text-zinc-400 flex justify-between items-center">
                                <span>{ex?.name || 'Exercise'}</span>
                                <span className="text-[10px] font-mono text-zinc-500">{setsCount} sets</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── ADD EXERCISE MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddTerminal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[28px] bg-[#121216] p-6 space-y-5 border-none shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Add New Exercise</h3>
                <button
                  onClick={() => setShowAddTerminal(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Exercise Name</label>
                  <input
                    type="text"
                    value={exerciseInput}
                    onChange={(e) => setExerciseInput(e.target.value)}
                    placeholder="e.g. Incline Dumbbell Press"
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Initial Weight (kg)</label>
                    <input
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-cyan-400 font-bold text-center focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Initial Reps</label>
                    <input
                      type="number"
                      value={repsInput}
                      onChange={(e) => setRepsInput(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-amber-400 font-bold text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddTerminal(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExercise}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  Add Exercise
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CREATE TEMPLATE MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[28px] bg-[#121216] p-6 space-y-5 border-none shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Save Routine Template</h3>
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Heavy Upper Body Blast"
                  className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                />
              </div>

              {currentWorkout.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    Saving {currentWorkout.length} exercise{currentWorkout.length > 1 ? 's' : ''} from active session:
                  </p>
                  {currentWorkout.map((ex, i) => (
                    <div key={i} className="text-xs text-zinc-300 bg-white/[0.03] p-2.5 rounded-xl flex justify-between items-center">
                      <span className="font-semibold">{ex.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{(ex.sets || []).length} sets</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Add Exercises To Template</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tmplExerciseInput}
                      onChange={(e) => setTmplExerciseInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTmplExercise() }}
                      placeholder="e.g. Incline Bench Press"
                      className="flex-1 bg-white/[0.05] border-none rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddTmplExercise}
                      className="px-3 py-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors"
                    >
                      + Add
                    </button>
                  </div>

                  {customTmplExercises.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {customTmplExercises.map((ex, idx) => (
                        <div key={idx} className="text-xs text-zinc-300 bg-white/[0.04] px-3 py-2 rounded-xl flex justify-between items-center">
                          <span className="font-medium">{ex.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTmplExercise(idx)}
                            className="text-zinc-500 hover:text-red-400 text-xs border-none bg-transparent cursor-pointer p-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500 italic">No exercises added yet. Type an exercise name above and click + Add.</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── SET NOTE MODAL ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[28px] bg-[#121216] p-6 space-y-5 border-none shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Set Note / RPE</h3>
                <button
                  onClick={() => setShowNoteModal(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. RPE 9, slight elbow pause, clean form..."
                  className="w-full bg-white/[0.05] border-none rounded-2xl p-4 text-sm text-white focus:outline-none resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNoteModal(null)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  )
}

export default WorkoutTracker