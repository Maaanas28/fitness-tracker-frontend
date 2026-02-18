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
    { label: 'Weight Lost', value: '4.5 kg', icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-500/10', delta: '+0.5kg this week' },
    { label: 'Total Workouts', value: '87', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', delta: '+3 this week' },
    { label: 'Current Streak', value: '12 days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', delta: '🔥 on fire!' },
    { label: 'Avg Calories', value: '2,350', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10', delta: 'in target zone' },
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
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg backdrop-blur-sm">
        <p className="text-slate-200 font-bold text-sm mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-400">{item.name}:</span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 font-sans overflow-x-hidden relative">
      {/* Header */}
      <motion.header 
        className="bg-slate-900/80 backdrop-blur-sm p-5 px-8 flex items-center gap-6 border-b border-slate-800 sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.button 
          onClick={() => navigate('/dashboard')}
          className="p-3 hover:bg-slate-800 rounded-lg transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="text-slate-400 hover:text-white" size={24} strokeWidth={2} />
        </motion.button>
        <div className="flex items-center gap-4">
          <div className="relative">
            <TrendingUp className="text-blue-400" size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Progress Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Track your fitness journey</p>
          </div>
        </div>
        
        <div className="ml-auto hidden md:flex items-center gap-8">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">87</div>
            <div className="text-[10px] text-slate-500 mt-1">Workouts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">12d</div>
            <div className="text-[10px] text-slate-500 mt-1">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">4.5kg</div>
            <div className="text-[10px] text-slate-500 mt-1">Lost</div>
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
                className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className={`${stat.bg} p-3 rounded-xl`}>
                    <Icon className={stat.color} size={24} strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <Activity className="text-green-500 animate-pulse" size={14} />
                    <span className="text-green-400">{stat.delta}</span>
                  </div>
                </div>
                
                <p className="text-slate-500 text-[11px] font-medium uppercase tracking-widest mt-4 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weight Progress Chart */}
          <motion.div 
            className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Weight Progression</h2>
                <p className="text-slate-500 text-sm mt-1">Track your transformation journey</p>
              </div>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((range) => (
                  <motion.button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-lg transition-all ${
                      timeRange === range 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="h-[280px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={40}
                    domain={[78, 86]}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3b82f610' }} />
                  <ReferenceLine y={80} stroke="#6b7280" strokeDasharray="3 3" />
                  
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#weightGradient)" 
                    fillOpacity={0.6}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1">Start</div>
                <div className="font-bold text-lg text-slate-200">85.0 kg</div>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1">Current</div>
                <div className="font-bold text-lg text-green-400">80.5 kg</div>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1">Target</div>
                <div className="font-bold text-lg text-blue-400">80.0 kg</div>
              </div>
            </div>
          </motion.div>

          {/* Macro Distribution */}
          <motion.div 
            className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100">Macro Split</h2>
              <BarChart3 className="text-blue-400" size={24} />
            </div>
            
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                  >
                    {macroDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <text 
                    x="50%" 
                    y="45%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-lg font-bold fill-slate-200"
                  >
                    Daily
                  </text>
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    formatter={(value, entry) => (
                      <span className="text-[11px] font-medium text-slate-300">{value} - {entry.payload.value}%</span>
                    )}
                    wrapperStyle={{ 
                      paddingTop: '15px',
                      textAlign: 'center'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-red-400 font-medium">PROTEIN</span>
                <span className="text-slate-200 font-medium">157g (35%)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-400 font-medium">CARBS</span>
                <span className="text-slate-200 font-medium">281g (45%)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-green-400 font-medium">FATS</span>
                <span className="text-slate-200 font-medium">55g (20%)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Workout Frequency */}
          <motion.div 
            className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Workout Frequency</h2>
                <p className="text-slate-500 text-sm mt-1">Monthly session tracking</p>
              </div>
              <Target className="text-blue-400" size={24} />
            </div>
            
            <div className="h-[240px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutFrequency} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={40}
                  />
                  <Tooltip 
                    cursor={{ fill: '#3b82f610' }}
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155', 
                      borderRadius: '10px'
                    }}
                    labelStyle={{ color: '#cbd5e1', fontWeight: 500 }}
                  />
                  
                  <Bar 
                    dataKey="workouts" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
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
                <div className="text-[11px] text-slate-500 mb-1">Average</div>
                <div className="font-bold text-lg text-slate-200">17.4</div>
                <div className="text-[10px] text-slate-600">sessions/month</div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Trend</div>
                <div className="font-bold text-lg text-cyan-400">+83%</div>
                <div className="text-[10px] text-slate-600">vs last year</div>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Best Month</div>
                <div className="font-bold text-lg text-green-400">22</div>
                <div className="text-[10px] text-slate-600">sessions (May)</div>
              </div>
            </div>
          </motion.div>

          {/* Calorie Tracking */}
          <motion.div 
            className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Calorie Balance</h2>
                <p className="text-slate-500 text-sm mt-1">Daily intake vs expenditure</p>
              </div>
              <Flame className="text-amber-400" size={24} />
            </div>
            
            <div className="h-[240px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calorieData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
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
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f59e0b10' }} />
                  <ReferenceLine y={2500} stroke="#6b7280" strokeDasharray="3 3" />
                  
                  <Area 
                    type="monotone" 
                    dataKey="consumed" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fill="url(#consumedGradient)" 
                    fillOpacity={0.6}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="burned" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fill="url(#burnedGradient)" 
                    fillOpacity={0.6}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                <div className="text-[11px] text-slate-500 mb-1">Avg Consumed</div>
                <div className="font-bold text-lg text-amber-400">2,385 kcal</div>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                <div className="text-[11px] text-slate-500 mb-1">Avg Burned</div>
                <div className="font-bold text-lg text-green-400">2,842 kcal</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Photos */}
        <motion.div 
          className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Progress Gallery</h2>
              <p className="text-slate-500 text-sm mt-1">Visual documentation of your journey</p>
            </div>
            <motion.button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera size={16} />
              Add Photo
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progressPhotos.map((photo, index) => (
              <motion.div 
                key={photo.id} 
                className="group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <div className="aspect-square bg-slate-900/50 border border-slate-700 rounded-xl flex items-center justify-center hover:border-slate-600 hover:scale-105 transition-all cursor-pointer">
                  <Camera className="text-slate-600" size={32} strokeWidth={1.5} />
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <p className="text-slate-200 font-medium text-sm">{photo.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{photo.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add Photo Button */}
            <motion.button 
              className="aspect-square bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-slate-600 hover:bg-slate-900/50 transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                <Plus className="text-white" size={20} strokeWidth={2} />
              </div>
              <p className="text-slate-400 text-sm font-medium">New Photo</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div 
          className="bg-slate-800/50 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Achievements</h2>
              <p className="text-slate-500 text-sm mt-1">Milestones and badges earned</p>
            </div>
            <Star className="text-yellow-400" size={24} />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-xl ${achievement.unlocked ? 'border-l-4 border-yellow-500 bg-slate-900/50' : 'bg-slate-900/30'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl mb-2">{achievement.emoji}</p>
                    <p className={`font-bold ${achievement.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                      {achievement.title}
                    </p>
                    <p className={`text-sm mt-1 ${achievement.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                      {achievement.desc}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <Award className="text-yellow-500" size={20} />
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className={`${achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'} font-medium`}>
                      {achievement.progress}%
                    </span>
                    <span className={`${achievement.unlocked ? 'text-green-400' : 'text-slate-500'} font-medium`}>
                      {achievement.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${achievement.unlocked ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-slate-700'}`}
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
    </div>
  )
}

export default ProgressPage