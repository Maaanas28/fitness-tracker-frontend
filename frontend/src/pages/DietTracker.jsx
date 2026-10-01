import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Trash2, BarChart3, Flame, Activity,
  Sparkles, ChefHat, X, RefreshCw, Check, Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { DietSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { useApi, apiPost, apiDelete } from '../hooks/useApi'
import { generateWithAI } from '../utils/ai'

const AI_MEAL_LIMIT = 20

// ─── CUSTOM DARK TOOLTIP ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, calorieGoal }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl p-4 bg-[#141419] text-white font-mono text-xs shadow-2xl border-none">
      <p className="font-bold text-sm mb-2 text-cyan-400">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-zinc-400">Calories:</span>
          <span className="font-bold text-cyan-300">{payload[0]?.value?.toLocaleString() || 0} kcal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-zinc-400">Protein:</span>
          <span className="font-bold text-amber-300">{payload[1]?.value || 0}g</span>
        </div>
      </div>
      <div className="mt-2.5 pt-2 text-[10px] text-zinc-500 border-t border-white/5">
        TARGET: {Number(calorieGoal || 2500).toLocaleString()} kcal
      </div>
    </div>
  )
}

// ─── RING PROGRESS COMPONENT ─────────────────────────────────────────────────
const RingProgress = ({ pct, size = 110, strokeWidth = 8, color = "#3b82f6", label, value, sublabel }) => {
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circ

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Kanit' }}>{value}</span>
          {sublabel && <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{sublabel}</span>}
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mt-2.5">{label}</span>
    </div>
  )
}

function DietTracker() {
  const navigate = useNavigate()
  const { data: apiMeals, loading: mealsLoading, refetch: refetchMeals } = useApi('/meals')
  const [isLoading, setIsLoading] = useState(true)

  // Load nutrition goals
  const [nutritionGoals] = useState(() => {
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
  const CARBS_GOAL = nutritionGoals.carbs
  const FATS_GOAL = nutritionGoals.fats

  const [localTodayLog, setLocalTodayLog] = useState(() => {
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
    localStorage.setItem('todayLog', JSON.stringify(localTodayLog))
  }, [localTodayLog])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600)
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]
  const meals = useMemo(() => (Array.isArray(apiMeals) ? apiMeals : []), [apiMeals])

  const todayApiLog = useMemo(() => {
    return meals.filter((m) => m.date === todayStr)
  }, [meals, todayStr])

  const todayLog = useMemo(() => {
    const apiMapped = todayApiLog.map((m) => ({
      id: m._id,
      _id: m._id,
      name: m.name,
      calories: Number(m.calories) || 0,
      protein: Number(m.protein) || 0,
      carbs: Number(m.carbs) || 0,
      fats: Number(m.fat) || 0,
      time: new Date(m.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: m.date,
      createdAt: m.createdAt || new Date().toISOString(),
      source: 'api',
    }))

    const localMapped = (localTodayLog || [])
      .filter((m) => (m.date || todayStr) === todayStr)
      .map((m) => ({
        ...m,
        calories: Number(m.calories) || 0,
        protein: Number(m.protein) || 0,
        date: m.date || todayStr,
        createdAt: m.createdAt || new Date().toISOString(),
        source: 'local',
      }))

    return [...apiMapped, ...localMapped].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
  }, [todayApiLog, localTodayLog, todayStr])

  // Offline Sync Queue
  useEffect(() => {
    if (!localTodayLog.length) return

    let disposed = false
    let syncing = false

    const syncPendingMeals = async () => {
      if (syncing || disposed) return
      syncing = true

      const queue = [...localTodayLog]
      const remaining = []
      let syncedCount = 0

      for (const m of queue) {
        if (disposed) break
        const saved = await apiPost('/meals', {
          date: m.date || todayStr,
          name: m.name,
          calories: Number(m.calories) || 0,
          protein: Number(m.protein) || 0,
          carbs: Number(m.carbs) || 0,
          fat: Number(m.fat) || 0,
          mealType: m.mealType || 'snack',
        })

        if (saved) {
          syncedCount += 1
        } else {
          remaining.push(m)
        }
      }

      if (!disposed && syncedCount > 0) {
        setLocalTodayLog(remaining)
        await refetchMeals()
        toast.success(`Synced ${syncedCount} offline meal${syncedCount > 1 ? 's' : ''}`)
      }

      syncing = false
    }

    syncPendingMeals()
    const intervalId = setInterval(syncPendingMeals, 12000)

    return () => {
      disposed = true
      clearInterval(intervalId)
    }
  }, [localTodayLog, todayStr, refetchMeals])

  const historyData = useMemo(() => {
    const byDate = {}

    meals.forEach((m) => {
      const d = m.date
      if (!d) return
      if (!byDate[d]) byDate[d] = { cals: 0, pro: 0 }
      byDate[d].cals += Number(m.calories) || 0
      byDate[d].pro += Number(m.protein) || 0
    })

    if (todayApiLog.length === 0 && localTodayLog.length > 0) {
      byDate[todayStr] = {
        cals: localTodayLog.reduce((sum, m) => sum + (Number(m.calories) || 0), 0),
        pro: localTodayLog.reduce((sum, m) => sum + (Number(m.protein) || 0), 0),
      }
    }

    const rows = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      rows.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        cals: byDate[key]?.cals || 0,
        pro: byDate[key]?.pro || 0,
      })
    }
    return rows
  }, [meals, localTodayLog, todayApiLog.length, todayStr])

  const [entry, setEntry] = useState({ name: '', calories: '', protein: '' })
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(false)
  const [aiRefineInput, setAiRefineInput] = useState('')
  const [aiContext, setAiContext] = useState({ goal: 'maintain', mealType: 'meal' })

  const totals = useMemo(() => {
    return todayLog.reduce((acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein
    }), { calories: 0, protein: 0 })
  }, [todayLog])

  const calProgress = Math.min(Math.round((totals.calories / CALORIE_GOAL) * 100), 100)
  const proProgress = Math.min(Math.round((totals.protein / PROTEIN_GOAL) * 100), 100)

  const getGoalAndMealType = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    const fitnessGoal = String(userProfile.fitnessGoal || '').toLowerCase()

    let userGoal = 'maintain'
    if (fitnessGoal.includes('loss') || fitnessGoal.includes('weight')) {
      userGoal = 'weight_loss'
    } else if (fitnessGoal.includes('gain') || fitnessGoal.includes('muscle') || fitnessGoal.includes('strength')) {
      userGoal = 'muscle_gain'
    }

    const hour = new Date().getHours()
    let mealType = 'meal'
    if (hour < 11) mealType = 'breakfast'
    else if (hour < 15) mealType = 'lunch'
    else if (hour < 19) mealType = 'dinner'
    else mealType = 'snack'

    return { userGoal, mealType }
  }

// ─── DIVERSE REAL-WORLD MEAL DATABASE (ALWAYS VISIBLE PREPARATION STEPS) ───
const REAL_MEAL_DATABASE = [
  { 
    name: 'Scrambled Eggs & Avocado Toast', 
    calories: 420, 
    protein: 26, 
    description: '3 farm-fresh eggs on sourdough toast with sliced avocado & chili flakes',
    instructions: [
      'Toast 2 slices of artisanal sourdough bread',
      'Whisk 3 eggs with sea salt & cracked black pepper',
      'Scramble gently over low heat in grass-fed butter',
      'Mash fresh avocado onto toast and top with eggs & chili flakes'
    ]
  },
  { 
    name: 'Teriyaki Salmon Rice Bowl', 
    calories: 540, 
    protein: 42, 
    description: 'Pan-seared Atlantic salmon with jasmine rice, edamame & sesame glaze',
    instructions: [
      'Season salmon fillet with lemon & black pepper',
      'Sear skin-side down in hot skillet for 4 mins, flip for 3 mins',
      'Brush with low-sodium teriyaki glaze',
      'Serve over steamed jasmine rice with edamame & toasted sesame'
    ]
  },
  { 
    name: 'Grilled Chicken Caesar Wrap', 
    calories: 460, 
    protein: 38, 
    description: 'Flame-grilled chicken breast, romaine lettuce & light Caesar dressing',
    instructions: [
      'Grill seasoned chicken breast until cooked through (165°F)',
      'Slice chicken into thin tender strips',
      'Toss crisp romaine lettuce with light Caesar dressing & parmesan',
      'Wrap tightly in a spinach tortilla'
    ]
  },
  { 
    name: 'Ribeye Steak & Sweet Potatoes', 
    calories: 620, 
    protein: 48, 
    description: 'Grass-fed ribeye steak with roasted sweet potato wedges & green beans',
    instructions: [
      'Toss sweet potato wedges in olive oil & paprika, bake at 400°F for 25 mins',
      'Sear ribeye in cast-iron skillet for 3-4 mins per side with garlic butter',
      'Sauté green beans in remaining pan drippings',
      'Rest steak 5 minutes before slicing and serving'
    ]
  },
  { 
    name: 'Greek Yogurt Berry Crunch', 
    calories: 290, 
    protein: 28, 
    description: 'Whole milk Greek yogurt with fresh blueberries, honey & granola',
    instructions: [
      'Scoop 1 cup of plain Greek yogurt into a bowl',
      'Layer with fresh blueberries and organic wildflower honey',
      'Top with toasted almond granola & chia seeds for crisp crunch'
    ]
  },
  { 
    name: 'Turkey & Spinach Omelette', 
    calories: 330, 
    protein: 35, 
    description: 'Lean ground turkey, baby spinach, cherry tomatoes & feta cheese',
    instructions: [
      'Brown 100g lean ground turkey in a non-stick skillet',
      'Whisk 3 eggs, pour over turkey with baby spinach & halved tomatoes',
      'Cook until set, sprinkle with crumbled feta cheese and fold in half'
    ]
  },
  { 
    name: 'Chicken Shawarma Power Bowl', 
    calories: 510, 
    protein: 45, 
    description: 'Marinated chicken thigh, brown rice, hummus & cucumber tzatziki',
    instructions: [
      'Marinate chicken thigh in cumin, coriander, paprika & lemon juice',
      'Grill or roast chicken until charred and juicy',
      'Assemble bowl with brown rice, sliced chicken, dollop of hummus & tzatziki'
    ]
  },
  { 
    name: 'Cottage Cheese Oat Pancakes', 
    calories: 380, 
    protein: 30, 
    description: 'High-protein oat pancakes topped with sliced banana & maple syrup',
    instructions: [
      'Blend 1/2 cup cottage cheese, 1/2 cup oats, 2 eggs & vanilla extract',
      'Pour batter onto hot greased griddle',
      'Cook until bubbles form, flip and cook until golden brown',
      'Top with fresh banana slices and warm pure maple syrup'
    ]
  },
  { 
    name: 'Tuna Poke & Quinoa Bowl', 
    calories: 430, 
    protein: 36, 
    description: 'Fresh yellowfin tuna, quinoa, cucumber, mango & ponzu dressing',
    instructions: [
      'Dice sushi-grade yellowfin tuna into clean bite-sized cubes',
      'Toss tuna with low-sodium soy sauce, sesame oil & green onion',
      'Assemble bowl over fluffy cooked quinoa with cucumber & diced mango',
      'Drizzle with citrus ponzu sauce and sprinkle toasted sesame seeds'
    ]
  },
  { 
    name: 'Beef Burrito Protein Bowl', 
    calories: 580, 
    protein: 44, 
    description: 'Seasoned lean minced beef, black beans, brown rice, salsa & guacamole',
    instructions: [
      'Sauté 93/7 lean ground beef with taco spices & garlic',
      'Warm black beans and sweet corn kernels',
      'Base bowl with cilantro lime brown rice, seasoned beef & black beans',
      'Top with fresh tomato salsa, chopped cilantro & guacamole'
    ]
  },
  { 
    name: 'Pan-Seared Cod & Asparagus', 
    calories: 370, 
    protein: 40, 
    description: 'Fresh cod fillet with lemon herb butter and roasted asparagus spears',
    instructions: [
      'Pat cod fillet dry and season lightly with lemon pepper seasoning',
      'Pan-fry cod in olive oil for 3-4 mins per side until flaky',
      'Roast fresh asparagus spears with olive oil at 400°F for 12 mins',
      'Spoon melted lemon herb butter over cod before serving'
    ]
  },
  { 
    name: 'Mediterranean Chicken Pasta', 
    calories: 560, 
    protein: 44, 
    description: 'Whole wheat penne, grilled chicken, cherry tomatoes & kalamata olives',
    instructions: [
      'Boil whole wheat penne until al dente',
      'Sauté diced grilled chicken breast with garlic & cherry tomatoes in olive oil',
      'Toss pasta with chicken, tomatoes, sliced kalamata olives & fresh basil',
      'Garnish with grated parmesan cheese'
    ]
  }
]

function getRandomMealSelection(count = 6, query = '') {
  let list = [...REAL_MEAL_DATABASE]
  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase().trim()
    const filtered = list.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (Array.isArray(m.instructions) && m.instructions.some((i) => i.toLowerCase().includes(q)))
    )
    if (filtered.length > 0) {
      list = filtered
    }
  }
  const shuffled = [...list].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

  const normalizeAIMeals = (raw) => {
    const arr = Array.isArray(raw) ? raw : []
    return arr
      .map((item) => ({
        name: String(item?.name || '').trim(),
        calories: Number(item?.calories) || 0,
        protein: Number(item?.protein) || 0,
        description: String(item?.description || 'AI suggested meal option').trim(),
        instructions: Array.isArray(item?.instructions)
          ? item.instructions.filter(Boolean).map((s) => String(s).trim()).filter(Boolean)
          : String(item?.instructions || '')
              .split(/\n|\.|\d+\)/)
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 6)
      }))
      .filter((item) => item.name && item.calories > 0)
      .slice(0, AI_MEAL_LIMIT)
  }

  const getAIMealSuggestions = async (customRequest = '') => {
    setIsLoadingAI(true)
    setAiError(false)

    const { userGoal, mealType } = getGoalAndMealType()
    setAiContext({ goal: userGoal, mealType })

    const remainingCalories = Math.max(CALORIE_GOAL - totals.calories, 0)
    const remainingProtein = Math.max(PROTEIN_GOAL - totals.protein, 0)

    const prompt = `Create ${AI_MEAL_LIMIT} different delicious ${mealType} food options for a user with fitness goal ${userGoal.replace('_', ' ')}.
Daily targets remaining: calories left: ${Math.round(remainingCalories)}, protein left: ${Math.round(remainingProtein)}.
${customRequest ? `User preference / search filter: MUST include or focus on ${customRequest}` : ''}
Make meals sound delicious, natural, and realistic. Random seed: ${Date.now()}.
Return ONLY valid JSON array:
[{"name": "Meal Name", "calories": 430, "protein": 32, "description": "Short appetizing description", "instructions": ["Step 1", "Step 2", "Step 3"]}]`

    try {
      const rawText = await generateWithAI(prompt, 'meal')
      const jsonMatch = String(rawText).match(/\[[\s\S]*\]/)
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
      const normalized = normalizeAIMeals(parsed)

      if (normalized.length > 0) {
        let filtered = normalized
        if (customRequest && customRequest.trim()) {
          const q = customRequest.toLowerCase().trim()
          const matched = normalized.filter((m) =>
            m.name.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q)
          )
          if (matched.length > 0) filtered = matched
        }
        const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 6)
        setAiSuggestions(shuffled)
      } else {
        throw new Error('No valid meals returned')
      }
    } catch (err) {
      console.warn('Using dynamic real-world meal shuffle with query:', err)
      setAiSuggestions(getRandomMealSelection(6, customRequest))
    } finally {
      setShowAISuggestions(true)
      setIsLoadingAI(false)
    }
  }

  const handleAddEntry = async () => {
    if (!entry.name || !entry.calories) {
      toast.error('Enter food name and calories')
      return
    }

    const newEntry = {
      id: Date.now() + Math.random(),
      name: entry.name.trim().toUpperCase(),
      calories: parseInt(entry.calories),
      protein: parseInt(entry.protein) || Math.round(parseInt(entry.calories) * 0.2),
      carbs: 0,
      fat: 0,
      date: todayStr,
      mealType: 'snack',
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    const saved = await apiPost('/meals', {
      date: todayStr,
      name: newEntry.name,
      calories: newEntry.calories,
      protein: newEntry.protein,
      carbs: 0,
      fat: 0,
      mealType: newEntry.mealType,
    })

    if (saved) {
      await refetchMeals()
    } else {
      setLocalTodayLog((prev) => [newEntry, ...prev])
    }

    setEntry({ name: '', calories: '', protein: '' })
    toast.success('Food logged!')
  }

  const handleRemoveEntry = async (item) => {
    if (item?._id) {
      const ok = await apiDelete(`/meals/${item._id}`)
      if (ok) {
        await refetchMeals()
        return
      }
    }
    setLocalTodayLog((prev) => prev.filter((t) => t.id !== item.id))
    toast.success('Entry removed')
  }

  const handleClearSession = async () => {
    if (window.confirm('Clear all meal entries for today?')) {
      const failedServerDeletes = []

      if (todayApiLog.length > 0) {
        const results = await Promise.all(
          todayApiLog.map(async (m) => {
            const ok = await apiDelete(`/meals/${m._id}`)
            if (!ok) {
              failedServerDeletes.push({
                id: Date.now() + Math.random(),
                name: m.name,
                calories: Number(m.calories) || 0,
                protein: Number(m.protein) || 0,
                carbs: Number(m.carbs) || 0,
                fat: Number(m.fat) || 0,
                date: m.date,
                mealType: m.mealType || 'snack',
                createdAt: m.createdAt || new Date().toISOString(),
              })
            }
            return ok
          })
        )
        await refetchMeals()

        if (results.some((ok) => !ok)) {
          toast.error('Some entries could not be cleared on server')
        }
      }

      setLocalTodayLog((prev) => {
        const keepOtherDays = prev.filter((entry) => (entry.date || todayStr) !== todayStr)
        return [...failedServerDeletes, ...keepOtherDays]
      })

      toast.success('Today\'s entries cleared')
    }
  }

  if (isLoading || (mealsLoading && localTodayLog.length === 0)) {
    return (
      <div className="min-h-screen bg-[#09090b] p-8">
        <DietSkeleton />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen w-full bg-[#09090b] text-[#E4E4E7] select-none pb-16"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      {/* ─── SLEEK HEADER WITH BACK BUTTON ────────────────────────────────────── */}
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
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white">
              Diet Tracker
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Track daily meals & nutrition goals</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Kanit' }}>
              {totals.calories.toLocaleString()} <span className="text-xs font-normal text-zinc-500">/ {CALORIE_GOAL} KCAL</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
              {calProgress}% Daily Goal Reached
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-8 space-y-8">
        
        {/* ─── NUTRITION OVERVIEW CARDS (BORDERLESS DARK GLASS) ───────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Calories */}
          <div className="rounded-[24px] bg-white/[0.03] hover:bg-white/[0.05] p-6 flex flex-col items-center justify-between transition-all border-none">
            <RingProgress 
              pct={calProgress} 
              color="#3b82f6" 
              label="Calories" 
              value={`${totals.calories}`} 
              sublabel="KCAL"
            />
            <span className="text-[11px] text-zinc-500 font-mono mt-3">Goal: {CALORIE_GOAL} kcal</span>
          </div>

          {/* Card 2: Protein */}
          <div className="rounded-[24px] bg-white/[0.03] hover:bg-white/[0.05] p-6 flex flex-col items-center justify-between transition-all border-none">
            <RingProgress 
              pct={proProgress} 
              color="#f59e0b" 
              label="Protein" 
              value={`${totals.protein}g`} 
              sublabel={`/ ${PROTEIN_GOAL}G`}
            />
            <span className="text-[11px] text-zinc-500 font-mono mt-3">Muscle recovery target</span>
          </div>

          {/* Card 3: Carbs */}
          <div className="rounded-[24px] bg-white/[0.03] hover:bg-white/[0.05] p-6 flex flex-col items-center justify-between transition-all border-none">
            <RingProgress 
              pct={Math.min(100, Math.round((totals.calories * 0.45 / 4 / CARBS_GOAL) * 100))} 
              color="#06b6d4" 
              label="Carbohydrates" 
              value={`${Math.round(totals.calories * 0.45 / 4)}g`} 
              sublabel={`/ ${CARBS_GOAL}G`}
            />
            <span className="text-[11px] text-zinc-500 font-mono mt-3">Energy fuel target</span>
          </div>

          {/* Card 4: Fats */}
          <div className="rounded-[24px] bg-white/[0.03] hover:bg-white/[0.05] p-6 flex flex-col items-center justify-between transition-all border-none">
            <RingProgress 
              pct={Math.min(100, Math.round((totals.calories * 0.25 / 9 / FATS_GOAL) * 100))} 
              color="#a78bfa" 
              label="Healthy Fats" 
              value={`${Math.round(totals.calories * 0.25 / 9)}g`} 
              sublabel={`/ ${FATS_GOAL}G`}
            />
            <span className="text-[11px] text-zinc-500 font-mono mt-3">Hormonal balance target</span>
          </div>
        </div>

        {/* ─── QUICK LOG MEAL INPUT BAR (NEUTRAL DARK GLASS BUTTONS) ──────────── */}
        <div className="rounded-[24px] bg-white/[0.03] p-5 backdrop-blur-md border-none">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <input 
              type="text" 
              value={entry.name} 
              onChange={(e) => setEntry({...entry, name: e.target.value})}
              placeholder="Food Name (e.g. Grilled Chicken Bowl)" 
              className="w-full lg:flex-1 bg-white/[0.04] border-none rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none font-medium"
            />
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              <input 
                type="number" 
                value={entry.calories} 
                onChange={(e) => setEntry({...entry, calories: e.target.value})}
                placeholder="KCAL" 
                className="bg-white/[0.04] border-none rounded-2xl px-4 py-3.5 font-bold text-cyan-400 placeholder:text-zinc-500 focus:outline-none text-center text-sm"
              />
              <input 
                type="number" 
                value={entry.protein} 
                onChange={(e) => setEntry({...entry, protein: e.target.value})}
                placeholder="PROTEIN (G)" 
                className="bg-white/[0.04] border-none rounded-2xl px-4 py-3.5 font-bold text-amber-400 placeholder:text-zinc-500 focus:outline-none text-center text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddEntry}
                className="flex-1 lg:flex-none px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/15 border-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Log Meal</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => getAIMealSuggestions()}
                disabled={isLoadingAI}
                className="px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-zinc-300 bg-white/[0.06] hover:bg-white/10 border-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Get AI meal suggestions"
              >
                {isLoadingAI ? (
                  <RefreshCw size={16} className="animate-spin text-zinc-400" />
                ) : (
                  <ChefHat size={16} className="text-zinc-300" />
                )}
                <span className="hidden sm:inline">AI Assistant</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ─── IN-LINE SLIDE-DOWN AI MEAL ASSISTANT PANEL ─────────────────────── */}
        <AnimatePresence>
          {showAISuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-6 border-none">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/[0.06] text-white">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide">AI Meal Assistant</h3>
                      <p className="text-xs text-zinc-400">Tailored for {aiContext.goal.replace('_', ' ')} &bull; {aiContext.mealType}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAISuggestions(false)}
                    className="text-zinc-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors border-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search / Filter Prompt Bar with Search Icon & Enter Key Support */}
                <div className="space-y-3">
                  <div className="relative flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        value={aiRefineInput}
                        onChange={(e) => setAiRefineInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            getAIMealSuggestions(aiRefineInput.trim())
                          }
                        }}
                        placeholder="Search food or ingredient (e.g. egg, chicken, salmon, high protein)..."
                        className="w-full bg-white/[0.04] border-none rounded-2xl pl-11 pr-5 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none font-medium"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => getAIMealSuggestions(aiRefineInput.trim())}
                      disabled={isLoadingAI}
                      className="px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 border-none cursor-pointer"
                    >
                      <RefreshCw size={14} className={isLoadingAI ? 'animate-spin' : ''} />
                      <span>{aiRefineInput.trim() ? 'Search AI' : 'Regenerate'}</span>
                    </motion.button>
                  </div>

                  {/* Quick Search Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold mr-1">Quick Search:</span>
                    {[
                      { label: '🍳 Eggs', query: 'egg' },
                      { label: '🐔 Chicken', query: 'chicken' },
                      { label: '🐟 Salmon', query: 'salmon' },
                      { label: '🥩 Beef', query: 'beef' },
                      { label: '🫐 Oats & Yogurt', query: 'oats' },
                      { label: '🥗 Vegan', query: 'vegan' },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setAiRefineInput(chip.query)
                          getAIMealSuggestions(chip.query)
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border-none ${
                          aiRefineInput === chip.query
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                            : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggestions 6-Option Responsive Grid */}
                {aiError ? (
                  <p className="text-red-400 text-center py-6">Unable to generate suggestions. Please try again.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="rounded-[22px] p-5 bg-white/[0.04] hover:bg-white/[0.07] transition-all flex flex-col justify-between border-none"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                              <ChefHat size={14} className="text-zinc-400" />
                              Option 0{index + 1}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-white mb-1.5 leading-snug">{suggestion.name}</h4>
                          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{suggestion.description}</p>
                          
                          <div className="flex justify-between items-center text-xs font-bold py-2 px-3 rounded-xl bg-black/40 mb-3">
                            <span className="text-cyan-400 font-mono">{suggestion.calories} KCAL</span>
                            <span className="text-amber-400 font-mono">{suggestion.protein}G PRO</span>
                          </div>

                          {/* Preparation Steps (ALWAYS VISIBLE) */}
                          <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 mb-3">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Preparation Steps</div>
                            <ol className="text-xs text-zinc-400 space-y-1 list-decimal pl-4">
                              {(suggestion.instructions && suggestion.instructions.length > 0
                                ? suggestion.instructions
                                : [
                                    'Prepare fresh ingredients',
                                    'Season with salt, black pepper & olive oil',
                                    'Cook using preferred method until ready',
                                    'Assemble and enjoy your high-protein meal!'
                                  ]
                              ).map((step, stepIndex) => (
                                <li key={stepIndex} className="leading-snug text-zinc-400">{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setEntry({
                              name: suggestion.name,
                              calories: suggestion.calories.toString(),
                              protein: suggestion.protein.toString()
                            })
                            setShowAISuggestions(false)
                            toast.success(`Selected ${suggestion.name}! Click 'Log Meal' to save.`)
                          }}
                          className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all border-none cursor-pointer mt-2"
                        >
                          Use This Meal
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── TODAY'S MEALS LOG & 7-DAY TRENDS ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Today's Logged Meals */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                  <BarChart3 className="text-cyan-400" size={20} />
                  Today's Meals
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Logged meal history for today</p>
              </div>
              <span className="px-3 py-1 bg-white/[0.05] rounded-full text-xs font-mono text-zinc-400">
                {todayLog.length} ENTRIES
              </span>
            </div>

            {todayLog.length === 0 ? (
              <div className="rounded-[24px] bg-white/[0.02] p-10 text-center border-none">
                <EmptyState
                  icon={BarChart3}
                  title="No Meals Logged Today"
                  message="Use the quick bar above or AI Assistant to log your first meal."
                />
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scroll">
                <AnimatePresence>
                  {todayLog.map((item, i) => (
                    <motion.div
                      key={item._id || item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-[20px] p-4 bg-white/[0.03] hover:bg-white/[0.06] transition-all flex items-center justify-between border-none group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-zinc-400 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] text-zinc-500 font-mono">{item.time}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <h3 className="font-bold text-sm text-white uppercase tracking-wide">{item.name}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <span className="text-base font-bold text-cyan-400" style={{ fontFamily: 'Kanit' }}>{item.calories} <span className="text-xs font-normal text-zinc-500">kcal</span></span>
                          <div className="text-[10px] text-amber-400 font-bold">{item.protein}g protein</div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveEntry(item)}
                          className="text-zinc-500 hover:text-red-400 p-2 rounded-xl hover:bg-white/[0.05] transition-colors border-none cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column: 7-Day Nutrition Trends Chart */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-[24px] bg-white/[0.03] p-6 backdrop-blur-md space-y-5 border-none">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
                    <Flame className="text-amber-400" size={18} />
                    7-Day Trends
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Calorie & protein history</p>
                </div>
                <div className="flex gap-3 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-zinc-400">Calories</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-zinc-400">Protein</span>
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={(props) => <CustomTooltip {...props} calorieGoal={CALORIE_GOAL} />} />
                    <ReferenceLine yAxisId="left" y={CALORIE_GOAL} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.4} />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="cals" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5} 
                      dot={{ fill: '#3b82f6', r: 3 }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="pro" 
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      dot={{ fill: '#f59e0b', r: 3 }} 
                      activeDot={{ r: 5 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Session Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearSession}
                  className="py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-red-400 bg-white/[0.04] hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Clear Day</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast.success(`Saved day: ${totals.calories} kcal logged!`)}
                  className="py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Session</span>
                </motion.button>
              </div>
            </div>
          </div>

        </div>
      </main>

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

export default DietTracker
