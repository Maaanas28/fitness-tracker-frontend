import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, ArrowLeft, Target, Flame, TrendingUp } from 'lucide-react'
import { 
  calculateBMI, 
  getBMICategory, 
  calculateBMR, 
  calculateTDEE, 
  calculateCalorieGoals,
  calculateMacros 
} from '../utils/Calculations'

function CalculatorPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  })
  const [results, setResults] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    const age = parseInt(formData.age)

    // Calculate BMI
    const bmi = calculateBMI(weight, height)
    const bmiCategory = getBMICategory(parseFloat(bmi))

    // Calculate BMR and TDEE
    const bmr = calculateBMR(weight, height, age, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activityLevel)

    // Calculate calorie goals
    const calorieGoal = calculateCalorieGoals(tdee, formData.goal)

    // Calculate macros
    const macros = calculateMacros(calorieGoal.calories, formData.goal)

    setResults({
      bmi,
      bmiCategory,
      bmr: Math.round(bmr),
      tdee,
      calorieGoal,
      macros
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm p-6 flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <Calculator className="text-lime-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">BMI & Calorie Calculator</h1>
            <p className="text-gray-400 text-sm">Calculate your fitness metrics</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-gray-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Your Information</h2>
          
          <form onSubmit={handleCalculate} className="space-y-6">
            {/* Weight */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70"
                required
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Height */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="175"
                required
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                required
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Activity Level
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="veryActive">Very Active (physical job)</option>
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Fitness Goal
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
              >
                <option value="lose">Weight Loss</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Muscle Gain</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator size={20} />
              Calculate
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* BMI Card */}
              <div className="bg-gray-800 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-lime-500" size={32} />
                  <h3 className="text-xl font-bold text-white">Body Mass Index (BMI)</h3>
                </div>
                <div className="text-center py-6">
                  <p className="text-6xl font-bold text-white mb-2">{results.bmi}</p>
                  <p className={`text-xl font-semibold ${results.bmiCategory.color}`}>
                    {results.bmiCategory.category}
                  </p>
                </div>
                <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    <span className="font-semibold text-white">BMR:</span> {results.bmr} calories/day
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    <span className="font-semibold text-white">TDEE:</span> {results.tdee} calories/day
                  </p>
                </div>
              </div>

              {/* Calorie Goal Card */}
              <div className="bg-gray-800 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="text-orange-500" size={32} />
                  <h3 className="text-xl font-bold text-white">Daily Calorie Goal</h3>
                </div>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold text-white mb-2">
                    {results.calorieGoal.calories}
                  </p>
                  <p className="text-lime-500 font-semibold">calories/day</p>
                  <p className="text-gray-400 text-sm mt-3">
                    {results.calorieGoal.description}
                  </p>
                </div>
              </div>

              {/* Macros Card */}
              <div className="bg-gray-800 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-blue-500" size={32} />
                  <h3 className="text-xl font-bold text-white">Daily Macros</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                    <span className="text-gray-300">Protein</span>
                    <span className="text-xl font-bold text-white">{results.macros.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                    <span className="text-gray-300">Carbs</span>
                    <span className="text-xl font-bold text-white">{results.macros.carbs}g</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                    <span className="text-gray-300">Fats</span>
                    <span className="text-xl font-bold text-white">{results.macros.fats}g</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 p-8 rounded-2xl h-full flex items-center justify-center">
              <div className="text-center">
                <Calculator className="text-gray-600 mx-auto mb-4" size={64} />
                <p className="text-gray-400 text-lg">
                  Fill in your information and click calculate<br />to see your results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalculatorPage