import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Home, Dumbbell, Apple, TrendingUp, User, LogOut, 
  Target, Flame, Droplet, Calendar, Trophy, ChevronRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

function Dashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Dummy data for charts
  const weightData = [
    { date: 'Jan', weight: 75 },
    { date: 'Feb', weight: 74 },
    { date: 'Mar', weight: 72.5 },
    { date: 'Apr', weight: 71 },
    { date: 'May', weight: 70 },
  ]

  const workoutData = [
    { day: 'Mon', workouts: 1 },
    { day: 'Tue', workouts: 2 },
    { day: 'Wed', workouts: 1 },
    { day: 'Thu', workouts: 0 },
    { day: 'Fri', workouts: 2 },
    { day: 'Sat', workouts: 1 },
    { day: 'Sun', workouts: 1 },
  ]

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <Dumbbell className="text-lime-500" size={32} />
          {sidebarOpen && <span className="text-xl font-bold text-white">AI Fitness</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-lime-500 text-black font-semibold">
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <Dumbbell size={20} />
            {sidebarOpen && <span>Workout Tracker</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <Apple size={20} />
            {sidebarOpen && <span>Diet Tracker</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <TrendingUp size={20} />
            {sidebarOpen && <span>Progress</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <User size={20} />
            {sidebarOpen && <span>Profile</span>}
          </button>
        </nav>

        {/* Logout */}
        <button 
          onClick={() => navigate('/login')}
          className="m-4 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700 transition-colors"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-800 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome Back, User! 👋</h1>
            <p className="text-gray-400 mt-1">Here's your fitness overview</p>
          </div>
          <button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors">
            Start Workout
          </button>
        </header>

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* BMI Card */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-lime-500/20 p-3 rounded-lg">
                <Target className="text-lime-500" size={24} />
              </div>
              <span className="text-lime-500 text-sm font-semibold">Normal</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">BMI</h3>
            <p className="text-3xl font-bold text-white mt-1">22.5</p>
          </div>

          {/* Calories Card */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Flame className="text-orange-500" size={24} />
              </div>
              <span className="text-orange-500 text-sm font-semibold">1,850 left</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Calories Today</h3>
            <p className="text-3xl font-bold text-white mt-1">650</p>
          </div>

          {/* Water Card */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Droplet className="text-blue-500" size={24} />
              </div>
              <span className="text-blue-500 text-sm font-semibold">75%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Water Intake</h3>
            <p className="text-3xl font-bold text-white mt-1">6 / 8</p>
            <p className="text-gray-500 text-sm mt-1">glasses</p>
          </div>

          {/* Streak Card */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Trophy className="text-yellow-500" size={24} />
              </div>
              <span className="text-yellow-500 text-sm font-semibold">🔥</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Workout Streak</h3>
            <p className="text-3xl font-bold text-white mt-1">12 days</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Progress Chart */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-6">Weight Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#84cc16" strokeWidth={3} dot={{ fill: '#84cc16', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Workouts Chart */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-6">This Week's Workouts</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="workouts" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-700 transition-colors group">
              <div className="flex items-center gap-3">
                <Calendar className="text-lime-500" size={24} />
                <span className="text-white font-semibold">Generate Workout Plan</span>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={20} />
            </button>

             <button 
  onClick={() => navigate('/calculator')}
  className="bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-700 transition-colors group"
>
  <div className="flex items-center gap-3">
    <Target className="text-orange-500" size={24} />
    <span className="text-white font-semibold">Calculate BMI</span>
  </div>
  <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={20} />
</button>

            <button className="bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-700 transition-colors group">
              <div className="flex items-center gap-3">
                <Dumbbell className="text-blue-500" size={24} />
                <span className="text-white font-semibold">Exercise Library</span>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard