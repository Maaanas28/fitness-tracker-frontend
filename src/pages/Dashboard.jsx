import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Home, Dumbbell, Apple, TrendingUp, User, LogOut, 
  Target, Flame, Droplet, Calendar, Trophy, ChevronRight, Play,
  Bell, Search, Zap, Activity, X, BarChart3, Award // <-- ADDED ICONS
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, ReferenceLine 
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

// --- DATA CONSTANTS ---
const WEIGHT_DATA = [
  { date: 'Start', weight: 82, label: 'Starting Point' },
  { date: 'Week 2', weight: 80 },
  { date: 'Week 4', weight: 78.5 },
  { date: 'Week 8', weight: 76 },
  { date: 'Week 12', weight: 73 },
  { date: 'Now', weight: 70, label: 'Current' },
]

const WORKOUT_DATA = [
  { day: 'Mon', workouts: 1 },
  { day: 'Tue', workouts: 2 },
  { day: 'Wed', workouts: 1 },
  { day: 'Thu', workouts: 0 },
  { day: 'Fri', workouts: 2 },
  { day: 'Sat', workouts: 1 },
  { day: 'Sun', workouts: 1 },
]

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/dashboard', active: true },
  { icon: Dumbbell, label: 'Train', path: '/workout' },
  { icon: Apple, label: 'Diet', path: '/diet' },
  { icon: TrendingUp, label: 'Stats', path: '/progress' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const QUICK_ACTIONS = [
  { icon: Calendar, label: 'Plan', path: '/workout-plan', keywords: 'schedule program calendar' },
  { icon: Target, label: 'BMI', path: '/calculator', keywords: 'weight height mass index' },
  { icon: Dumbbell, label: 'Exercises', path: '/exercises', keywords: 'library lift gym' },
  { icon: Play, label: 'Timer', path: '/timer', keywords: 'stopwatch clock rest' },
  { icon: Activity, label: 'Analysis', path: '/body-analysis', keywords: 'scan data biometrics' },
]

// --- SUB-COMPONENT: SIDEBAR ---
const Sidebar = ({ navigate }) => (
  <motion.aside 
    className="w-24 py-6 flex flex-col items-center gap-8 border-r border-white/5 bg-[#09090b] relative z-20"
    initial={{ x: -100 }} animate={{ x: 0 }}
  >
    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
        <Zap className="text-white fill-white" size={24} />
    </div>

    <nav className="flex-1 flex flex-col gap-6 w-full px-2 mt-4">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          onClick={() => !item.active && navigate(item.path)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 group ${
            item.active ? 'text-red-500' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <div className={`p-3 rounded-2xl transition-all ${
             item.active ? 'bg-red-500/10' : 'group-hover:bg-white/5'
          }`}>
             <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-wider ${
             item.active ? 'text-red-500' : 'text-zinc-600 group-hover:text-zinc-400'
          }`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>

    <button onClick={() => navigate('/login')} className="p-3 rounded-2xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all">
       <LogOut size={22} />
    </button>
  </motion.aside>
)

// --- SUB-COMPONENT: HEADER ---
const Header = ({ searchQuery, setSearchQuery }) => (
  <header className="flex justify-between items-center px-2 py-2">
      <div>
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
              DASHBOARD <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
          </h1>
          <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">System Operational</p>
      </div>

      <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-[#18181b] border border-white/5 px-4 py-2.5 rounded-full gap-3 text-zinc-400 w-64 hover:border-red-500/30 transition-colors focus-within:border-red-500 focus-within:text-white">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search Tools..." 
                className="bg-transparent outline-none text-xs w-full font-mono placeholder:text-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500">
                  <X size={14} />
                </button>
              )}
          </div>
          <button className="w-10 h-10 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all">
            <Bell size={18} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-900 border border-white/10" />
      </div>
  </header>
)

// --- MAIN COMPONENT ---
function Dashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [quote, setQuote] = useState({ text: '', author: '' })
  
  // NEW: Weekly summary data
  const [weeklySummary, setWeeklySummary] = useState({
    totalWorkouts: 8,
    totalCalories: 2450,
    totalVolume: 28750,
    bestDay: 'Tuesday',
    streak: 5
  })

  // Fetch quote of the day - using more reliable API
useEffect(() => {
  fetch('https://api.adviceslip.com/advice')
    .then(res => res.json())
    .then(data => {
      setQuote({
        text: data.slip.advice,
        author: 'Advice Bot'
      })
    })
    .catch(err => {
      console.log('Quote fetch failed, using backup')
      setQuote({
        text: 'The only bad workout is the one that didn\'t happen.',
        author: 'Anonymous'
      })
    })
}, [])

  const filteredActions = QUICK_ACTIONS.filter(action => 
    action.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    action.keywords.includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-[#09090b] text-white font-sans overflow-hidden selection:bg-red-500 selection:text-white">
      
      <Sidebar navigate={navigate} />

      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col gap-6 relative">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
            
            {/* QUOTE CARD */}
            {quote.text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 p-0.5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.15),transparent_50%)]" />
                <div className="relative bg-[#18181b] rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-2xl text-red-500 font-serif">"</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-zinc-200 leading-relaxed line-clamp-2">
                      {quote.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-red-400">— {quote.author}</span>
                      <span className="w-1 h-1 rounded-full bg-red-500/30" />
                      <span className="text-xs text-zinc-600">Today's Motivation</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.location.reload()}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all flex items-center justify-center group"
                    title="New Quote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-red-400 group-hover:rotate-180 transition-all duration-500">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ROW 1: Hero Chart + CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Weight Chart */}
                <div className="lg:col-span-2 bg-[#18181b] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-red-500" size={20}/> Weight Trajectory
                            </h2>
                            <p className="text-zinc-500 text-xs mt-1">
                               Total Loss: <span className="text-white font-bold">-12kg</span> • Goal: <span className="text-green-500 font-bold">68kg</span>
                            </p>
                        </div>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={WEIGHT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                
                                <YAxis 
                                    domain={['dataMin - 2', 'dataMax + 2']} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#52525b'}}
                                />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#52525b'}} 
                                    dy={10}
                                />
                                
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                    cursor={{ stroke: '#dc2626', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                
                                <ReferenceLine 
                                    y={68} 
                                    stroke="#22c55e" 
                                    strokeDasharray="3 3" 
                                    label={{ value: 'GOAL', position: 'right', fill: '#22c55e', fontSize: 10, fontWeight: 'bold' }} 
                                />
                                
                                <Area 
                                    type="monotone" 
                                    dataKey="weight" 
                                    stroke="#dc2626" 
                                    strokeWidth={3} 
                                    fill="url(#colorWeight)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CTA Card */}
                <div className="bg-[#18181b] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-red-600/20 transition-all duration-500" />
                    <div>
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                             <Target size={24} />
                        </div>
                        <h2 className="text-2xl font-bold leading-tight mb-2">Next Mission</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed">Upper Body Power.<br/><span className="text-red-500 font-bold">45 mins • High Intensity</span></p>
                    </div>
                    <button onClick={() => navigate('/workout')} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group/btn">
                        <Play size={16} className="fill-current" /> Start Session
                    </button>
                </div>
            </div>

            {/* ROW 2: Stats + Weekly Activity + NEW Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Stats */}
                {[
                  { label: 'BMI', val: '22.5', unit: 'Normal', icon: Activity, color: 'text-blue-500' },
                  { label: 'Calories', val: '650', unit: 'KCAL', icon: Flame, color: 'text-orange-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#18181b] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between h-44 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start">
                          <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider">{stat.label}</span>
                          <div className="bg-[#27272a] p-2 rounded-xl text-zinc-400"><stat.icon className={stat.color} size={18} /></div>
                      </div>
                      <div>
                          <div className="text-3xl font-black mb-1">{stat.val}</div>
                          <div className="text-xs text-zinc-500 font-bold">{stat.unit}</div>
                      </div>
                  </div>
                ))}

                {/* Weekly Activity - MOVED TO COL 2 */}
                <div className="bg-[#18181b] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between relative h-44">
                    <div className="flex justify-between items-center">
                         <div>
                            <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider block">Weekly Load</span>
                            <span className="text-2xl font-black text-white">8 <span className="text-sm font-normal text-zinc-500">Sessions</span></span>
                         </div>
                         <BarChart3 className="text-blue-500" size={24} />
                    </div>
                    <div className="h-16 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={WORKOUT_DATA}>
                                <Bar dataKey="workouts" fill="#dc2626" radius={[4, 4, 4, 4]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* NEW: Weekly Summary Card */}
                <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 p-6 rounded-[2rem] flex flex-col justify-between relative h-44 group hover:border-red-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full" />
                    
                    <div className="flex justify-between items-start">
                        <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider">WEEK SUMMARY</span>
                        <Award className="text-yellow-500" size={20} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                            <div className="text-2xl font-black text-white">{weeklySummary.totalWorkouts}</div>
                            <div className="text-[8px] text-zinc-500 uppercase tracking-wider">Workouts</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-orange-400">{weeklySummary.totalCalories}</div>
                            <div className="text-[8px] text-zinc-500 uppercase tracking-wider">Calories</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-blue-400">{(weeklySummary.totalVolume/1000).toFixed(1)}k</div>
                            <div className="text-[8px] text-zinc-500 uppercase tracking-wider">Volume</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-green-400">{weeklySummary.streak}d</div>
                            <div className="text-[8px] text-zinc-500 uppercase tracking-wider">Streak</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <Flame className="text-red-500" size={12} />
                        Best day: <span className="text-white font-bold">{weeklySummary.bestDay}</span>
                    </div>
                </div>
            </div>

            {/* ROW 3: SEARCHABLE Quick Actions */}
            <div className="bg-[#18181b] border border-white/5 rounded-[2rem] p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                       {searchQuery ? `Found ${filteredActions.length} Protocols` : "Quick Protocols"}
                    </h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {filteredActions.length > 0 ? (
                        filteredActions.map((action, i) => (
                          <motion.button 
                               key={action.path}
                               layout
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.9 }}
                               onClick={() => navigate(action.path)}
                               className="flex flex-col items-center gap-4 p-4 rounded-3xl bg-[#27272a]/50 hover:bg-[#27272a] hover:scale-105 transition-all cursor-pointer border border-transparent hover:border-white/5 group"
                          >
                              <div className="w-12 h-12 rounded-2xl bg-[#09090b] border border-white/5 group-hover:border-red-500/50 group-hover:text-red-500 transition-colors flex items-center justify-center text-zinc-400">
                                  <action.icon size={20} />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white text-center">
                                  {action.label}
                              </span>
                          </motion.button>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-zinc-500 text-sm font-mono">
                           No protocols found matching "{searchQuery}"
                        </div>
                      )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
      </main>
    </div>
  )
}
export default Dashboard