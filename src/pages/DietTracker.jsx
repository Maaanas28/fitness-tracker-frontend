import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Apple, Plus, Trash2, Coffee, 
  Salad, Pizza, X, Flame, TrendingUp
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function DietTracker() {
  const navigate = useNavigate()
  const [showAddFood, setShowAddFood] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState('breakfast')

  // Meals data
  const [meals, setMeals] = useState({
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
  })

  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  })

  // Calculate totals
  const calculateTotals = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFats = 0

    Object.values(meals).forEach(mealArray => {
      mealArray.forEach(food => {
        totalCalories += food.calories
        totalProtein += food.protein
        totalCarbs += food.carbs
        totalFats += food.fats
      })
    })

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats
    }
  }

  const totals = calculateTotals()
  const calorieGoal = 2500
  const remaining = calorieGoal - totals.calories

  // Macro data for pie chart
  const macroData = [
    { name: 'Protein', value: totals.protein * 4, color: '#ef4444' },
    { name: 'Carbs', value: totals.carbs * 4, color: '#3b82f6' },
    { name: 'Fats', value: totals.fats * 9, color: '#f59e0b' }
  ]

  const addFood = () => {
    if (newFood.name && newFood.calories) {
      const food = {
        id: Date.now(),
        name: newFood.name,
        calories: parseInt(newFood.calories),
        protein: parseInt(newFood.protein) || 0,
        carbs: parseInt(newFood.carbs) || 0,
        fats: parseInt(newFood.fats) || 0
      }
      
      setMeals({
        ...meals,
        [selectedMeal]: [...meals[selectedMeal], food]
      })
      
      setNewFood({ name: '', calories: '', protein: '', carbs: '', fats: '' })
      setShowAddFood(false)
    }
  }

  const removeFood = (mealType, foodId) => {
    setMeals({
      ...meals,
      [mealType]: meals[mealType].filter(food => food.id !== foodId)
    })
  }

  const getMealIcon = (meal) => {
    switch(meal) {
      case 'breakfast': return <Coffee className="text-yellow-500" size={24} />
      case 'lunch': return <Salad className="text-green-500" size={24} />
      case 'dinner': return <Pizza className="text-orange-500" size={24} />
      case 'snacks': return <Apple className="text-red-500" size={24} />
      default: return <Apple className="text-lime-500" size={24} />
    }
  }

  const getMealCalories = (mealType) => {
    return meals[mealType].reduce((sum, food) => sum + food.calories, 0)
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
            <Apple className="text-lime-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Diet Tracker</h1>
              <p className="text-gray-400 text-sm">Track your daily nutrition</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        {/* Left Column - Meals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Summary Card */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Today's Summary</h2>
              <Flame className="text-orange-500" size={28} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Calories</p>
                <p className="text-3xl font-bold text-white">{totals.calories}</p>
                <p className="text-lime-500 text-sm mt-1">
                  {remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Goal</p>
                <p className="text-3xl font-bold text-white">{calorieGoal}</p>
                <p className="text-gray-500 text-sm mt-1">calories/day</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-semibold">
                  {Math.round((totals.calories / calorieGoal) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-3">
                <div 
                  className="bg-lime-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((totals.calories / calorieGoal) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meals */}
          {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => (
            <div key={mealType} className="bg-gray-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getMealIcon(mealType)}
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">{mealType}</h3>
                    <p className="text-gray-400 text-sm">{getMealCalories(mealType)} calories</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMeal(mealType)
                    setShowAddFood(true)
                  }}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>

              {/* Food Items */}
              {meals[mealType].length > 0 ? (
                <div className="space-y-2">
                  {meals[mealType].map((food) => (
                    <div 
                      key={food.id}
                      className="bg-gray-900 p-4 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">{food.name}</p>
                        <div className="flex gap-4 mt-1 text-sm text-gray-400">
                          <span>{food.calories} cal</span>
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fats}g</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFood(mealType, food.id)}
                        className="text-red-400 hover:text-red-300 transition-colors ml-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No items added</p>
              )}
            </div>
          ))}
        </div>

        {/* Right Column - Macros & Stats */}
        <div className="space-y-6">
          {/* Macros Breakdown */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Macro Breakdown</h3>
            
            {totals.calories > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-300">Protein</span>
                    </div>
                    <span className="text-white font-bold">{totals.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">Carbs</span>
                    </div>
                    <span className="text-white font-bold">{totals.carbs}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-300">Fats</span>
                    </div>
                    <span className="text-white font-bold">{totals.fats}g</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="text-gray-600 mx-auto mb-3" size={48} />
                <p className="text-gray-400">Add food to see macro breakdown</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Nutrition Facts</h3>
            <div className="space-y-3">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Protein</p>
                <p className="text-2xl font-bold text-red-500">{totals.protein}g</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Carbs</p>
                <p className="text-2xl font-bold text-blue-500">{totals.carbs}g</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Fats</p>
                <p className="text-2xl font-bold text-yellow-500">{totals.fats}g</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Add to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
              </h3>
              <button
                onClick={() => setShowAddFood(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                  placeholder="e.g., Chicken Breast"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={newFood.calories}
                  onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
                  placeholder="250"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({...newFood, protein: e.target.value})}
                    placeholder="30"
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({...newFood, carbs: e.target.value})}
                    placeholder="20"
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-2">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    value={newFood.fats}
                    onChange={(e) => setNewFood({...newFood, fats: e.target.value})}
                    placeholder="10"
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={addFood}
                className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-lg transition-colors"
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DietTracker