import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, TrendingUp, Calendar, Target, Award,
  Camera, Plus, Flame, BarChart3, Activity, Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts'

function ProgressPage() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('month')

  const weightData = [
    { date: 'Week 1', weight: 85, goal: 80 },
    { date: 'Week 2', weight: 84, goal: 80 },
    { date: 'Week 3', weight: 83.5, goal: 80 },
    { date: 'Week 4', weight: 82.8, goal: 80 },
    { date: 'Week 5', weight: 82, goal: 80 },
    { date: 'Week 6', weight: 81.5, goal: 80 },
    { date: 'Week 7', weight: 81, goal: 80 },
    { date: 'Week 8', weight: 80.5, goal: 80 },
  ]

  const workoutFrequency = [
    { month: 'Jan', workouts: 12, intensity: 75 },
    { month: 'Feb', workouts: 15, intensity: 82 },
    { month: 'Mar', workouts: 18, intensity: 88 },
    { month: 'Apr', workouts: 20, intensity: 92 },
    { month: 'May', workouts: 22, intensity: 95 },
  ]

  const calorieData = [
    { day: 'Mon', consumed: 2100, target: 2500, burned: 2800 },
    { day: 'Tue', consumed: 2400, target: 2500, burned: 2900 },
    { day: 'Wed', consumed: 2200, target: 2500, burned: 3100 },
    { day: 'Thu', consumed: 2600, target: 2500, burned: 2700 },
    { day: 'Fri', consumed: 2300, target: 2500, burned: 3000 },
    { day: 'Sat', consumed: 2700, target: 2500, burned: 2600 },
    { day: 'Sun', consumed: 2400, target: 2500, burned: 2800 },
  ]

  const macroDistribution = [
    { name: 'Protein', value: 35, color: '#ef4444' },
    { name: 'Carbs', value: 45, color: '#3b82f6' },
    { name: 'Fats', value: 20, color: '#22c55e' },
  ]

  const progressPhotos = [
    { id: 1, date: '2026-01-01', label: 'Start', image: null },
    { id: 2, date: '2026-01-15', label: '2 Weeks', image: null },
    { id: 3, date: '2026-02-01', label: '1 Month', image: null },
    { id: 4, date: '2026-02-15', label: '6 Weeks', image: null },
  ]

  const stats = [
    { label: 'Weight Lost', value: '4.5 kg', icon: TrendingUp, color: 'from-red-500 to-rose-600', delta: '+0.5kg this week' },
    { label: 'Total Workouts', value: '87', icon: Target, color: 'from-blue-500 to-cyan-600', delta: '+3 this week' },
    { label: 'Current Streak', value: '12 days', icon: Flame, color: 'from-orange-500 to-amber-600', delta: '🔥 on fire!' },
    { label: 'Avg Calories', value: '2,350', icon: Calendar, color: 'from-purple-500 to-pink-600', delta: 'in target zone' },
  ]

  const achievements = [
    { emoji: '🔥', title: '30 Day Streak', desc: 'Worked out for 30 days straight', progress: 100, unlocked: true },
    { emoji: '💪', title: '100 Workouts', desc: 'Completed 100 total workouts', progress: 87, unlocked: false },
    { emoji: '⚡', title: 'Goal Crusher', desc: 'Reached your weight goal', progress: 94, unlocked: false },
    { emoji: '🏆', title: 'Macro Master', desc: 'Perfect nutrition for 7 days', progress: 65, unlocked: false },
    { emoji: '🌙', title: 'Night Owl', desc: 'Worked out after midnight 10x', progress: 40, unlocked: false },
    { emoji: '💯', title: 'Perfect Week', desc: 'Hit all targets for 7 days', progress: 28, unlocked: false },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-black/95 border border-red-500/30 rounded-xl p-4 shadow-lg shadow-red-500/20 backdrop-blur-sm">
        <p className="text-red-400 font-bold text-sm mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-300">{item.name}:</span>
              <span className="font-bold" style={{ color: item.color }}>
                {item.value}{item.dataKey === 'weight' ? ' kg' : item.dataKey === 'burned' || item.dataKey === 'consumed' ? ' kcal' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0205] to-[#11050a] text-white font-sans overflow-x-hidden relative">
      {/* ATMOSPHERIC GLOW */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.06),transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.04),transparent_45%)]" />
      
      {/* Header */}
      <motion.header 
        className="bg-black/60 backdrop-blur-xl p-5 px-8 flex items-center gap-6 border-b border-red-500/10 sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.button 
          onClick={() => navigate('/dashboard')}
          className="p-3 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="text-red-400" size={24} strokeWidth={2} />
        </motion.button>
        <div className="flex items-center gap-4">
          <div className="relative">
            <TrendingUp className="text-red-400" size={36} strokeWidth={2} />
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">
              PROGRESS HUB
            </h1>
            <p className="text-sm font-mono text-red-500/70 mt-1">// Your Journey Visualized</p>
          </div>
        </div>
        
        <div className="ml-auto hidden md:flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">
              87
            </div>
            <div className="text-[11px] text-red-500/60 mt-1">TOTAL SESSIONS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              12d
            </div>
            <div className="text-[11px] text-red-500/60 mt-1">STREAK</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
              4.5kg
            </div>
            <div className="text-[11px] text-red-500/60 mt-1">WEIGHT LOST</div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div 
                key={index} 
                className="glass-card rounded-2xl border border-red-500/10 p-7 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ borderColor: 'rgba(220,38,38,0.5)', scale: 1.03, boxShadow: '0 10px 40px rgba(220,38,38,0.2)' }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-30`} />
                
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 bg-black/40 rounded-xl">
                    <Icon className={`text-${stat.color.split(' ')[0].replace('from-', '')}`} size={28} strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <Activity className="text-green-500 animate-pulse" size={14} />
                    <span className="text-green-400">{stat.delta}</span>
                  </div>
                </div>
                
                <p className="text-red-500/70 text-[11px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                <motion.p 
                  className="text-4xl font-black bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${stat.color.replace('from-', '#').replace(' to-', ', #')})` 
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.3 }}
                >
                  {stat.value}
                </motion.p>
                
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            )
          })}
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weight Progress Chart */}
          <motion.div 
            className="lg:col-span-2 glass-card rounded-2xl border border-red-500/10 p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ borderColor: 'rgba(220,38,38,0.4)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-30" />
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <TrendingUp className="text-red-400" size={28} />
                  Weight Progression
                </h2>
                <p className="text-red-500/60 text-sm mt-1">Track your transformation journey</p>
              </div>
              <div className="flex gap-3">
                {['week', 'month', 'year'].map((range) => (
                  <motion.button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-5 py-2.5 font-bold text-sm uppercase tracking-wider rounded-xl transition-all ${
                      timeRange === range 
                        ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/20' 
                        : 'bg-black/40 text-red-500/70 hover:bg-black/60'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="h-[320px] -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#333' }} 
                    tick={{ fill: '#aaa' }}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={40}
                    tick={{ fill: '#aaa' }}
                    domain={[78, 86]}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ef444410' }} />
                  <ReferenceLine y={80} stroke="#6b7280" strokeDasharray="3 3" label={{ value: 'Goal: 80kg', position: 'insideTopLeft', fill: '#6b7280', fontSize: 11 }} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="url(#weightGradient)" 
                    fillOpacity={0.6}
                    dot={{ fill: '#ef4444', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 10 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-xl">
                <div className="text-[11px] text-red-500/60 mb-1.5">START WEIGHT</div>
                <div className="font-bold text-xl text-red-400">85.0 kg</div>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-xl">
                <div className="text-[11px] text-green-500/60 mb-1.5">CURRENT WEIGHT</div>
                <div className="font-bold text-xl text-green-400">80.5 kg</div>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-xl">
                <div className="text-[11px] text-blue-500/60 mb-1.5">TARGET WEIGHT</div>
                <div className="font-bold text-xl text-blue-400">80.0 kg</div>
              </div>
            </div>
          </motion.div>

          {/* Macro Distribution */}
          <motion.div 
            className="glass-card rounded-2xl border border-blue-500/10 p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ borderColor: 'rgba(59,130,246,0.4)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-30" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Macro Split</h2>
              <BarChart3 className="text-blue-400" size={28} />
            </div>
            
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    animationDuration={1000}
                  >
                    {macroDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="black"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <text 
                    x="50%" 
                    y="45%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-3xl font-bold fill-white"
                  >
                    100%
                  </text>
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    formatter={(value, entry) => (
                      <span className="text-sm font-bold text-white">{value} - {entry.payload.value}%</span>
                    )}
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      textAlign: 'center',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-400 font-bold">PROTEIN</span>
                <span className="text-white font-bold">157g (35%)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-cyan-400 font-bold">CARBS</span>
                <span className="text-white font-bold">281g (45%)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-green-400 font-bold">FATS</span>
                <span className="text-white font-bold">55g (20%)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Workout Frequency */}
          <motion.div 
            className="glass-card rounded-2xl border border-blue-500/10 p-8 relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ borderColor: 'rgba(59,130,246,0.4)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-30" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Workout Frequency</h2>
                <p className="text-blue-500/60 text-sm mt-1">Monthly session tracking</p>
              </div>
              <Target className="text-blue-400" size={28} />
            </div>
            
            <div className="h-[280px] -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutFrequency} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#333' }} 
                    tick={{ fill: '#aaa' }}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={40}
                    tick={{ fill: '#aaa' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#3b82f610' }}
                    contentStyle={{ 
                      backgroundColor: '#0a0a0a', 
                      border: '1px solid #222', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                    labelStyle={{ color: '#ccc', fontWeight: 600 }}
                    formatter={(value, name) => [`${value} ${name === 'workouts' ? 'sessions' : 'intensity'}`, name]}
                  />
                  
                  <Bar 
                    dataKey="workouts" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]} 
                    barSize={40}
                    animationDuration={1000}
                  >
                    {workoutFrequency.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === workoutFrequency.length - 1 ? '#60a5fa' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex items-center justify-between text-center">
              <div>
                <div className="text-[11px] text-blue-500/60 mb-1.5">AVERAGE</div>
                <div className="font-bold text-xl text-blue-400">17.4</div>
                <div className="text-[10px] text-blue-500/40">sessions/month</div>
              </div>
              <div className="w-px h-12 bg-blue-500/20" />
              <div>
                <div className="text-[11px] text-cyan-500/60 mb-1.5">TREND</div>
                <div className="font-bold text-xl text-cyan-400">+83%</div>
                <div className="text-[10px] text-cyan-500/40">vs last year</div>
              </div>
              <div className="w-px h-12 bg-blue-500/20" />
              <div>
                <div className="text-[11px] text-green-500/60 mb-1.5">BEST MONTH</div>
                <div className="font-bold text-xl text-green-400">22</div>
                <div className="text-[10px] text-green-500/40">sessions (May)</div>
              </div>
            </div>
          </motion.div>

          {/* Calorie Tracking */}
          <motion.div 
            className="glass-card rounded-2xl border border-amber-500/10 p-8 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ borderColor: 'rgba(245,158,11,0.4)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 opacity-30" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Calorie Balance</h2>
                <p className="text-amber-500/60 text-sm mt-1">Daily intake vs expenditure</p>
              </div>
              <Flame className="text-amber-400" size={28} />
            </div>
            
            <div className="h-[280px] -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calorieData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="consumedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="burnedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#333' }} 
                    tick={{ fill: '#aaa' }}
                  />
                  <YAxis 
                    stroke="#666" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={50}
                    tick={{ fill: '#aaa' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f59e0b10' }} />
                  <ReferenceLine y={2500} stroke="#6b7280" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#6b7280', fontSize: 11 }} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="consumed" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fill="url(#consumedGradient)" 
                    fillOpacity={0.6}
                    dot={{ fill: '#f59e0b', strokeWidth: 3, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="burned" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    fill="url(#burnedGradient)" 
                    fillOpacity={0.6}
                    dot={{ fill: '#22c55e', strokeWidth: 3, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-xl">
                <div className="text-[11px] text-amber-500/60 mb-1.5">AVG CONSUMED</div>
                <div className="font-bold text-xl text-amber-400">2,385 kcal</div>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-xl">
                <div className="text-[11px] text-green-500/60 mb-1.5">AVG BURNED</div>
                <div className="font-bold text-xl text-green-400">2,842 kcal</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Photos */}
        <motion.div 
          className="glass-card rounded-2xl border border-purple-500/10 p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ borderColor: 'rgba(168,85,247,0.4)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 opacity-30" />
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Camera className="text-purple-400" size={28} />
                Progress Gallery
              </h2>
              <p className="text-purple-500/60 text-sm mt-1">Visual documentation of your journey</p>
            </div>
            <motion.button 
              className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white font-bold px-6 py-3 text-sm uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera size={18} />
              Add Photo
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {progressPhotos.map((photo, index) => (
              <motion.div 
                key={photo.id} 
                className="group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/20 rounded-xl flex items-center justify-center hover:border-purple-500/60 hover:scale-105 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.1)_0%,_transparent_70%)]" />
                  <Camera className="text-purple-500/60" size={48} strokeWidth={1.5} />
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <p className="text-white font-bold text-sm uppercase tracking-tight">{photo.label}</p>
                    <p className="text-purple-400 text-xs font-bold mt-1">{photo.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add Photo Button */}
            <motion.button 
              className="aspect-square bg-black/40 border-2 border-dashed border-purple-500/30 rounded-xl flex flex-col items-center justify-center hover:border-purple-500 hover:bg-purple-500/5 transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center mb-3">
                <Plus className="text-white" size={32} strokeWidth={2} />
              </div>
              <p className="text-purple-400 text-sm font-bold uppercase tracking-wider">New Photo</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div 
          className="glass-card rounded-2xl border border-yellow-500/10 p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ borderColor: 'rgba(234,179,8,0.4)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-600 opacity-30" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Award className="text-yellow-400" size={28} />
                Achievements
              </h2>
              <p className="text-yellow-500/60 text-sm mt-1">Milestones and badges earned</p>
            </div>
            <Star className="text-yellow-400" size={32} />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl border-l-4 ${achievement.unlocked ? 'border-yellow-500 bg-black/30' : 'border-gray-700 bg-black/20'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ x: 5, borderColor: achievement.unlocked ? '#fbbf24' : '#666' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-5xl mb-3">{achievement.emoji}</p>
                    <p className={`font-bold text-lg ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.title}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${achievement.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {achievement.desc}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <Award className="text-yellow-500" size={24} />
                  )}
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {achievement.progress}%
                    </span>
                    <span className={`font-bold ${achievement.unlocked ? 'text-green-400' : 'text-gray-500'}`}>
                      {achievement.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${achievement.unlocked ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-gray-700'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ delay: 1.1 + index * 0.1 + 0.2, duration: 1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* GLASS CARD STYLES */}
      <style jsx global>{`
        .glass-card {
          background: rgba(30, 10, 20, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  )
}

export default ProgressPage
