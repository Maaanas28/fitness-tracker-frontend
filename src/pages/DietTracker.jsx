import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Trash2, Radio, BarChart3, Flame, Database, Activity,
  Sparkles, ChefHat, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { generateWithAI } from '../utils/ai'
import { DietSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'

// Custom cyberpunk tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black/90 border border-cyan-500/30 rounded-xl p-4 shadow-lg shadow-cyan-500/20 backdrop-blur-sm">
      <p className="text-cyan-400 font-bold text-sm mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
          <span className="text-xs text-gray-300">Calories:</span>
          <span className="font-bold text-cyan-300">{payload[0]?.value?.toLocaleString() || 0} kcal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
          <span className="text-xs text-gray-300">Protein:</span>
          <span className="font-bold text-amber-300">{payload[1]?.value || 0}g</span>
        </div>
      </div>
      <div className="mt-2 px-2 py-1 bg-cyan-500/10 rounded text-[10px] font-bold text-cyan-400">
        TARGET: {CALORIE_GOAL?.toLocaleString() || 2500} kcal
      </div>
    </div>
  )
}

function DietTracker() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  
  // Load nutrition goals from Calculator
  const [nutritionGoals, setNutritionGoals] = useState(() => {
    const saved = localStorage.getItem('userCalorieData')
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    
    if (saved) {
      try {
        const data = JSON.parse(saved)
        return {
          calories: data.goalCalories || data.maintenanceCalories || 2500,
          protein: data.protein || Math.round((profile.currentWeight || 70) * 2.2),
          carbs: data.carbs || 250,
          fats: data.fats || 83
        }
      } catch (e) {
        console.error('Failed to parse calorie data:', e)
      }
    }
    
    // Fallback based on weight if available
    const weight = profile.currentWeight || 70
    return {
      calories: 2500,
      protein: Math.round(weight * 2.2),
      carbs: 250,
      fats: 83
    }
  })

  const CALORIE_GOAL = nutritionGoals.calories
  const PROTEIN_GOAL = nutritionGoals.protein

  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('dailyMeals')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load meals:', error)
        return { breakfast: [], lunch: [], dinner: [], snacks: [] }
      }
    }
    return {
      breakfast: [
        { id: 1, name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 54, fats: 8 },
        { id: 2, name: 'Greek Yogurt', calories: 150, protein: 15, carbs: 12, fats: 4 }
      ],
      lunch: [
        { id: 3, name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 25, fats: 22 },
        { id: 4, name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fats: 2 }
      ],
      dinner: [],
      snacks: [
        { id: 5, name: 'Almonds (30g)', calories: 170, protein: 6, carbs: 6, fats: 15 }
      ]
    }
  })

  useEffect(() => {
    localStorage.setItem('dailyMeals', JSON.stringify(meals))
  }, [meals])

  const [todayLog, setTodayLog] = useState(() => {
    const saved = localStorage.getItem('todayLog')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load today log:', error)
        return []
      }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('todayLog', JSON.stringify(todayLog))
  }, [todayLog])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const historyData = [
    { day: 'MON', cals: 2100, pro: 160 },
    { day: 'TUE', cals: 2400, pro: 180 },
    { day: 'WED', cals: 1900, pro: 140 },
    { day: 'THU', cals: 2600, pro: 195 },
    { day: 'FRI', cals: 2300, pro: 170 },
    { day: 'SAT', cals: 2800, pro: 150 },
    { day: 'SUN', cals: 2200, pro: 165 },
  ]

  const [entry, setEntry] = useState({ name: '', calories: '', protein: '' })
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(false)

  const totals = useMemo(() => {
    return todayLog.reduce((acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein
    }), { calories: 0, protein: 0 })
  }, [todayLog])

  const calProgress = Math.min((totals.calories / CALORIE_GOAL) * 100, 100)
  const proProgress = Math.min((totals.protein / PROTEIN_GOAL) * 100, 100)

  // AI MEAL SUGGESTIONS - FIXED
  const getAIMealSuggestions = async () => {
    setIsLoadingAI(true)
    setAiError(false)
    
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    
    let userGoal = 'maintain'
    const fitnessGoal = userProfile.fitnessGoal || ''
    
    if (fitnessGoal.toLowerCase().includes('loss') || fitnessGoal.toLowerCase().includes('weight')) {
      userGoal = 'weight_loss'
    } else if (fitnessGoal.toLowerCase().includes('gain') || fitnessGoal.toLowerCase().includes('muscle') || fitnessGoal.toLowerCase().includes('strength')) {
      userGoal = 'muscle_gain'
    }
    
    const hour = new Date().getHours()
    let mealType = 'meal'
    if (hour < 11) mealType = 'breakfast'
    else if (hour < 15) mealType = 'lunch'
    else if (hour < 19) mealType = 'dinner'
    else mealType = 'snack'
    
    const remainingCalories = Math.max(CALORIE_GOAL - totals.calories, 0)
    const remainingProtein = Math.max(PROTEIN_GOAL - totals.protein, 0)
    
    let goalInstruction = ''
    if (userGoal === 'weight_loss') {
      goalInstruction = 'Focus on low-calorie, high-volume meals that keep you full. Prioritize lean proteins and vegetables.'
    } else if (userGoal === 'muscle_gain') {
      goalInstruction = 'Focus on high-protein meals with good carbs for energy. Include quality protein sources like chicken, fish, eggs, or tofu.'
    } else {
      goalInstruction = 'Suggest balanced meals with good nutrition - moderate protein, healthy carbs, and fats.'
    }
    
    const prompt = `Suggest 3 healthy ${mealType} ideas for someone who wants to ${userGoal.replace('_', ' ')}.
    
    Their remaining daily targets:
    - Calories left: ${Math.round(remainingCalories)} kcal
    - Protein left: ${Math.round(remainingProtein)}g
    
    ${goalInstruction}
    
    Format as JSON array exactly like this:
    [
      {
        "name": "Meal Name",
        "calories": 450,
        "protein": 35,
        "description": "Brief description with main ingredients"
      }
    ]
    
    Make sure each meal fits within the remaining calories (or close to it) and helps meet protein goals.
    Return ONLY the JSON array, no other text.`
    
    try {
      const aiResponse = await generateWithAI(prompt, 'meal')
      
      if (aiResponse) {
        try {
          let suggestions
          if (typeof aiResponse === 'string') {
            // Try to extract JSON from string
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              suggestions = JSON.parse(jsonMatch[0])
            } else {
              // Try parsing the whole string
              suggestions = JSON.parse(aiResponse)
            }
          } else {
            suggestions = aiResponse
          }
          setAiSuggestions(suggestions)
          setShowAISuggestions(true)
        } catch (e) {
          console.error('Failed to parse AI response:', e)
          const fallbackSuggestions = getSmartFallbackMeals(userGoal, mealType, remainingCalories, remainingProtein)
          setAiSuggestions(fallbackSuggestions)
          setShowAISuggestions(true)
        }
      } else {
        const fallbackSuggestions = getSmartFallbackMeals(userGoal, mealType, remainingCalories, remainingProtein)
        setAiSuggestions(fallbackSuggestions)
        setShowAISuggestions(true)
      }
    } catch (error) {
      console.error('AI suggestion failed:', error)
      setAiError(true)
      const fallbackSuggestions = getSmartFallbackMeals(userGoal, mealType, remainingCalories, remainingProtein)
      setAiSuggestions(fallbackSuggestions)
      setShowAISuggestions(true)
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Smart fallback meals based on goal
  const getSmartFallbackMeals = (goal, mealType, remainingCals, remainingProtein) => {
    const maxCal = Math.min(remainingCals, 700)
    
    if (goal === 'weight_loss') {
      return [
        { 
          name: 'Lean Protein Salad', 
          calories: Math.min(350, maxCal), 
          protein: Math.min(30, remainingProtein), 
          description: 'Grilled chicken breast on mixed greens with cucumber, tomatoes, and light vinaigrette' 
        },
        { 
          name: 'Vegetable Stir-fry', 
          calories: Math.min(300, maxCal), 
          protein: Math.min(20, remainingProtein), 
          description: 'Mixed vegetables with tofu or shrimp in light soy sauce, served with a small portion of brown rice' 
        },
        { 
          name: 'Greek Yogurt Bowl', 
          calories: Math.min(250, maxCal), 
          protein: Math.min(25, remainingProtein), 
          description: 'Non-fat Greek yogurt with fresh berries and a sprinkle of almonds' 
        }
      ]
    } else if (goal === 'muscle_gain') {
      return [
        { 
          name: 'Chicken & Rice Bowl', 
          calories: Math.min(600, maxCal), 
          protein: Math.min(45, remainingProtein), 
          description: 'Grilled chicken breast with brown rice, steamed broccoli, and avocado' 
        },
        { 
          name: 'Protein Pasta', 
          calories: Math.min(550, maxCal), 
          protein: Math.min(35, remainingProtein), 
          description: 'Whole wheat pasta with lean ground turkey, marinara sauce, and Parmesan' 
        },
        { 
          name: 'Post-Workout Shake', 
          calories: Math.min(400, maxCal), 
          protein: Math.min(40, remainingProtein), 
          description: 'Whey protein, banana, peanut butter, and oats blended with milk' 
        }
      ]
    } else {
      return [
        { 
          name: 'Balanced Plate', 
          calories: Math.min(500, maxCal), 
          protein: Math.min(30, remainingProtein), 
          description: 'Grilled salmon, quinoa, and roasted vegetables' 
        },
        { 
          name: 'Turkey Sandwich', 
          calories: Math.min(450, maxCal), 
          protein: Math.min(25, remainingProtein), 
          description: 'Whole grain bread with turkey, avocado, spinach, and side of fruit' 
        },
        { 
          name: 'Buddha Bowl', 
          calories: Math.min(550, maxCal), 
          protein: Math.min(20, remainingProtein), 
          description: 'Mixed grains, chickpeas, roasted sweet potatoes, kale, and tahini dressing' 
        }
      ]
    }
  }

  const handleAddEntry = () => {
    if (!entry.name) {
      toast.error('Please enter a food name')
      return
    }
    if (!entry.calories) {
      toast.error('Please enter calories')
      return
    }
    
    const newEntry = {
      id: Date.now(),
      name: entry.name.toUpperCase().replace(/\s+/g, '_'),
      calories: parseInt(entry.calories),
      protein: parseInt(entry.protein) || Math.round(parseInt(entry.calories) * 0.25),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
    setTodayLog([newEntry, ...todayLog])
    setEntry({ name: '', calories: '', protein: '' })
    toast.success('Food added!')
  }

  const handleClearSession = () => {
    if (window.confirm('Clear all entries for today?')) {
      setTodayLog([])
      localStorage.removeItem('todayLog')
      toast.success('Session cleared')
    }
  }

  const chartMargins = { top: 20, right: 30, left: 20, bottom: 5 }
  const axisStyle = { fontSize: 11, fill: '#555' }
  const gridStyle = { stroke: '#1a1a1a', strokeDasharray: '3 3' }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#01030a] to-[#020817] p-8">
        <DietSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01030a] to-[#020817] text-white font-sans overflow-x-hidden flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.08),transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.06),transparent_45%)]" />
      
      <header className="h-20 border-b border-cyan-500/10 bg-black/60 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2.5 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20"
          >
            <ArrowLeft className="text-cyan-400" size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className="text-cyan-400" size={28} />
              <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              NEURAL INTAKE
            </h1>
            <span className="text-xs font-mono text-cyan-500/70">// ACTIVE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              {totals.calories.toLocaleString()}
            </div>
            <div className="text-xs text-cyan-500/70 mt-0.5">TOTAL KCAL</div>
          </div>
          
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="42" fill="none" stroke="#0f172a" strokeWidth="6" />
              <motion.circle 
                cx="48" cy="48" r="42" 
                fill="none" 
                stroke="url(#calGradient)" 
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - calProgress/100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <circle cx="48" cy="48" r="32" fill="none" stroke="#0f172a" strokeWidth="6" />
              <motion.circle 
                cx="48" cy="48" r="32" 
                fill="none" 
                stroke="url(#proGradient)" 
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 32}
                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - proProgress/100) }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                {Math.round((calProgress + proProgress)/2)}%
              </div>
              <div className="text-[10px] text-cyan-500/70 mt-0.5">SYNCHRONIZED</div>
            </div>
            <defs>
              <linearGradient id="calGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="proGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8 relative z-10 overflow-hidden">
        <div className="glass-card rounded-2xl border border-cyan-500/10 p-1">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input 
              type="text" 
              value={entry.name} 
              onChange={(e) => setEntry({...entry, name: e.target.value})}
              placeholder="FOOD ID (e.g., CHICKEN_BOWL)" 
              className="bg-black/40 border border-cyan-500/10 rounded-xl px-5 py-4 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-500/30 transition-all md:col-span-2"
            />
            <input 
              type="number" 
              value={entry.calories} 
              onChange={(e) => setEntry({...entry, calories: e.target.value})}
              placeholder="KCAL" 
              className="bg-black/40 border border-cyan-500/10 rounded-xl px-5 py-4 font-bold text-cyan-400 placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-500/30 transition-all text-center"
            />
            <input 
              type="number" 
              value={entry.protein} 
              onChange={(e) => setEntry({...entry, protein: e.target.value})}
              placeholder="PROTEIN (G)" 
              className="bg-black/40 border border-cyan-500/10 rounded-xl px-5 py-4 font-bold text-amber-400 placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-500/30 transition-all text-center"
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddEntry}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 rounded-xl font-bold py-4 text-white transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden md:inline">INJECT</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={getAIMealSuggestions}
                disabled={isLoadingAI}
                className="px-4 bg-purple-600/80 hover:bg-purple-600 rounded-xl font-bold text-white transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                title="Get AI meal suggestions"
              >
                {isLoadingAI ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                ) : (
                  <ChefHat size={20} />
                )}
              </motion.button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-500/60 px-3">
            <span>READY FOR NUTRITIONAL INPUT</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              REAL-TIME SYNC
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showAISuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 blur-[60px] rounded-full" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-400" size={24} />
                  <h3 className="text-xl font-bold text-white">AI Meal Suggestions</h3>
                </div>
                <button
                  onClick={() => setShowAISuggestions(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {aiError ? (
                <p className="text-red-400 text-center py-4">Failed to get suggestions. Try again.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-black/40 rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer group"
                      onClick={() => {
                        setEntry({
                          name: suggestion.name,
                          calories: suggestion.calories.toString(),
                          protein: suggestion.protein.toString()
                        })
                        setShowAISuggestions(false)
                      }}
                    >
                      <ChefHat size={24} className="text-purple-400 mb-3" />
                      <h4 className="font-bold text-white mb-2">{suggestion.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">{suggestion.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-cyan-400">{suggestion.calories} kcal</span>
                        <span className="text-amber-400">{suggestion.protein}g protein</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* TODAY'S LOG */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="text-cyan-400" size={22} />
                  LIVE FEED
                </h2>
                <p className="text-cyan-500/60 text-sm mt-1">Current session entries</p>
              </div>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm font-mono">
                {todayLog.length} ENTRIES
              </span>
            </div>

            {todayLog.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Entries Yet"
                message="Add your first food entry to start tracking your nutrition."
              />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll">
                <AnimatePresence>
                  {todayLog.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-5 border border-cyan-500/5 hover:border-cyan-500/20 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-xs text-cyan-500/70 font-mono">{item.time}</div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          </div>
                          <h3 className="font-bold text-lg tracking-tight">{item.name}</h3>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setTodayLog(todayLog.filter(t => t.id !== item.id))}
                          className="text-zinc-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 pt-3 border-t border-cyan-500/10">
                        <div>
                          <div className="text-[11px] text-cyan-500/60 mb-1">ENERGY OUTPUT</div>
                          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            {item.calories.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-cyan-500/40 mt-0.5">kcal</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-amber-400/60 mb-1">MUSCLE SYNTHESIS</div>
                          <div className="text-2xl font-bold text-amber-400">
                            {item.protein}
                          </div>
                          <div className="text-[11px] text-amber-400/40 mt-0.5">grams</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* BIOMETRICS & HISTORY */}
          <div className="space-y-8">
            {/* PROGRESS METERS */}
            <div className="glass-card rounded-2xl border border-cyan-500/10 p-6">
              <div className="space-y-6">
                {/* Calories */}
                <div>
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-[11px] text-cyan-500/60 font-mono">DAILY TARGET</div>
                      <div className="font-bold mt-0.5">CALORIC INTAKE</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        {totals.calories.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-cyan-500/40">/ {CALORIE_GOAL.toLocaleString()} kcal</div>
                    </div>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                </div>
                
                {/* Protein */}
                <div>
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-[11px] text-amber-400/60 font-mono">MUSCLE INDEX</div>
                      <div className="font-bold mt-0.5">PROTEIN SYNTHESIS</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-amber-400">
                        {totals.protein}
                      </div>
                      <div className="text-[11px] text-amber-400/40">/ {PROTEIN_GOAL}g</div>
                    </div>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${proProgress}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>

            {/* HISTORY CHART */}
            <div className="glass-card rounded-2xl border border-cyan-500/10 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Flame className="text-amber-400" size={22} />
                    7-DAY ANALYTICS
                  </h2>
                  <p className="text-cyan-500/60 text-sm mt-1">Performance trends</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    <span>Calories</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    <span>Protein</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[280px] -mx-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={chartMargins}>
                    <defs>
                      <linearGradient id="calArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="proArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...gridStyle} vertical={false} />
                    <XAxis dataKey="day" {...axisStyle} tickLine={false} axisLine={{ stroke: '#334155' }} />
                    <YAxis yAxisId="left" {...axisStyle} tickLine={false} axisLine={false} width={45} />
                    <YAxis yAxisId="right" {...axisStyle} tickLine={false} axisLine={false} orientation="right" width={45} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeDasharray: '3 3' }} />
                    <ReferenceLine yAxisId="left" y={CALORIE_GOAL} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopLeft', fill: '#06b6d4', fontSize: 11 }} />
                    <ReferenceLine yAxisId="right" y={PROTEIN_GOAL} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#f97316', fontSize: 11 }} />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="cals" 
                      stroke="url(#calArea)" 
                      strokeWidth={3} 
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 8 }} 
                      fill="url(#calArea)" 
                      fillOpacity={0.4} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="pro" 
                      stroke="url(#proArea)" 
                      strokeWidth={3} 
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 8 }} 
                      fill="url(#proArea)" 
                      fillOpacity={0.4} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3 text-center p-3 bg-black/30 rounded-xl">
                <div>
                  <div className="text-[11px] text-cyan-500/60">AVG CALORIES</div>
                  <div className="font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    {Math.round(historyData.reduce((sum, d) => sum + d.cals, 0) / historyData.length).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-amber-400/60">AVG PROTEIN</div>
                  <div className="font-bold mt-1 text-amber-400">
                    {Math.round(historyData.reduce((sum, d) => sum + d.pro, 0) / historyData.length)}g
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM STATUS */}
            <div className="space-y-3">
              <div className="glass-card rounded-xl p-4 border border-amber-500/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-amber-500/60 font-mono">METABOLIC RATE</div>
                  <div className="font-bold mt-1">OPTIMAL</div>
                </div>
                <Flame className="text-amber-500/70" size={28} />
              </div>
              <div className="glass-card rounded-xl p-4 border border-cyan-500/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-cyan-500/60 font-mono">DATA INTEGRITY</div>
                  <div className="font-bold mt-1">SECURE</div>
                </div>
                <Database className="text-cyan-500/70" size={28} />
              </div>
              <div className="glass-card rounded-xl p-4 border border-purple-500/10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-purple-400/60 font-mono">ACTIVITY LEVEL</div>
                  <div className="font-bold mt-1">HIGH</div>
                </div>
                <Activity className="text-purple-500/70" size={28} />
              </div>
            </div>

            {/* ACTION BUTTONS WITH CLEAR SESSION */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearSession}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold py-4 text-white transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                CLEAR SESSION
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 rounded-xl font-bold py-5 text-white text-lg transition-all shadow-lg shadow-cyan-500/30"
              >
                FINALIZE SESSION
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
      `}</style>
    </div>
  )
}

export default DietTracker
