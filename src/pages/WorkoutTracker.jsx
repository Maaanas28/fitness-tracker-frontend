import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Dumbbell, Plus, Trash2, Save, Calendar, 
  TrendingUp, Check, X 
} from 'lucide-react'

function WorkoutTracker() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('today')
  const [showAddExercise, setShowAddExercise] = useState(false)
  
  // Current workout state
  const [currentWorkout, setCurrentWorkout] = useState([
    {
      id: 1,
      name: 'Bench Press',
      sets: [
        { reps: 10, weight: 60, completed: true },
        { reps: 8, weight: 70, completed: true },
        { reps: 6, weight: 80, completed: false },
      ]
    },
    {
      id: 2,
      name: 'Squats',
      sets: [
        { reps: 12, weight: 80, completed: true },
        { reps: 10, weight: 90, completed: false },
      ]
    }
  ])

  // Workout history (dummy data)
  const workoutHistory = [
    {
      date: '2026-02-14',
      exercises: 5,
      duration: '45 min',
      calories: 320
    },
    {
      date: '2026-02-12',
      exercises: 4,
      duration: '38 min',
      calories: 280
    },
    {
      date: '2026-02-10',
      exercises: 6,
      duration: '52 min',
      calories: 380
    },
  ]

  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: 10,
    weight: 0
  })

  const addExercise = () => {
    if (newExercise.name.trim()) {
      const exercise = {
        id: Date.now(),
        name: newExercise.name,
        sets: Array(newExercise.sets).fill().map(() => ({
          reps: newExercise.reps,
          weight: newExercise.weight,
          completed: false
        }))
      }
      setCurrentWorkout([...currentWorkout, exercise])
      setNewExercise({ name: '', sets: 3, reps: 10, weight: 0 })
      setShowAddExercise(false)
    }
  }

  const toggleSetComplete = (exerciseId, setIndex) => {
    setCurrentWorkout(currentWorkout.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSets = [...exercise.sets]
        newSets[setIndex].completed = !newSets[setIndex].completed
        return { ...exercise, sets: newSets }
      }
      return exercise
    }))
  }

  const removeExercise = (exerciseId) => {
    setCurrentWorkout(currentWorkout.filter(ex => ex.id !== exerciseId))
  }

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
              <h1 className="text-2xl font-bold text-white">Workout Tracker</h1>
              <p className="text-gray-400 text-sm">Track your training sessions</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddExercise(true)}
          className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Exercise
        </button>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'today'
                ? 'text-lime-500 border-b-2 border-lime-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today's Workout
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-lime-500 border-b-2 border-lime-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'today' ? (
          <>
            {/* Today's Workout */}
            {currentWorkout.length > 0 ? (
              <div className="space-y-4">
                {currentWorkout.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="space-y-3">
                      {exercise.sets.map((set, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                            set.completed ? 'bg-lime-500/20' : 'bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-semibold w-16">
                              Set {index + 1}
                            </span>
                            <div className="flex gap-6">
                              <div>
                                <span className="text-gray-400 text-sm">Reps: </span>
                                <span className="text-white font-semibold">{set.reps}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm">Weight: </span>
                                <span className="text-white font-semibold">{set.weight} kg</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSetComplete(exercise.id, index)}
                            className={`p-2 rounded-lg transition-colors ${
                              set.completed
                                ? 'bg-lime-500 text-black'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            {set.completed ? <Check size={20} /> : <Check size={20} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Save Workout Button */}
                <button className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Save size={20} />
                  Save Workout
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-12 rounded-2xl text-center">
                <Dumbbell className="text-gray-600 mx-auto mb-4" size={64} />
                <p className="text-gray-400 text-lg mb-4">
                  No exercises added yet. Start your workout!
                </p>
                <button
                  onClick={() => setShowAddExercise(true)}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Add First Exercise
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Workout History */}
            <div className="space-y-4">
              {workoutHistory.map((workout, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-lime-500/20 p-3 rounded-lg">
                        <Calendar className="text-lime-500" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {new Date(workout.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-gray-400 text-sm">{workout.duration}</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{workout.exercises}</p>
                        <p className="text-gray-400 text-sm">exercises</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-lime-500">{workout.calories}</p>
                        <p className="text-gray-400 text-sm">calories</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Add Exercise</h3>
              <button
                onClick={() => setShowAddExercise(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  placeholder="e.g., Bench Press"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-2">
                    Sets
                  </label>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value)})}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-2">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({...newExercise, reps: parseInt(e.target.value)})}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise({...newExercise, weight: parseFloat(e.target.value)})}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={addExercise}
                className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-lg transition-colors"
              >
                Add Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkoutTracker