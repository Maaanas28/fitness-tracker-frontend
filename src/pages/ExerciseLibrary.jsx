import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Search, Dumbbell, Target, Zap, 
  TrendingUp, Activity, Heart
} from 'lucide-react'
import { exercises } from '../data/exercises'

function ExerciseLibrary() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('chest')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'chest', name: 'Chest', icon: Heart, color: 'bg-red-500' },
    { id: 'back', name: 'Back', icon: Activity, color: 'bg-blue-500' },
    { id: 'arms', name: 'Arms', icon: Zap, color: 'bg-yellow-500' },
    { id: 'legs', name: 'Legs', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'shoulders', name: 'Shoulders', icon: Target, color: 'bg-purple-500' },
    { id: 'core', name: 'Core', icon: Dumbbell, color: 'bg-orange-500' }
  ]

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'text-green-500 bg-green-500/20'
      case 'Intermediate': return 'text-yellow-500 bg-yellow-500/20'
      case 'Advanced': return 'text-red-500 bg-red-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const filteredExercises = exercises[selectedCategory].filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <Dumbbell className="text-lime-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
              <p className="text-gray-400 text-sm">Browse exercises by muscle group</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-xl border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-lime-500 text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="mx-auto mb-2" size={28} />
                <p className="font-semibold text-sm">{category.name}</p>
              </button>
            )
          })}
        </div>

        {/* Exercise Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing <span className="text-lime-500 font-semibold">{filteredExercises.length}</span> exercises
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Exercise Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <div 
                key={exercise.id}
                className="bg-gray-800 p-6 rounded-2xl hover:bg-gray-750 transition-all transform hover:scale-[1.02]"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{exercise.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-400 bg-gray-700">
                        {exercise.equipment}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${categories.find(c => c.id === selectedCategory)?.color}`}>
                    <Dumbbell size={24} className="text-white" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 mb-4">{exercise.description}</p>

                {/* Sets & Reps */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-900 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Sets</p>
                    <p className="text-white font-bold">{exercise.sets}</p>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Reps</p>
                    <p className="text-white font-bold">{exercise.reps}</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-lime-500/10 border border-lime-500/30 p-4 rounded-lg">
                  <p className="text-lime-500 font-semibold text-sm mb-1">💡 Pro Tip</p>
                  <p className="text-gray-300 text-sm">{exercise.tips}</p>
                </div>

                {/* Add to Workout Button */}
                <button className="w-full mt-4 bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 rounded-lg transition-colors">
                  Add to Workout
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <Search className="text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-400 text-lg">No exercises found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExerciseLibrary