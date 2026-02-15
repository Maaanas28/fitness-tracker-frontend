import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, TrendingUp, Calendar, Target, Award,
  Camera, Plus
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

function ProgressPage() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('month')

  // Dummy weight data
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

  // Workout frequency
  const workoutFrequency = [
    { month: 'Jan', workouts: 12 },
    { month: 'Feb', workouts: 15 },
    { month: 'Mar', workouts: 18 },
    { month: 'Apr', workouts: 20 },
    { month: 'May', workouts: 22 },
  ]

  // Calorie tracking
  const calorieData = [
    { day: 'Mon', consumed: 2100, target: 2500 },
    { day: 'Tue', consumed: 2400, target: 2500 },
    { day: 'Wed', consumed: 2200, target: 2500 },
    { day: 'Thu', consumed: 2600, target: 2500 },
    { day: 'Fri', consumed: 2300, target: 2500 },
    { day: 'Sat', consumed: 2700, target: 2500 },
    { day: 'Sun', consumed: 2400, target: 2500 },
  ]

  // Progress photos
  const progressPhotos = [
    { id: 1, date: '2026-01-01', label: 'Start' },
    { id: 2, date: '2026-01-15', label: '2 Weeks' },
    { id: 3, date: '2026-02-01', label: '1 Month' },
  ]

  const stats = [
    { label: 'Weight Lost', value: '4.5 kg', icon: TrendingUp, color: 'text-lime-500' },
    { label: 'Total Workouts', value: '87', icon: Target, color: 'text-blue-500' },
    { label: 'Current Streak', value: '12 days', icon: Award, color: 'text-yellow-500' },
    { label: 'Avg Calories', value: '2,350', icon: Calendar, color: 'text-orange-500' },
  ]

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
            <TrendingUp className="text-lime-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Progress Tracking</h1>
              <p className="text-gray-400 text-sm">Your fitness journey overview</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-gray-800 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={stat.color} size={28} />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Weight Progress Chart */}
        <div className="bg-gray-800 p-6 rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Weight Progress</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timeRange === 'week' ? 'bg-lime-500 text-black' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timeRange === 'month' ? 'bg-lime-500 text-black' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setTimeRange('year')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timeRange === 'year' ? 'bg-lime-500 text-black' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Year
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[78, 86]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#84cc16" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
              />
              <Line 
                type="monotone" 
                dataKey="goal" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-lime-500 rounded"></div>
              <span className="text-gray-400 text-sm">Current Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span className="text-gray-400 text-sm">Goal Weight</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Workout Frequency */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Workout Frequency</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="workouts" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calorie Tracking */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">This Week's Calories</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumed" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Photos */}
        <div className="bg-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Progress Photos</h2>
            <button className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Camera size={18} />
              Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progressPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="bg-gray-700 aspect-square rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <Camera className="text-gray-500" size={48} />
                </div>
                <div className="mt-2">
                  <p className="text-white font-semibold text-sm">{photo.label}</p>
                  <p className="text-gray-400 text-xs">{photo.date}</p>
                </div>
              </div>
            ))}
            
            {/* Add Photo Button */}
            <button className="bg-gray-700 aspect-square rounded-xl flex flex-col items-center justify-center hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-600 hover:border-lime-500">
              <Plus className="text-gray-500 mb-2" size={32} />
              <p className="text-gray-500 text-sm font-semibold">Add Photo</p>
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gray-800 p-6 rounded-2xl mt-6">
          <h2 className="text-2xl font-bold text-white mb-6">Achievements 🏆</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 p-4 rounded-xl">
              <p className="text-4xl mb-2">🔥</p>
              <p className="text-white font-bold">30 Day Streak</p>
              <p className="text-gray-400 text-sm">Worked out for 30 days straight</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-4 rounded-xl">
              <p className="text-4xl mb-2">💪</p>
              <p className="text-white font-bold">100 Workouts</p>
              <p className="text-gray-400 text-sm">Completed 100 total workouts</p>
            </div>
            <div className="bg-gradient-to-br from-lime-500/20 to-lime-600/20 border border-lime-500/30 p-4 rounded-xl">
              <p className="text-4xl mb-2">⚡</p>
              <p className="text-white font-bold">Goal Crusher</p>
              <p className="text-gray-400 text-sm">Reached your weight goal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage