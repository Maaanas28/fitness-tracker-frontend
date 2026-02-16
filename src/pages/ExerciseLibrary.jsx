import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Search, Dumbbell, Target, Zap, 
  TrendingUp, Activity, Heart, Filter, X, Play, ChevronRight, Plus,
  Repeat, Star, Sparkles // <-- ADDED Sparkles icon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWithGemini } from '../utils/gemini'
import { ExerciseSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import toast from 'react-hot-toast'

// --- EXERCISE DATABASE ---
const EXERCISE_DATA = {
  chest: [
    { id: 'bench-press', name: 'Barbell Bench Press', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-5', reps: '6-12', description: 'Compound movement for overall chest development.', tips: 'Retract scapula, keep feet planted.', videoId: 'rT7DgCr-3pg', substitutions: ['dumbell-press', 'pushup', 'dips'] },
    { id: 'incline-bench', name: 'Incline Bench Press', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', description: 'Targets the upper clavicular head of the pecs.', tips: 'Set bench to 30-45 degrees.', videoId: 'SrqOu55lrYU', substitutions: ['incline-db-press', 'dips'] },
    { id: 'decline-bench', name: 'Decline Bench Press', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', description: 'Targets lower chest.', tips: 'Do not bounce the bar off your chest.', videoId: 'LfyQBUKR8SE', substitutions: ['dips', 'pushup'] },
    { id: 'dumbell-press', name: 'Flat Dumbbell Press', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3-4', reps: '8-12', description: 'Allows for greater range of motion than barbell.', tips: 'Bring weights down to chest level.', videoId: 'VmB1G1K7v94', substitutions: ['bench-press', 'pushup'] },
    { id: 'incline-db-press', name: 'Incline DB Press', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3-4', reps: '8-12', description: 'Upper chest isolation with dumbbells.', tips: 'Control the weights on the way down.', videoId: '4h63bSsdQXg', substitutions: ['incline-bench', 'dips'] },
    { id: 'db-fly', name: 'Dumbbell Fly', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '12-15', description: 'Isolation movement for chest width.', tips: 'Keep a slight bend in elbows.', videoId: 'eozdVDA78K0', substitutions: ['cable-crossover', 'pec-deck'] },
    { id: 'cable-crossover', name: 'Cable Crossover', difficulty: 'Intermediate', equipment: 'Cable', sets: '3', reps: '15-20', description: 'Constant tension for inner chest.', tips: 'Squeeze at the peak for 1 second.', videoId: 'taI4XduLpTk', substitutions: ['db-fly', 'pec-deck'] },
    { id: 'pushup', name: 'Push-Up', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: 'AMRAP', description: 'Classic bodyweight builder.', tips: 'Keep body in a straight line.', videoId: 'IODxDxX7oi4', substitutions: ['bench-press', 'dips'] },
    { id: 'dips', name: 'Chest Dips', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', description: 'Lower chest and tricep builder.', tips: 'Lean forward to target chest.', videoId: '2z8JmcrW-As', substitutions: ['bench-press', 'pushup'] }
  ],
  back: [
    { id: 'deadlift', name: 'Barbell Deadlift', difficulty: 'Advanced', equipment: 'Barbell', sets: '3-5', reps: '3-6', description: 'Total back and posterior chain builder.', tips: 'Keep spine neutral.', videoId: 'op9kVnSso6Q', substitutions: ['rdl', 'hyperextension'] },
    { id: 'pullup', name: 'Pull-Up', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '6-12', description: 'Vertical pull for lats.', tips: 'Full extension at the bottom.', videoId: 'eGo4IYlbE5g', substitutions: ['lat-pulldown', 'single-arm-row'] },
    { id: 'bent-row', name: 'Bent Over Row', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', description: 'Thickness for mid-back.', tips: 'Pull bar to lower chest/waist.', videoId: '9efgcAjQe7E', substitutions: ['tbar-row', 'seated-row'] },
    { id: 'lat-pulldown', name: 'Lat Pulldown', difficulty: 'Beginner', equipment: 'Cable', sets: '3-4', reps: '10-12', description: 'Width builder for lats.', tips: 'Drive elbows down, not back.', videoId: 'CAwf7n6Luuc', substitutions: ['pullup', 'single-arm-row'] },
    { id: 'seated-row', name: 'Seated Cable Row', difficulty: 'Beginner', equipment: 'Cable', sets: '3-4', reps: '10-12', description: 'Mid-back thickness.', tips: 'Squeeze shoulder blades together.', videoId: 'GZbfZ033f74', substitutions: ['bent-row', 'single-arm-row'] },
    { id: 'tbar-row', name: 'T-Bar Row', difficulty: 'Intermediate', equipment: 'Machine', sets: '3-4', reps: '8-12', description: 'Supported heavy rowing.', tips: 'Keep chest on the pad.', videoId: 'j3Igk5nyZE4', substitutions: ['bent-row', 'seated-row'] },
    { id: 'single-arm-row', name: 'Dumbbell Row', difficulty: 'Beginner', equipment: 'Dumbbell', sets: '3', reps: '10-12', description: 'Unilateral lat work.', tips: 'Keep torso parallel to ground.', videoId: 'pYcpY20QaE8', substitutions: ['bent-row', 'lat-pulldown'] },
    { id: 'hyperextension', name: 'Back Extension', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15', description: 'Lower back endurance.', tips: 'Do not hyperextend at the top.', videoId: 'ph3pddpKzzw', substitutions: ['deadlift', 'rdl'] }
  ],
  legs: [
    { id: 'squat', name: 'Barbell Squat', difficulty: 'Advanced', equipment: 'Barbell', sets: '3-5', reps: '5-8', description: 'Overall leg mass builder.', tips: 'Knees track over toes.', videoId: '-bJIpOq-LWk', substitutions: ['leg-press', 'goblet-squat'] },
    { id: 'leg-press', name: 'Leg Press', difficulty: 'Beginner', equipment: 'Machine', sets: '3-4', reps: '10-15', description: 'Heavy quad loading.', tips: 'Do not lock knees.', videoId: 'IZxyjW7MPJQ', substitutions: ['squat', 'bulgarian'] },
    { id: 'lunge', name: 'Walking Lunge', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '12 steps', description: 'Unilateral leg strength.', tips: 'Keep torso upright.', videoId: 'tQNktxPkSeE', substitutions: ['bulgarian', 'squat'] },
    { id: 'leg-ext', name: 'Leg Extension', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '15-20', description: 'Quad isolation.', tips: 'Squeeze quads at the top.', videoId: 'YyvSfVjQeL0', substitutions: ['squat', 'leg-press'] },
    { id: 'leg-curl', name: 'Lying Leg Curl', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', description: 'Hamstring isolation.', tips: 'Keep hips pressed into pad.', videoId: '1Tq3QdYUuHs', substitutions: ['rdl', 'deadlift'] },
    { id: 'rdl', name: 'Romanian Deadlift', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', description: 'Hamstring and glute focus.', tips: 'Push hips back, keep soft knees.', videoId: 'JCXUYuzwNrM', substitutions: ['deadlift', 'leg-curl'] },
    { id: 'calf-raise', name: 'Standing Calf Raise', difficulty: 'Beginner', equipment: 'Machine', sets: '4', reps: '15-20', description: 'Calf mass.', tips: 'Full stretch at bottom.', videoId: 'baEXLy09Ncc', substitutions: [] },
    { id: 'goblet-squat', name: 'Goblet Squat', difficulty: 'Beginner', equipment: 'Dumbbell', sets: '3', reps: '12', description: 'Quad focus, easier on back.', tips: 'Hold weight at chest.', videoId: 'MeIiIdhvXT4', substitutions: ['squat', 'leg-press'] },
    { id: 'bulgarian', name: 'Bulgarian Split Squat', difficulty: 'Advanced', equipment: 'Dumbbell', sets: '3', reps: '8-10', description: 'Single leg stability and mass.', tips: 'Rear foot elevated.', videoId: '2C-uNgKwPLE', substitutions: ['lunge', 'squat'] }
  ],
  shoulders: [
    { id: 'ohp', name: 'Overhead Press', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-5', reps: '5-8', description: 'Compound shoulder mass.', tips: 'Tight core, do not lean back.', videoId: '2yjwXTZQDDI', substitutions: ['db-press', 'arnold'] },
    { id: 'db-press', name: 'Seated DB Press', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3-4', reps: '8-12', description: 'Anterior and lateral delt.', tips: 'Press in an arc.', videoId: 'qEwKCR5JCog', substitutions: ['ohp', 'arnold'] },
    { id: 'lat-raise', name: 'Lateral Raise', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '4', reps: '15-20', description: 'Side delt width.', tips: 'Lead with elbows.', videoId: '3VcKaXpzqRo', substitutions: ['upright-row'] },
    { id: 'front-raise', name: 'Front Raise', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', description: 'Front delt isolation.', tips: 'Controlled tempo.', videoId: 'hRJ6tR5-if0', substitutions: ['ohp', 'db-press'] },
    { id: 'rev-fly', name: 'Reverse Fly', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '15', description: 'Rear delt isolation.', tips: 'Bend forward, fly arms out.', videoId: '-_hx_2fp_Jw', substitutions: ['face-pull'] },
    { id: 'upright-row', name: 'Upright Row', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', description: 'Traps and side delts.', tips: 'Do not pull too high.', videoId: 'amCU-ziHITM', substitutions: ['lat-raise'] },
    { id: 'arnold', name: 'Arnold Press', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', description: 'Full shoulder rotation.', tips: 'Twist dumbbells as you press.', videoId: '3ml7BH7mNwQ', substitutions: ['ohp', 'db-press'] }
  ],
  arms: [
    { id: 'bb-curl', name: 'Barbell Curl', difficulty: 'Beginner', equipment: 'Barbell', sets: '3-4', reps: '8-12', description: 'Mass builder for biceps.', tips: 'Keep elbows tucked.', videoId: 'kwG2ipFRgfo', substitutions: ['db-curl', 'hammer'] },
    { id: 'db-curl', name: 'Dumbbell Curl', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12', description: 'Standard curl.', tips: 'Supinate (twist) wrist at top.', videoId: 'ykJmrZ5v0Oo', substitutions: ['bb-curl', 'hammer'] },
    { id: 'hammer', name: 'Hammer Curl', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12', description: 'Brachialis and forearm.', tips: 'Thumbs up grip.', videoId: 'zC3nLlEvin4', substitutions: ['bb-curl', 'db-curl'] },
    { id: 'skull', name: 'Skullcrushers', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', description: 'Tricep mass.', tips: 'Lower to forehead.', videoId: 'd_KZxkY_0cM', substitutions: ['pushdown', 'overhead-ext'] },
    { id: 'pushdown', name: 'Cable Pushdown', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '15', description: 'Tricep lateral head.', tips: 'Keep elbows pinned.', videoId: '2-LAMcpzODU', substitutions: ['skull', 'overhead-ext'] },
    { id: 'overhead-ext', name: 'Overhead Extension', difficulty: 'Intermediate', equipment: 'Dumbbell', sets: '3', reps: '12', description: 'Tricep long head.', tips: 'Full stretch behind head.', videoId: 'YbX7Wd8jQ-Q', substitutions: ['skull', 'pushdown'] },
    { id: 'conc-curl', name: 'Concentration Curl', difficulty: 'Beginner', equipment: 'Dumbbell', sets: '3', reps: '12', description: 'Bicep peak.', tips: 'Elbow against inner thigh.', videoId: '0AUGkch3tzc', substitutions: ['db-curl', 'hammer'] }
  ],
  core: [
    { id: 'crunch', name: 'Crunches', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '20', description: 'Upper abs.', tips: 'Exhale as you crunch.', videoId: 'Xyd_fa5zoEU', substitutions: ['leg-raise', 'cable-crunch'] },
    { id: 'leg-raise', name: 'Hanging Leg Raise', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '15', description: 'Lower abs.', tips: 'Keep lower back pressed to floor.', videoId: 'Pr1ieGZ5atk', substitutions: ['crunch', 'plank'] },
    { id: 'plank', name: 'Plank', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '60s', description: 'Core stability.', tips: 'Squeeze glutes.', videoId: 'pSHjTRCQxIw', substitutions: ['crunch', 'russian-twist'] },
    { id: 'russian-twist', name: 'Russian Twist', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '20', description: 'Obliques.', tips: 'Rotate shoulders, not just hands.', videoId: 'wkD8rjkodUI', substitutions: ['leg-raise', 'm-climber'] },
    { id: 'm-climber', name: 'Mountain Climber', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30s', description: 'Cardio core.', tips: 'Keep hips low.', videoId: 'nmwgirgXLYM', substitutions: ['plank', 'crunch'] },
    { id: 'cable-crunch', name: 'Cable Crunch', difficulty: 'Intermediate', equipment: 'Cable', sets: '3', reps: '15', description: 'Weighted abs.', tips: 'Curl inwards, do not hinge at hips.', videoId: 'ByZJuk85YuE', substitutions: ['crunch', 'leg-raise'] }
  ]
};

function ExerciseLibrary() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('chest')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState([])
  const [expandedExercise, setExpandedExercise] = useState(null)
  const [showSubstitutions, setShowSubstitutions] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteExercises')
    return saved ? JSON.parse(saved) : []
  })

  // Show only favorites toggle
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // AI Recommendation state
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(false)

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteExercises', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
  setTimeout(() => setIsLoading(false), 800)
}, [])

  const categories = [
    { id: 'chest', name: 'Chest', icon: Heart, color: 'red' },
    { id: 'back', name: 'Back', icon: Activity, color: 'blue' },
    { id: 'arms', name: 'Arms', icon: Zap, color: 'orange' },
    { id: 'legs', name: 'Legs', icon: TrendingUp, color: 'purple' },
    { id: 'shoulders', name: 'Shoulders', icon: Target, color: 'teal' },
    { id: 'core', name: 'Core', icon: Dumbbell, color: 'amber' }
  ]

  // Flatten all exercises for global search
  const allExercises = Object.values(EXERCISE_DATA).flat();
  const allEquipment = [...new Set(allExercises.map(ex => ex.equipment))]
  const allDifficulties = ['Beginner', 'Intermediate', 'Advanced']

  const toggleFavorite = (exerciseId) => {
  setFavorites(prev => {
    if (prev.includes(exerciseId)) {
      toast.success('Removed from favorites', { icon: '⭐' })
      return prev.filter(id => id !== exerciseId)
    } else {
      toast.success('Added to favorites!', { icon: '⭐' })
      return [...prev, exerciseId]
    }
  })
}

  // Check if exercise is favorite
  const isFavorite = (exerciseId) => favorites.includes(exerciseId)

  // Get AI recommendations based on search
  const getAIRecommendations = async () => {
    if (!searchTerm.trim()) return
    
    setIsLoadingAI(true)
    setAiError(false)
    
    const prompt = `Suggest 5 exercises for someone searching for "${searchTerm}" related to fitness and strength training.
    
    Format as JSON array like this:
    [
      {
        "name": "Exercise Name",
        "description": "Brief description",
        "difficulty": "Beginner/Intermediate/Advanced",
        "equipment": "Required equipment"
      }
    ]
    
    Make them realistic and effective.`
    
    try {
      const aiResponse = await generateWithGemini(prompt)
      
      if (aiResponse) {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const recommendations = JSON.parse(jsonMatch[0])
          setAiRecommendations(recommendations)
          setShowAIRecommendations(true)
        } else {
          throw new Error('No JSON found')
        }
      } else {
        setAiError(true)
      }
    } catch (error) {
      console.error('AI recommendation failed:', error)
      setAiError(true)
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Logic: Show category items OR search results OR favorites
  let baseList = []
  if (showOnlyFavorites) {
    baseList = allExercises.filter(ex => favorites.includes(ex.id))
  } else {
    baseList = searchTerm ? allExercises : (EXERCISE_DATA[selectedCategory] || [])
  }

  const filteredExercises = baseList.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty.length === 0 || selectedDifficulty.includes(exercise.difficulty)
    const matchesEquipment = selectedEquipment.length === 0 || selectedEquipment.includes(exercise.equipment)
    return matchesSearch && matchesDifficulty && matchesEquipment
  })

  // Get substitution exercises
  const getSubstitutions = (exercise) => {
    if (!exercise.substitutions || exercise.substitutions.length === 0) return []
    
    return exercise.substitutions
      .map(subId => {
        for (const category in EXERCISE_DATA) {
          const found = EXERCISE_DATA[category].find(ex => ex.id === subId)
          if (found) return found
        }
        return null
      })
      .filter(ex => ex !== null)
  }

  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulty(prev => prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty])
  }

  const toggleEquipment = (equipment) => {
    setSelectedEquipment(prev => prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment])
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400'
      case 'Intermediate': return 'bg-blue-500/20 text-blue-400'
      case 'Advanced': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500 overflow-x-hidden">
      
      {/* Header */}
      <motion.header 
        className="bg-black/60 backdrop-blur-xl p-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-6">
          <motion.button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 rounded-2xl hover:bg-red-600 transition-all border border-white/5 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Library_Database</h1>
            <p className="text-[10px] text-red-500 font-bold tracking-[0.3em] uppercase mt-1">Status: Online</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* AI Button - Shows when searching */}
          {searchTerm && (
            <motion.button 
              onClick={getAIRecommendations}
              disabled={isLoadingAI}
              className="p-3 bg-purple-600/20 hover:bg-purple-600/40 transition-all rounded-xl border border-purple-500/30 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Get AI recommendations"
            >
              {isLoadingAI ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={20} className="text-purple-400" />
                </motion.div>
              ) : (
                <Sparkles size={20} className="text-purple-400" />
              )}
              <span className="text-xs font-medium text-purple-400 hidden md:inline">AI Suggest</span>
            </motion.button>
          )}
          
          {/* Favorites Toggle Button */}
          <motion.button 
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`p-3 transition-all rounded-xl border ${
              showOnlyFavorites 
                ? 'bg-yellow-600 border-yellow-500 text-white' 
                : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={showOnlyFavorites ? 'Show All Exercises' : 'Show Favorites Only'}
          >
            <Star size={20} fill={showOnlyFavorites ? 'white' : 'none'} />
          </motion.button>
          <motion.button onClick={() => setShowFilters(!showFilters)} className="p-3 bg-white/5 hover:bg-red-600 transition-all rounded-xl border border-white/5">
            <Filter size={20} />
          </motion.button>
        </div>
      </motion.header>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-6" onClick={() => setShowFilters(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#0a0a0a] rounded-[2.5rem] w-full max-w-md p-10 relative border border-white/10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowFilters(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-10 text-white">Filtering_Parameters</h2>
              
              <div className="space-y-10">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-4">Difficulty_Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {allDifficulties.map(d => (
                      <button key={d} onClick={() => toggleDifficulty(d)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedDifficulty.includes(d) ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-4">Equipment_ID</h3>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                    {allEquipment.map(e => (
                      <button key={e} onClick={() => toggleEquipment(e)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedEquipment.includes(e) ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'}`}>{e}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH_EXERCISE_ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-[#0a0a0a] text-white pl-16 pr-6 py-5 rounded-[2rem] border border-white/5 focus:border-red-600/50 outline-none transition-all font-black uppercase text-xs tracking-[0.2em] placeholder:text-zinc-800 shadow-2xl" 
            />
          </div>
        </motion.div>

        {/* AI Recommendations Modal */}
        <AnimatePresence>
          {showAIRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-400" size={28} />
                  <h2 className="text-2xl font-black text-white">AI RECOMMENDATIONS</h2>
                </div>
                <button
                  onClick={() => setShowAIRecommendations(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {aiError ? (
                <p className="text-red-400 text-center py-4">Failed to get recommendations. Try again.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiRecommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-black/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                    >
                      <Sparkles size={20} className="text-purple-400 mb-3" />
                      <h3 className="text-xl font-bold text-white mb-2">{rec.name}</h3>
                      <p className="text-sm text-zinc-400 mb-4">{rec.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getDifficultyColor(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                          {rec.equipment}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {categories.map((cat, idx) => (
            <motion.button key={cat.id} onClick={() => {
              setSelectedCategory(cat.id)
              setShowOnlyFavorites(false)
            }} className={`flex-shrink-0 px-8 py-4 rounded-2xl transition-all border flex items-center gap-4 ${selectedCategory === cat.id && !showOnlyFavorites ? 'bg-red-600 border-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.3)]' : 'bg-[#0a0a0a] border-white/5 text-zinc-500 hover:border-white/20'}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <cat.icon size={18} strokeWidth={3} />
              <span className="font-black text-xs uppercase tracking-[0.2em]">{cat.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Favorites info bar */}
        {showOnlyFavorites && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-6 py-3"
          >
            <div className="flex items-center gap-3">
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <span className="text-yellow-500 font-bold">Showing {filteredExercises.length} Favorite Exercises</span>
            </div>
            <button
              onClick={() => setShowOnlyFavorites(false)}
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Show All
            </button>
          </motion.div>
        )}
        {isLoading ? (
          <ExerciseSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedCategory + searchTerm + showOnlyFavorites} 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex, idx) => (
                  <motion.div 
                    key={ex.id} 
                    className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-red-600/30 transition-all group shadow-2xl" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.05 }} 
                    whileHover={{ y: -5 }}
                  >
                    
                    {/* Image Container */}
                    <div className="relative aspect-[16/9] bg-zinc-900 cursor-pointer overflow-hidden group" onClick={() => setExpandedExercise(ex)}>
                      <img 
                        src={getThumbnailUrl(ex.videoId)}
                        alt={ex.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm group-hover:bg-red-600/80 transition-colors">
                          <Play fill="white" size={32} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-[8px] font-black px-3 py-1.5 rounded-full text-red-500 border border-red-600/50 uppercase tracking-widest z-20">{ex.equipment}</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />
                      
                      {/* Favorite Star on Image */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(ex.id)
                        }}
                        className="absolute top-6 left-6 z-30 p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-yellow-500/20 transition-all"
                      >
                        <Star 
                          size={16} 
                          className={isFavorite(ex.id) ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-400'} 
                        />
                      </button>
                    </div>

                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{ex.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getDifficultyColor(ex.difficulty)}`}>{ex.difficulty}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Target_Sets</p>
                          <p className="text-xl font-black text-white italic">{ex.sets}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Rep_Range</p>
                          <p className="text-xl font-black text-white italic">{ex.reps}</p>
                        </div>
                      </div>

                      {/* Substitutions Button */}
                      {ex.substitutions && ex.substitutions.length > 0 && (
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowSubstitutions(showSubstitutions === ex.id ? null : ex.id)}
                            className="w-full py-3 bg-white/5 hover:bg-amber-500/20 text-white hover:text-amber-400 transition-all rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-white/5"
                          >
                            <Repeat size={14} />
                            {showSubstitutions === ex.id ? 'Hide Alternatives' : 'Show Alternatives'}
                          </button>

                          <AnimatePresence>
                            {showSubstitutions === ex.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 mt-2 border-t border-white/5">
                                  <p className="text-[8px] text-amber-500 font-black uppercase tracking-widest mb-3">ALTERNATIVE EXERCISES</p>
                                  <div className="space-y-2">
                                    {getSubstitutions(ex).map(sub => (
                                      <button
                                        key={sub.id}
                                        onClick={() => {
                                          setExpandedExercise(sub)
                                          setShowSubstitutions(null)
                                        }}
                                        className="w-full text-left p-3 bg-white/5 hover:bg-amber-500/10 rounded-xl transition-all group/sub"
                                      >
                                        <p className="text-sm font-bold text-white group-hover/sub:text-amber-400">{sub.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[8px] text-zinc-500 uppercase">{sub.equipment}</span>
                                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                          <span className={`text-[8px] uppercase ${getDifficultyColor(sub.difficulty)}`}>{sub.difficulty}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <button onClick={() => setExpandedExercise(ex)} className="w-full py-4 bg-white text-black hover:bg-red-600 hover:text-white transition-all rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group">
                        <Play size={16} strokeWidth={4} fill="currentColor" /> Watch_Tutorial
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-white/10 rounded-[2rem]">
                  <Search className="mx-auto text-zinc-700 mb-4" size={48} />
                  <p className="text-zinc-500 font-black uppercase tracking-widest">No matching protocols found.</p>
                  <button onClick={() => { 
                    setSearchTerm(''); 
                    setSelectedDifficulty([]); 
                    setSelectedEquipment([]);
                    setShowOnlyFavorites(false);
                  }} className="mt-6 text-red-500 font-bold uppercase tracking-wider text-xs hover:underline">Clear Filters</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {expandedExercise && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[70] flex items-center justify-center p-6 overflow-y-auto" onClick={() => setExpandedExercise(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-3xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden border border-red-600/30 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="relative aspect-video bg-black">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${expandedExercise.videoId}?autoplay=1`} 
                  title={expandedExercise.name} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
                <button onClick={() => setExpandedExercise(null)} className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-all border border-white/10 z-20"><X size={24} /></button>
                
                {/* Favorite button in modal */}
                <button
                  onClick={() => toggleFavorite(expandedExercise.id)}
                  className="absolute top-4 left-4 p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-yellow-500/20 transition-all border border-white/10 z-20 flex items-center gap-2"
                >
                  <Star 
                    size={20} 
                    className={isFavorite(expandedExercise.id) ? 'text-yellow-500 fill-yellow-500' : 'text-white'} 
                  />
                  <span className="text-white text-sm">
                    {isFavorite(expandedExercise.id) ? 'Favorited' : 'Add to Favorites'}
                  </span>
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">{expandedExercise.name}</h2>
                  <p className="text-zinc-400 text-lg font-medium leading-relaxed">{expandedExercise.description}</p>
                </div>
                <div className="p-6 bg-red-600/10 border border-red-600/30 rounded-3xl">
                  <p className="text-red-500 font-black uppercase text-[10px] mb-3 tracking-[0.3em] flex items-center gap-2"><Zap size={16} /> Coach_Tip</p>
                  <p className="text-white font-medium italic">"{expandedExercise.tips}"</p>
                </div>

                {/* Substitutions in Modal */}
                {expandedExercise.substitutions && expandedExercise.substitutions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-amber-500 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                      <Repeat size={14} /> Alternatives
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {getSubstitutions(expandedExercise).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setExpandedExercise(sub)
                          }}
                          className="text-left p-4 bg-white/5 hover:bg-amber-500/10 rounded-xl transition-all group"
                        >
                          <p className="font-bold text-white group-hover:text-amber-400">{sub.name}</p>
                          <p className="text-xs text-zinc-500 mt-1">{sub.equipment}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl" onClick={() => setExpandedExercise(null)}>Dismiss_Module</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExerciseLibrary