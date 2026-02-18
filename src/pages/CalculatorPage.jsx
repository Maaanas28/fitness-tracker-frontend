import { useState, useEffect } from 'react' // <-- ADDED useEffect
import { useNavigate } from 'react-router-dom'
import { Calculator, ArrowLeft, Target, Flame, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
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

  // Load profile data on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setFormData(prev => ({
          ...prev,
          weight: profile.currentWeight?.toString() || '',
          height: profile.height?.toString() || '',
          age: profile.age?.toString() || '',
          // Map fitness goal to calculator goal
          goal: profile.fitnessGoal?.toLowerCase().includes('loss') ? 'lose' :
                profile.fitnessGoal?.toLowerCase().includes('gain') ? 'gain' : 
                profile.fitnessGoal?.toLowerCase().includes('strength') ? 'gain' : 'maintain'
        }))
      } catch (e) {
        console.error('Failed to load profile:', e)
      }
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    const age = parseInt(formData.age)

    const bmi = calculateBMI(weight, height)
    const bmiCategory = getBMICategory(parseFloat(bmi))
    const bmr = calculateBMR(weight, height, age, formData.gender)
    const tdee = calculateTDEE(bmr, formData.activityLevel)
    const calorieGoal = calculateCalorieGoals(tdee, formData.goal)
    const macros = calculateMacros(calorieGoal.calories, formData.goal)

    const newResults = {
      bmi,
      bmiCategory,
      bmr: Math.round(bmr),
      tdee,
      calorieGoal,
      macros
    }
    
    setResults(newResults)
    
    // âœ… SAVE TO LOCALSTORAGE for DietTracker to use
    localStorage.setItem('userCalorieData', JSON.stringify({
      tdee: tdee,
      maintenanceCalories: tdee,
      goalCalories: calorieGoal.calories,
      goalType: formData.goal,
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
      bmi: bmi,
      bmr: Math.round(bmr)
    }))
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header 
        className="bg-zinc-900/50 backdrop-blur-sm p-6 flex items-center gap-4 border-b border-zinc-800"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-red-600 transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Calculator className="text-red-600" size={32} strokeWidth={2} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-white">FITNESS CALCULATOR</h1>
            <motion.div 
              className="w-12 h-[2px] bg-red-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 }}
            />
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div 
          className="bg-zinc-900 border border-zinc-800 p-8 relative overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ borderColor: '#dc2626' }}
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px] bg-red-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 }}
          />
          
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Input Data</h2>
          
          <form onSubmit={handleCalculate} className="space-y-5">
            {/* Weight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-gray-600 text-[10px] font-bold block mb-2 uppercase tracking-[0.15em]">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70"
                required
                className="w-full bg-black text-white px-4 py-3 border-b-2 border-zinc-800 focus:border-red-600 focus:outline-none transition-colors font-bold"
              />
            </motion.div>

            {/* Height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="text-gray-600 text-[10px] font-bold block mb-2 uppercase tracking-[0.15em]">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="175"
                required
                className="w-full bg-black text-white px-4 py-3 border-b-2 border-zinc-800 focus:border-red-600 focus:outline-none transition-colors font-bold"
              />
            </motion.div>

            {/* Age */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-gray-600 text-[10px] font-bold block mb-2 uppercase tracking-[0.15em]">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                required
                className="w-full bg-black text-white px-4 py-3 border-b-2 border-zinc-800 focus:border-red-600 focus:outline-none transition-colors font-bold"
              />
            </motion.div>

            {/* Gender */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-gray-600 text-[10px] font-bold block mb-2 uppercase tracking-[0.15em]">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-black text-white px-4 py-3 border-b-2 border-zinc-800 focus:border-red-600 focus:outline-none transition-colors font-bold cursor-pointer"
              >
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
              </select>
            </motion.div>

            {/* Activity Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-gray-600 text-[10px] font-bold block mb-2 uppercase tracking-[0.15em]">
                Activity Level
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full bg-black text-white px-4 py-3 border-b-2 border-zinc-800 focus:border-red-600 focus:outline-none transition-colors font-bold cursor-pointer"
              >
                <option value="sedentary">SEDENTARY</option>
                <option value="light">LIGHT</option>
                <option value="moderate">MODERATE</option>
                <option value="active">ACTIVE</option>
                <option value="veryActive">VERY ACTIVE</option>
              </select>
            </motion.div>

            {/* Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="text-gray-600 text-[10px] font-bold block mb-2 uppercase tracking-[0.15em]">
                Fitness Goal
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full bg-black text-white px-4 py-3 border-b-2 border-zinc-800 focus:border-red-600 focus:outline-none transition-colors font-bold cursor-pointer"
              >
                <option value="lose">WEIGHT LOSS</option>
                <option value="maintain">MAINTAIN</option>
                <option value="gain">MUSCLE GAIN</option>
              </select>
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 uppercase tracking-wider flex items-center justify-center gap-2 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Calculator size={20} />
              <span>Calculate</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* BMI Card */}
              <motion.div 
                className="bg-zinc-900 border border-zinc-800 p-8 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ borderColor: '#dc2626' }}
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-red-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                />
                
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-red-600" size={32} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">BMI</h3>
                </div>
                <div className="text-center py-6">
                  <motion.p 
                    className="text-7xl font-black text-white mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {results.bmi}
                  </motion.p>
                  <p className={`text-xl font-bold uppercase tracking-wider ${results.bmiCategory.color}`}>
                    {results.bmiCategory.category}
                  </p>
                </div>
                <div className="mt-6 bg-black p-4 space-y-2 border-l-2 border-red-600">
                  <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">
                    BMR: <span className="text-white font-black">{results.bmr}</span> cal/day
                  </p>
                  <p className="text-gray-600 text-xs uppercase tracking-wider font-bold">
                    TDEE: <span className="text-white font-black">{results.tdee}</span> cal/day
                  </p>
                </div>
              </motion.div>

              {/* Calorie Goal */}
              <motion.div 
                className="bg-zinc-900 border border-zinc-800 p-8 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ borderColor: '#dc2626' }}
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-red-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.1 }}
                />
                
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="text-red-600" size={32} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Daily Target</h3>
                </div>
                <div className="text-center py-6">
                  <motion.p 
                    className="text-6xl font-black text-white mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    {results.calorieGoal.calories}
                  </motion.p>
                  <p className="text-red-600 font-bold uppercase tracking-wider">CALORIES/DAY</p>
                  <p className="text-gray-600 text-sm mt-3 uppercase tracking-wider font-semibold">
                    {results.calorieGoal.description}
                  </p>
                </div>
              </motion.div>

              {/* Macros */}
              <motion.div 
                className="bg-zinc-900 border border-zinc-800 p-8 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ borderColor: '#dc2626' }}
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-red-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.2 }}
                />
                
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-red-600" size={32} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Macros</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Protein', value: results.macros.protein },
                    { label: 'Carbs', value: results.macros.carbs },
                    { label: 'Fats', value: results.macros.fats }
                  ].map((macro, index) => (
                    <motion.div 
                      key={macro.label}
                      className="flex justify-between items-center bg-black p-4 border-l-2 border-red-600"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-gray-400 uppercase tracking-wider text-sm font-bold">{macro.label}</span>
                      <span className="text-2xl font-black text-white">{macro.value}g</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="bg-zinc-900 border border-zinc-800 p-12 h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <Calculator className="text-zinc-700 mx-auto mb-4" size={64} strokeWidth={1.5} />
                <p className="text-gray-600 text-lg uppercase tracking-wider font-bold">
                  Enter Data to Calculate
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalculatorPage
