import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, Target, Zap, Download, RefreshCw, 
  Dumbbell, Flame, CheckCircle, ChevronRight, Sparkles 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWithGemini } from '../utils/gemini'
import { exportWorkoutPlanToPDF } from '../utils/exportPDF'


function WorkoutPlanGenerator() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    goal: 'muscle_gain',
    experience: 'intermediate',
    daysPerWeek: 4,
    duration: 60,
    equipment: 'full_gym'
  })
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState(false)

  // COMPLETE generatePlan function
  const generatePlan = async () => {
    setIsGenerating(true)
    setAiError(false)
    
    try {
      const goalText = formData.goal === 'muscle_gain' ? 'build muscle' : 'lose weight'
      const equipmentText = {
        full_gym: 'full gym equipment with barbells, machines, and cables',
        home: 'home workout with dumbbells and minimal equipment',
        bodyweight: 'bodyweight only with no equipment'
      }[formData.equipment]
      
      console.log('Selected equipment:', formData.equipment)
      console.log('Equipment text:', equipmentText)
      
      const prompt = `Create a detailed ${formData.daysPerWeek}-day per week workout plan for a ${formData.experience} level person who wants to ${goalText}. 
      Each session should be about ${formData.duration} minutes.
      Available equipment: ${equipmentText}.
      
      Format the response as JSON exactly like this example:
      {
        "name": "Plan Name Here",
        "days": [
          {
            "day": "Day 1 - Upper Body Push",
            "exercises": [
              { "name": "Exercise Name", "sets": "3-4", "reps": "8-12", "notes": "Form tips" }
            ]
          }
        ]
      }
      
      Make sure exercises match the available equipment: ${equipmentText}
      If equipment is limited, suggest appropriate alternatives.`
      
      const aiResponse = await generateWithGemini(prompt, 'workout')
      
      if (aiResponse) {
        try {
          let plan
          if (typeof aiResponse === 'string') {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              plan = JSON.parse(jsonMatch[0])
            } else {
              plan = JSON.parse(aiResponse)
            }
          } else {
            plan = aiResponse
          }
          setGeneratedPlan(plan)
        } catch (e) {
          console.error('Failed to parse AI response:', e)
          const fallbackPlan = getFallbackPlan(formData)
          setGeneratedPlan(fallbackPlan)
        }
      } else {
        const fallbackPlan = getFallbackPlan(formData)
        setGeneratedPlan(fallbackPlan)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      setAiError(true)
      const fallbackPlan = getFallbackPlan(formData)
      setGeneratedPlan(fallbackPlan)
    } finally {
      setIsGenerating(false)
    }
  }

  // COMPLETE fallback plan function
  const getFallbackPlan = (formData) => {
    const equipment = formData.equipment || 'full_gym'
    
    if (equipment === 'bodyweight') {
      return {
        name: `${formData.daysPerWeek}-Day Bodyweight ${formData.goal === 'muscle_gain' ? 'Strength' : 'Fat Loss'} Plan`,
        days: [
          {
            day: 'Day 1 - Upper Body',
            exercises: [
              { name: 'Push-ups', sets: '4', reps: '15-20', notes: 'Hands shoulder-width apart' },
              { name: 'Diamond Push-ups', sets: '3', reps: '10-15', notes: 'For triceps focus' },
              { name: 'Pike Push-ups', sets: '3', reps: '8-12', notes: 'For shoulders' },
              { name: 'Plank', sets: '3', reps: '45-60 sec', notes: 'Keep core tight' }
            ]
          },
          {
            day: 'Day 2 - Lower Body',
            exercises: [
              { name: 'Bodyweight Squats', sets: '4', reps: '20-25', notes: 'Go as deep as possible' },
              { name: 'Lunges', sets: '3', reps: '15 each leg', notes: 'Keep torso upright' },
              { name: 'Glute Bridges', sets: '3', reps: '20', notes: 'Squeeze at the top' },
              { name: 'Calf Raises', sets: '3', reps: '25', notes: 'Full range of motion' }
            ]
          },
          {
            day: 'Day 3 - Rest',
            exercises: []
          },
          {
            day: 'Day 4 - Full Body HIIT',
            exercises: [
              { name: 'Burpees', sets: '4', reps: '10-15', notes: 'Explosive movement' },
              { name: 'Mountain Climbers', sets: '4', reps: '30 sec', notes: 'Keep hips down' },
              { name: 'Jump Squats', sets: '3', reps: '15', notes: 'Land softly' },
              { name: 'Plank Jacks', sets: '3', reps: '20', notes: 'Core engaged' }
            ]
          }
        ]
      }
    }
    
    if (equipment === 'home') {
      return {
        name: `${formData.daysPerWeek}-Day Home Dumbbell ${formData.goal === 'muscle_gain' ? 'Strength' : 'Fat Loss'} Plan`,
        days: [
          {
            day: 'Day 1 - Push Focus',
            exercises: [
              { name: 'Dumbbell Bench Press', sets: '4', reps: '10-12', notes: 'On floor or bench' },
              { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10-12', notes: 'Seated or standing' },
              { name: 'Dumbbell Flyes', sets: '3', reps: '12-15', notes: 'Light weight, good form' },
              { name: 'Tricep Extensions', sets: '3', reps: '12-15', notes: 'Overhead or lying' }
            ]
          },
          {
            day: 'Day 2 - Pull Focus',
            exercises: [
              { name: 'Dumbbell Rows', sets: '4', reps: '10-12', notes: 'Each arm' },
              { name: 'Dumbbell Curls', sets: '3', reps: '12-15', notes: 'Supinate at top' },
              { name: 'Hammer Curls', sets: '3', reps: '12-15', notes: 'Neutral grip' },
              { name: 'Dumbbell Shrugs', sets: '3', reps: '15', notes: 'For traps' }
            ]
          },
          {
            day: 'Day 3 - Legs',
            exercises: [
              { name: 'Goblet Squats', sets: '4', reps: '12-15', notes: 'Hold one dumbbell' },
              { name: 'Dumbbell Lunges', sets: '3', reps: '12 each leg', notes: 'Keep chest up' },
              { name: 'Romanian Deadlifts', sets: '3', reps: '10-12', notes: 'Feel hamstring stretch' },
              { name: 'Calf Raises', sets: '4', reps: '20', notes: 'Hold dumbbells' }
            ]
          }
        ]
      }
    }
    
    // Default full gym plan
    return {
      name: `${formData.daysPerWeek}-Day Gym ${formData.goal === 'muscle_gain' ? 'Hypertrophy' : 'Fat Loss'} Plan`,
      days: [
        {
          day: 'Day 1 - Chest & Triceps',
          exercises: [
            { name: 'Barbell Bench Press', sets: '4', reps: '8-12', notes: 'Retract scapula' },
            { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', notes: '30-45° incline' },
            { name: 'Cable Crossovers', sets: '3', reps: '12-15', notes: 'Squeeze at peak' },
            { name: 'Tricep Pushdowns', sets: '3', reps: '12-15', notes: 'Keep elbows locked' }
          ]
        },
        {
          day: 'Day 2 - Back & Biceps',
          exercises: [
            { name: 'Lat Pulldowns', sets: '4', reps: '10-12', notes: 'Pull to upper chest' },
            { name: 'Seated Cable Rows', sets: '3', reps: '10-12', notes: 'Squeeze shoulder blades' },
            { name: 'Barbell Curls', sets: '3', reps: '10-12', notes: 'No swinging' },
            { name: 'Hammer Curls', sets: '3', reps: '12-15', notes: 'Thumbs up grip' }
          ]
        },
        {
          day: 'Day 3 - Legs',
          exercises: [
            { name: 'Barbell Squats', sets: '4', reps: '8-10', notes: 'Below parallel' },
            { name: 'Leg Press', sets: '3', reps: '10-12', notes: 'Don\'t lock knees' },
            { name: 'Romanian Deadlifts', sets: '3', reps: '8-10', notes: 'Hip hinge' },
            { name: 'Calf Raises', sets: '4', reps: '15-20', notes: 'Full stretch' }
          ]
        }
      ]
    }
  }

  // Rest of your component JSX remains exactly the same
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 relative overflow-x-hidden">
      {/* Atmospheric background elements */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <motion.header 
        className="py-6 px-8 flex items-center justify-between sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-5">
          <motion.button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-emerald-400 transition-colors p-2.5 rounded-full hover:bg-slate-800/60"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} strokeWidth={1.8} />
          </motion.button>
          <div>
            <h1 className="text-2.5xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
              AI Workout Generator
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 ml-1">Powered by Gemini AI</p>
          </div>
        </div>
        {generatedPlan && (
          <motion.button
            onClick={generatePlan}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-xl border border-emerald-500/30 flex items-center gap-2"
          >
            <Sparkles size={20} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Regenerate with AI</span>
          </motion.button>
        )}
      </motion.header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form Section */}
          <motion.div 
            className="space-y-9"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Goal Selection */}
            <div className="space-y-3">
              <h2 className="text-2xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                What's Your Goal?
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setFormData({...formData, goal: 'muscle_gain'})}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-6 rounded-2xl overflow-hidden transition-all ${
                    formData.goal === 'muscle_gain'
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                      : 'bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-4">
                    <Dumbbell className={`w-10 h-10 ${formData.goal === 'muscle_gain' ? 'text-white' : 'text-emerald-400'}`} strokeWidth={1.8} />
                    <div className="text-center">
                      <p className={`text-lg font-medium ${formData.goal === 'muscle_gain' ? 'text-white' : 'text-slate-200'}`}>
                        Build Muscle
                      </p>
                      <p className={`text-sm mt-1 ${formData.goal === 'muscle_gain' ? 'text-emerald-100/90' : 'text-slate-400'}`}>
                        Strength & hypertrophy
                      </p>
                    </div>
                    {formData.goal === 'muscle_gain' && (
                      <CheckCircle className="absolute top-3 right-3 text-white" size={20} strokeWidth={2.5} />
                    )}
                  </div>
                </motion.button>
                
                <motion.button
                  onClick={() => setFormData({...formData, goal: 'weight_loss'})}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-6 rounded-2xl overflow-hidden transition-all ${
                    formData.goal === 'weight_loss'
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                      : 'bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-4">
                    <Flame className={`w-10 h-10 ${formData.goal === 'weight_loss' ? 'text-white' : 'text-amber-400'}`} strokeWidth={1.8} />
                    <div className="text-center">
                      <p className={`text-lg font-medium ${formData.goal === 'weight_loss' ? 'text-white' : 'text-slate-200'}`}>
                        Lose Weight
                      </p>
                      <p className={`text-sm mt-1 ${formData.goal === 'weight_loss' ? 'text-amber-100/90' : 'text-slate-400'}`}>
                        Burn fat & get lean
                      </p>
                    </div>
                    {formData.goal === 'weight_loss' && (
                      <CheckCircle className="absolute top-3 right-3 text-white" size={20} strokeWidth={2.5} />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <h2 className="text-2xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                Experience Level
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => setFormData({...formData, experience: level})}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative p-4 rounded-xl overflow-hidden transition-all ${
                      formData.experience === level
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                        : 'bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-center">
                      <p className={`font-medium capitalize ${formData.experience === level ? 'text-white' : 'text-slate-200'}`}>
                        {level}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Equipment Selection */}
            <div className="space-y-3">
              <h2 className="text-2xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                Available Equipment
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'full_gym', label: 'Full Gym' },
                  { value: 'home', label: 'Home Gym' },
                  { value: 'bodyweight', label: 'Bodyweight' }
                ].map((eq) => (
                  <motion.button
                    key={eq.value}
                    onClick={() => setFormData({...formData, equipment: eq.value})}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative p-3 rounded-xl overflow-hidden transition-all ${
                      formData.equipment === eq.value
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700'
                        : 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="relative text-center">
                      <p className={`text-sm font-medium ${formData.equipment === eq.value ? 'text-white' : 'text-slate-200'}`}>
                        {eq.label}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Training Frequency */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                  Training Frequency
                </h2>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                  {formData.daysPerWeek} days
                </span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={formData.daysPerWeek}
                  onChange={(e) => setFormData({...formData, daysPerWeek: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800/50 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>3 days/week</span>
                  <span>6 days/week</span>
                </div>
              </div>
            </div>

            {/* Workout Duration */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                  Session Length
                </h2>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                  {formData.duration} min
                </span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800/50 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>30 minutes</span>
                  <span>2 hours</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={generatePlan}
              disabled={isGenerating}
              whileHover={{ scale: isGenerating ? 1 : 1.03 }}
              whileTap={{ scale: isGenerating ? 1 : 0.97 }}
              className="group relative w-full py-5 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3 text-slate-200 group-hover:text-white font-medium text-lg">
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw size={24} strokeWidth={2} />
                    </motion.div>
                    <span>AI is Creating Your Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={24} strokeWidth={2} className="text-emerald-400" />
                    <span>Generate AI Workout Plan</span>
                    <ChevronRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>

            {aiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center"
              >
                <p className="text-red-400 text-sm">AI service unavailable. Using pre-built plans.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Generated Plan Section */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {generatedPlan ? (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                        {generatedPlan.name}
                      </h2>
                      <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" />
                        AI-generated for your goals
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 font-medium rounded-full">
                      �??� {formData.goal === 'muscle_gain' ? 'Muscle Gain' : 'Weight Loss'}
                    </span>
                    <span className="px-4 py-2 bg-blue-500/10 text-blue-400 font-medium rounded-full">
                      �??� {formData.experience.charAt(0).toUpperCase() + formData.experience.slice(1)}
                    </span>
                    <span className="px-4 py-2 bg-amber-500/10 text-amber-400 font-medium rounded-full">
                      �??? {formData.daysPerWeek} days/week
                    </span>
                    <span className="px-4 py-2 bg-purple-500/10 text-purple-400 font-medium rounded-full">
                      â±ï¸ {formData.duration} min
                    </span>
                    <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 font-medium rounded-full">
                      �?�?️ {formData.equipment === 'full_gym' ? 'Full Gym' : formData.equipment === 'home' ? 'Home' : 'Bodyweight'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {generatedPlan.days.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group relative p-6 rounded-2xl border ${
                        day.exercises.length > 0 
                          ? 'bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/30'
                          : 'bg-slate-800/30 border-dashed border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                          {day.day}
                        </h3>
                        {day.exercises.length > 0 && (
                          <span className="text-sm text-slate-400">
                            {day.exercises.length} exercises
                          </span>
                        )}
                      </div>
                      
                      {day.exercises.length > 0 ? (
                        <div className="space-y-3">
                          {day.exercises.map((exercise, exIndex) => (
                            <motion.div
                              key={exIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + exIndex * 0.05 }}
                              className="p-4 bg-slate-900/40 rounded-xl hover:bg-slate-800/60 transition-colors"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="font-medium text-slate-100">{exercise.name}</span>
                                  </div>
                                  <span className="text-slate-400 font-medium text-sm">
                                    {exercise.sets} �? {exercise.reps}
                                  </span>
                                </div>
                                {exercise.notes && (
                                  <p className="text-xs text-slate-500 italic pl-6">{exercise.notes}</p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-center py-4">
                          Rest day - Focus on recovery and active stretching
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
                  <motion.button
  onClick={() => exportWorkoutPlanToPDF(generatedPlan, formData)}  // <-- ADD THIS
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  className="group relative p-4 rounded-xl overflow-hidden border border-blue-500/30"
>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className="relative flex items-center justify-center gap-2 text-blue-400 font-medium">
    <Download size={20} strokeWidth={1.8} />
    <span>Export Plan</span>
  </div>
</motion.button>
                  
                  <motion.button
                    onClick={() => navigate('/workout')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-2 text-white font-medium">
                      Start Workout
                      <ChevronRight size={20} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-xl" />
                    <div className="relative bg-slate-800/50 rounded-full p-5 flex items-center justify-center">
                      <Sparkles className="text-emerald-500" size={48} strokeWidth={1.8} />
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-w-md mx-auto">
                    <h2 className="text-3xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                      AI-Powered Plans
                    </h2>
                    <p className="text-slate-400 text-lg">
                      Select your preferences and let Gemini AI create a custom workout plan tailored just for you.
                    </p>
                  </div>
                  
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center"
                  >
                    <ChevronRight className="text-emerald-500" size={24} strokeWidth={2} />
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  )
}

export default WorkoutPlanGenerator
