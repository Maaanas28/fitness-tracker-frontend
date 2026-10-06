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
import { sendAIMessage } from '../services/api'

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

// ─── DIVERSE REAL-WORLD MEAL DATABASE (KEYWORD-TAGGED FOR SMART SEARCH) ───
const REAL_MEAL_DATABASE = [
  {
    name: 'Scrambled Eggs & Avocado Toast',
    calories: 420, protein: 26,
    tags: ['egg', 'eggs', 'avocado', 'breakfast', 'vegetarian'],
    description: '3 farm-fresh eggs on sourdough toast with sliced avocado & chili flakes',
    instructions: ['Toast 2 slices of sourdough bread', 'Whisk 3 eggs with salt & pepper', 'Scramble gently over low heat in butter', 'Mash avocado on toast and top with eggs & chili flakes']
  },
  {
    name: 'Masala Omelette',
    calories: 310, protein: 24,
    tags: ['egg', 'eggs', 'breakfast', 'indian', 'vegetarian'],
    description: 'Spiced Indian omelette with onion, tomato, green chili & coriander',
    instructions: ['Whisk 3 eggs with salt and turmeric', 'Sauté diced onion, tomato & green chili in oil', 'Pour eggs over vegetables', 'Cook until golden, garnish with fresh coriander']
  },
  {
    name: 'Egg Bhurji (Spiced Scrambled Eggs)',
    calories: 350, protein: 28,
    tags: ['egg', 'eggs', 'indian', 'breakfast', 'vegetarian'],
    description: 'Indian-style scrambled eggs with onions, tomatoes, spices & butter',
    instructions: ['Heat oil, sauté onion, tomato & ginger-garlic paste', 'Add cumin, turmeric, red chili powder', 'Crack in 3 eggs and scramble continuously', 'Finish with fresh coriander and serve with roti']
  },
  {
    name: 'Hard Boiled Eggs & Spinach Salad',
    calories: 260, protein: 22,
    tags: ['egg', 'eggs', 'salad', 'low calorie', 'vegetarian'],
    description: '3 hard boiled eggs with fresh spinach, cherry tomatoes & light dressing',
    instructions: ['Boil eggs for 10 minutes, cool and peel', 'Arrange spinach leaves with cherry tomatoes', 'Slice eggs and place over salad', 'Drizzle with olive oil and lemon dressing']
  },
  {
    name: 'Grilled Chicken Caesar Wrap',
    calories: 460, protein: 38,
    tags: ['chicken', 'wrap', 'lunch'],
    description: 'Flame-grilled chicken breast, romaine lettuce & light Caesar dressing',
    instructions: ['Grill seasoned chicken breast until cooked through (165°F)', 'Slice chicken into thin strips', 'Toss romaine with Caesar dressing & parmesan', 'Wrap tightly in a spinach tortilla']
  },
  {
    name: 'Chicken Shawarma Power Bowl',
    calories: 510, protein: 45,
    tags: ['chicken', 'bowl', 'lunch', 'dinner'],
    description: 'Marinated chicken thigh, brown rice, hummus & cucumber tzatziki',
    instructions: ['Marinate chicken in cumin, coriander, paprika & lemon juice', 'Grill chicken until charred and juicy', 'Assemble bowl with brown rice, sliced chicken', 'Add dollop of hummus & tzatziki']
  },
  {
    name: 'Butter Chicken (Murgh Makhani)',
    calories: 480, protein: 40,
    tags: ['chicken', 'indian', 'dinner', 'curry'],
    description: 'Tender chicken in a rich creamy tomato-butter sauce with aromatic spices',
    instructions: ['Marinate chicken in yogurt & spices overnight', 'Grill or roast chicken pieces until charred', 'Simmer in tomato-butter-cream sauce with garam masala', 'Serve hot with naan or basmati rice']
  },
  {
    name: 'Chicken Tikka Masala',
    calories: 450, protein: 42,
    tags: ['chicken', 'indian', 'dinner', 'curry'],
    description: 'Smoky grilled chicken in spiced creamy tomato masala gravy',
    instructions: ['Marinate chicken in yogurt, ginger-garlic, chili & spices', 'Skewer and grill until charred', 'Cook tomato-onion masala with cream', 'Add grilled chicken, simmer 10 mins and serve']
  },
  {
    name: 'Chicken Biryani Bowl',
    calories: 550, protein: 44,
    tags: ['chicken', 'indian', 'dinner', 'rice'],
    description: 'Fragrant basmati rice layered with spiced chicken, fried onions & saffron',
    instructions: ['Marinate chicken in biryani spices and yogurt', 'Cook basmati rice 70% done', 'Layer chicken and rice in pot with fried onions & saffron milk', 'Dum cook on low heat for 25 mins']
  },
  {
    name: 'Grilled Chicken & Sweet Potato',
    calories: 480, protein: 42,
    tags: ['chicken', 'dinner', 'high protein'],
    description: 'Herb-marinated grilled chicken breast with roasted sweet potato & greens',
    instructions: ['Marinate chicken in olive oil, garlic, lemon & herbs', 'Grill chicken 6-7 mins per side', 'Roast sweet potato cubes at 400°F for 25 mins', 'Serve with steamed green beans']
  },
  {
    name: 'Chicken Soup with Vegetables',
    calories: 320, protein: 30,
    tags: ['chicken', 'soup', 'low calorie', 'healthy'],
    description: 'Hearty chicken broth with shredded chicken, carrots, celery & herbs',
    instructions: ['Simmer chicken pieces in water with garlic and onion', 'Add diced carrots, celery & bay leaves', 'Shred cooked chicken back into broth', 'Season with pepper and fresh parsley']
  },
  {
    name: 'Paneer Tikka',
    calories: 380, protein: 28,
    tags: ['veg', 'vegetarian', 'paneer', 'indian', 'dinner'],
    description: 'Marinated paneer cubes grilled in tandoor with peppers and onions',
    instructions: ['Marinate paneer in yogurt, chili, cumin & garam masala', 'Thread onto skewers with bell peppers & onion', 'Grill at high heat until charred spots appear', 'Squeeze lemon and serve with mint chutney']
  },
  {
    name: 'Dal Tadka (Yellow Lentil Curry)',
    calories: 320, protein: 18,
    tags: ['veg', 'vegetarian', 'indian', 'dal', 'lentil', 'dinner'],
    description: 'Creamy yellow lentils tempered with cumin, garlic & red chili butter',
    instructions: ['Pressure cook yellow lentils until soft', 'Heat ghee, add cumin seeds, garlic & dry red chilies', 'Pour tempering over cooked dal', 'Serve hot with steamed basmati rice or roti']
  },
  {
    name: 'Chana Masala',
    calories: 360, protein: 16,
    tags: ['veg', 'vegetarian', 'chickpea', 'indian', 'dinner'],
    description: 'Spiced chickpea curry in tangy tomato-onion gravy with amchur',
    instructions: ['Soak and pressure cook chickpeas until soft', 'Cook onion-tomato masala with ginger-garlic paste', 'Add cumin, coriander, amchur & garam masala', 'Add chickpeas, simmer 15 mins and garnish with coriander']
  },
  {
    name: 'Palak Paneer',
    calories: 400, protein: 26,
    tags: ['veg', 'vegetarian', 'paneer', 'spinach', 'indian'],
    description: 'Cottage cheese cubes in smooth spiced spinach gravy',
    instructions: ['Blanch and blend fresh spinach to smooth puree', 'Cook onion, tomato, ginger-garlic & spices', 'Add spinach puree and bring to simmer', 'Fold in paneer cubes and finish with cream']
  },
  {
    name: 'Mixed Vegetable Stir Fry',
    calories: 280, protein: 12,
    tags: ['veg', 'vegetarian', 'stir fry', 'low calorie'],
    description: 'Colorful vegetables stir-fried in garlic sauce with brown rice',
    instructions: ['Heat oil in wok over high heat', 'Add garlic, then broccoli, bell peppers, carrots & snap peas', 'Toss in soy sauce, sesame oil & oyster sauce', 'Serve over steamed brown rice']
  },
  {
    name: 'Mushroom & Spinach Omelette',
    calories: 290, protein: 22,
    tags: ['veg', 'vegetarian', 'egg', 'eggs', 'mushroom', 'breakfast'],
    description: 'Fluffy omelette stuffed with sautéed mushrooms and wilted spinach',
    instructions: ['Sauté sliced mushrooms in butter until golden', 'Add baby spinach and cook until wilted', 'Whisk 3 eggs and pour into pan', 'Add mushroom filling, fold omelette and serve']
  },
  {
    name: 'Rajma (Kidney Bean Curry)',
    calories: 380, protein: 17,
    tags: ['veg', 'vegetarian', 'indian', 'dinner'],
    description: 'Slow-cooked red kidney beans in rich tomato-onion gravy with spices',
    instructions: ['Soak and pressure cook kidney beans until soft', 'Cook onion-tomato masala with bay leaf & whole spices', 'Add cooked beans and simmer on low heat', 'Garnish with cream and serve with rice']
  },
  {
    name: 'Teriyaki Salmon Rice Bowl',
    calories: 540, protein: 42,
    tags: ['fish', 'salmon', 'bowl', 'dinner'],
    description: 'Pan-seared Atlantic salmon with jasmine rice, edamame & sesame glaze',
    instructions: ['Season salmon fillet with lemon & black pepper', 'Sear skin-side down in hot skillet 4 mins, flip 3 mins', 'Brush with teriyaki glaze', 'Serve over steamed rice with edamame & sesame']
  },
  {
    name: 'Ribeye Steak & Sweet Potatoes',
    calories: 620, protein: 48,
    tags: ['beef', 'steak', 'dinner', 'high protein'],
    description: 'Grass-fed ribeye steak with roasted sweet potato wedges & green beans',
    instructions: ['Toss sweet potatoes in olive oil & paprika, bake at 400°F for 25 mins', 'Sear ribeye in cast-iron skillet 3-4 mins per side with garlic butter', 'Sauté green beans in pan drippings', 'Rest steak 5 minutes before serving']
  },
  {
    name: 'Greek Yogurt Berry Crunch',
    calories: 290, protein: 28,
    tags: ['yogurt', 'breakfast', 'snack', 'vegetarian', 'veg'],
    description: 'Whole milk Greek yogurt with fresh blueberries, honey & granola',
    instructions: ['Scoop 1 cup plain Greek yogurt into a bowl', 'Layer with fresh blueberries and honey', 'Top with toasted almond granola & chia seeds']
  },
  {
    name: 'Beef Burrito Protein Bowl',
    calories: 580, protein: 44,
    tags: ['beef', 'bowl', 'lunch', 'dinner'],
    description: 'Seasoned lean minced beef, black beans, brown rice, salsa & guacamole',
    instructions: ['Sauté 93/7 lean ground beef with taco spices & garlic', 'Warm black beans and sweet corn', 'Base bowl with cilantro lime brown rice & seasoned beef', 'Top with fresh salsa & guacamole']
  },
  {
    name: 'Pan-Seared Cod & Asparagus',
    calories: 370, protein: 40,
    tags: ['fish', 'cod', 'dinner', 'low calorie'],
    description: 'Fresh cod fillet with lemon herb butter and roasted asparagus',
    instructions: ['Pat cod dry and season with lemon pepper', 'Pan-fry in olive oil 3-4 mins per side', 'Roast asparagus with olive oil at 400°F for 12 mins', 'Spoon lemon herb butter over cod']
  },
  {
    name: 'Tuna Poke & Quinoa Bowl',
    calories: 430, protein: 36,
    tags: ['fish', 'tuna', 'bowl', 'lunch'],
    description: 'Fresh yellowfin tuna, quinoa, cucumber, mango & ponzu dressing',
    instructions: ['Dice sushi-grade tuna into cubes', 'Toss with soy sauce, sesame oil & green onion', 'Assemble over cooked quinoa with cucumber & mango', 'Drizzle with ponzu sauce']
  },
  {
    name: 'Cottage Cheese Oat Pancakes',
    calories: 380, protein: 30,
    tags: ['vegetarian', 'veg', 'breakfast', 'oats'],
    description: 'High-protein oat pancakes topped with banana & maple syrup',
    instructions: ['Blend 1/2 cup cottage cheese, 1/2 cup oats, 2 eggs & vanilla', 'Pour batter onto hot greased griddle', 'Cook until bubbles form, flip until golden', 'Top with banana slices and maple syrup']
  },
  {
    name: 'Mediterranean Chicken Pasta',
    calories: 560, protein: 44,
    tags: ['chicken', 'pasta', 'lunch', 'dinner'],
    description: 'Whole wheat penne, grilled chicken, cherry tomatoes & kalamata olives',
    instructions: ['Boil whole wheat penne until al dente', 'Sauté chicken with garlic & cherry tomatoes', 'Toss pasta with chicken, olives & fresh basil', 'Garnish with parmesan']
  },
  {
    name: 'Aloo Gobi (Potato & Cauliflower)',
    calories: 290, protein: 8,
    tags: ['veg', 'vegetarian', 'indian', 'dinner'],
    description: 'Dry-spiced potato and cauliflower with mustard seeds and turmeric',
    instructions: ['Heat oil, add mustard seeds and cumin till they splutter', 'Add diced potato & cauliflower florets', 'Cook with turmeric, coriander, garam masala & salt', 'Cover and cook on low till tender, garnish with coriander']
  },
  {
    name: 'Egg Curry',
    calories: 370, protein: 26,
    tags: ['egg', 'eggs', 'indian', 'curry', 'dinner'],
    description: 'Hard boiled eggs in spiced onion-tomato gravy with coconut milk',
    instructions: ['Hard boil eggs, peel and shallow fry till golden', 'Make thick masala with onion, tomato & spices', 'Add eggs to masala and simmer 8 mins', 'Finish with coconut milk and fresh coriander']
  },
  {
    name: 'Chicken Salad with Quinoa',
    calories: 420, protein: 40,
    tags: ['chicken', 'salad', 'lunch', 'high protein'],
    description: 'Shredded grilled chicken with quinoa, avocado, cucumber & lemon dressing',
    instructions: ['Cook quinoa and let cool', 'Shred grilled chicken breast', 'Combine with diced avocado, cucumber & cherry tomatoes', 'Dress with lemon olive oil vinaigrette']
  }
]

function getRandomMealSelection(count = 6, query = '') {
  let list = [...REAL_MEAL_DATABASE]
  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase().trim()
    // First try matching tags (exact keyword categories like 'egg', 'chicken', 'veg')
    const tagMatched = list.filter((m) => Array.isArray(m.tags) && m.tags.some((t) => t.includes(q) || q.includes(t)))
    // Then try full-text search across name, description, instructions
    const textMatched = list.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (Array.isArray(m.instructions) && m.instructions.some((i) => i.toLowerCase().includes(q)))
    )
    // Merge: tag matches first, then text matches, deduplicated
    const merged = [...new Map([...tagMatched, ...textMatched].map((m) => [m.name, m])).values()]
    if (merged.length > 0) list = merged
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

    const systemPrompt = `You are a professional nutritionist AI. When the user provides a food keyword or ingredient, generate meal suggestions STRICTLY based on that keyword. If they say "chicken", all meals must be chicken-based. If they say "egg", all meals must be egg-based. If they say "veg" or "vegetarian", all meals must be vegetarian. Always include Indian and international options. Return ONLY valid JSON array, no extra text:
[{"name": "Meal Name", "calories": 430, "protein": 32, "description": "Short appetizing description (1 line)", "instructions": ["Step 1", "Step 2", "Step 3", "Step 4"]}]`

    const userMessage = `Create 6 different delicious ${mealType} options.
Fitness goal: ${userGoal.replace('_', ' ')}.
Calories remaining today: ${Math.round(remainingCalories)} kcal. Protein remaining: ${Math.round(remainingProtein)}g.
${customRequest ? `KEYWORD/INGREDIENT (MUST use this in ALL meals): "${customRequest}"` : 'Suggest a balanced variety of meals.'}
Make them realistic, nutritious and varied. Random seed: ${Date.now()}.`

    try {
      const data = await sendAIMessage([
        { role: 'user', content: systemPrompt },
        { role: 'user', content: userMessage },
      ])
      const rawText = data?.choices?.[0]?.message?.content
      if (!rawText) throw new Error('No response from AI')

      const jsonMatch = String(rawText).match(/\[[\s\S]*\]/)
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
      const normalized = normalizeAIMeals(parsed)

      if (normalized.length > 0) {
        const shuffled = normalized.sort(() => 0.5 - Math.random()).slice(0, 6)
        setAiSuggestions(shuffled)
      } else {
        throw new Error('No valid meals returned')
      }
    } catch (err) {
      console.warn('AI failed, using keyword-smart local database:', err)
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
