import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Target, Zap, CheckCircle, X, Save, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function BodyAnalysis() {
  const navigate = useNavigate()
  const [uploadedImage, setUploadedImage] = useState(null)
  const [selectedAreas, setSelectedAreas] = useState([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [analysisName, setAnalysisName] = useState('')
  
  // Load saved analyses from localStorage
  const [savedAnalyses, setSavedAnalyses] = useState(() => {
    const saved = localStorage.getItem('savedAnalyses')
    return saved ? JSON.parse(saved) : []
  })

  // Auto-save to localStorage whenever savedAnalyses changes
  useEffect(() => {
    localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses))
  }, [savedAnalyses])

  const bodyAreas = [
    { id: 'chest', name: 'Chest', icon: '💪', color: 'from-amber-500 to-orange-600' },
    { id: 'back', name: 'Back', icon: '🦾', color: 'from-blue-500 to-cyan-600' },
    { id: 'shoulders', name: 'Shoulders', icon: '🏋️', color: 'from-purple-500 to-violet-600' },
    { id: 'arms', name: 'Arms', icon: '💪', color: 'from-pink-500 to-rose-600' },
    { id: 'core', name: 'Core/Abs', icon: '🎯', color: 'from-emerald-500 to-teal-600' },
    { id: 'legs', name: 'Legs', icon: '🦵', color: 'from-red-500 to-amber-600' }
  ]

  const recommendations = {
    chest: [
      { name: 'Bench Press', sets: '3-5', reps: '6-12', description: 'Lie on bench, lower bar to mid-chest, press up explosively' },
      { name: 'Push-ups', sets: '3-5', reps: '10-30', description: 'Classic bodyweight chest builder with perfect form' },
      { name: 'Dumbbell Flyes', sets: '3', reps: '10-15', description: 'Arms extended wide, bring dumbbells together in arc motion' },
      { name: 'Incline Press', sets: '3-4', reps: '8-15', description: 'Press dumbbells upward at 30-45° incline angle' }
    ],
    back: [
      { name: 'Pull-ups', sets: '3-5', reps: '6-12', description: 'Pull body up until chin clears bar' },
      { name: 'Deadlifts', sets: '3-5', reps: '3-8', description: 'Lift barbell from floor to standing position' },
      { name: 'Bent-Over Rows', sets: '3-4', reps: '8-12', description: 'Hinge at hips, pull bar to lower chest' },
      { name: 'Lat Pulldowns', sets: '3-4', reps: '10-15', description: 'Pull bar to chest while seated' }
    ],
    shoulders: [
      { name: 'Shoulder Press', sets: '3-5', reps: '5-10', description: 'Press barbell from shoulders to overhead' },
      { name: 'Lateral Raises', sets: '3-4', reps: '12-20', description: 'Raise dumbbells to sides until arms parallel to floor' },
      { name: 'Front Raises', sets: '3', reps: '12-15', description: 'Raise dumbbells straight in front to shoulder height' },
      { name: 'Face Pulls', sets: '3-4', reps: '15-20', description: 'Pull rope toward face with external rotation' }
    ],
    arms: [
      { name: 'Barbell Curls', sets: '3-4', reps: '8-12', description: 'Stand upright, curl bar toward shoulders' },
      { name: 'Tricep Dips', sets: '3', reps: '8-15', description: 'Lower body between parallel bars' },
      { name: 'Hammer Curls', sets: '3', reps: '10-15', description: 'Curl dumbbells with neutral grip' },
      { name: 'Overhead Extension', sets: '3', reps: '10-15', description: 'Extend dumbbell overhead with both hands' }
    ],
    core: [
      { name: 'Planks', sets: '3', reps: '30-90 sec', description: 'Hold push-up position with perfect form' },
      { name: 'Crunches', sets: '3', reps: '15-20', description: 'Classic abdominal crunch movement' },
      { name: 'Russian Twists', sets: '3', reps: '20-30', description: 'Seated twist with feet elevated' },
      { name: 'Leg Raises', sets: '3', reps: '8-15', description: 'Raise legs while hanging from bar' }
    ],
    legs: [
      { name: 'Squats', sets: '3-5', reps: '5-12', description: 'Lower hips below knees while keeping torso upright' },
      { name: 'Lunges', sets: '3', reps: '10-12 per leg', description: 'Step forward into lunge position alternately' },
      { name: 'Leg Press', sets: '3-4', reps: '10-20', description: 'Push platform away while seated' },
      { name: 'Romanian Deadlifts', sets: '3-4', reps: '8-12', description: 'Hinge at hips with slight knee bend' }
    ]
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB to avoid localStorage issues)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo too large! Please use an image under 5MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const toggleArea = (areaId) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId) 
        : [...prev, areaId]
    )
  }

  const generateRecommendations = () => {
    if (selectedAreas.length > 0) {
      setShowRecommendations(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const resetAnalysis = () => {
    setSelectedAreas([])
    setUploadedImage(null)
    setShowRecommendations(false)
    setAnalysisName('')
  }

  const saveAnalysis = () => {
    if (analysisName.trim() && selectedAreas.length > 0) {
      const newAnalysis = {
        id: Date.now(),
        name: analysisName.trim(),
        areas: selectedAreas,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        image: uploadedImage
      }
      setSavedAnalyses(prev => [newAnalysis, ...prev])
      setAnalysisName('')
      // Show success message
      alert('âœ“ Analysis saved successfully!')
    }
  }

  const deleteAnalysis = (id) => {
    if (window.confirm('Delete this analysis? This cannot be undone.')) {
      setSavedAnalyses(prev => prev.filter(a => a.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 relative overflow-x-hidden">
      {/* Atmospheric elements */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-amber-500/5 to-transparent rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <motion.header 
        className="py-6 px-8 flex items-center justify-between sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-5">
          <motion.button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-amber-400 transition-colors p-2.5 rounded-full hover:bg-slate-800/60"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} strokeWidth={1.8} />
          </motion.button>
          <div>
            <h1 className="text-2.5xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
              Body Analysis
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 ml-1">Identify focus areas for personalized training</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            onClick={resetAnalysis}
            className="p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={22} className="text-slate-300" strokeWidth={1.8} />
          </motion.button>
          <motion.button
            onClick={saveAnalysis}
            disabled={!analysisName.trim() || selectedAreas.length === 0}
            className={`p-3 rounded-xl transition-colors ${
              analysisName.trim() && selectedAreas.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600'
                : 'bg-slate-800/50 cursor-not-allowed'
            }`}
            whileHover={{ scale: analysisName.trim() && selectedAreas.length > 0 ? 1.05 : 1 }}
            whileTap={{ scale: analysisName.trim() && selectedAreas.length > 0 ? 0.95 : 1 }}
          >
            <Save size={22} className="text-white" strokeWidth={1.8} />
          </motion.button>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Analysis Setup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Analysis Name */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                Analysis Name
              </label>
              <input
                type="text"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                placeholder="e.g., Pre-Summer Focus Areas"
                className="w-full bg-slate-900/50 text-white px-5 py-4 rounded-xl border border-slate-800/50 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Save this analysis to track your progress over time</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-light flex items-center gap-3">
                <Camera className="text-blue-400" size={24} />
                Reference Photo (Optional)
              </h2>
              
              {!uploadedImage ? (
                <label className="block cursor-pointer group">
                  <div className="border-2 border-dashed border-slate-800/80 rounded-2xl p-12 text-center transition-all hover:border-amber-500/50 hover:bg-slate-900/30">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/15 to-cyan-600/15 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="text-blue-400" size={36} strokeWidth={1.8} />
                    </div>
                    <p className="text-slate-300 font-medium mb-2">Upload a reference photo</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Helps track visual progress over time (stored locally only, max 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800/50 group">
                  <img 
                    src={uploadedImage} 
                    alt="Reference" 
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <X size={18} />
                      Remove Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Area Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-light flex items-center gap-3">
                <Target className="text-amber-400" size={24} />
                Select Focus Areas
              </h2>
              <p className="text-slate-400">Choose muscle groups you want to prioritize in your training</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bodyAreas.map((area) => (
                  <motion.button
                    key={area.id}
                    onClick={() => toggleArea(area.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-5 rounded-2xl text-left transition-all overflow-hidden ${
                      selectedAreas.includes(area.id)
                        ? `bg-gradient-to-br ${area.color} text-white`
                        : 'bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/30 text-slate-200'
                    }`}
                  >
                    {selectedAreas.includes(area.id) && (
                      <div className="absolute inset-0 bg-white/10" />
                    )}
                    <div className="relative z-10">
                      <div className="text-3xl mb-3">{area.icon}</div>
                      <div className="font-medium text-lg">{area.name}</div>
                      {selectedAreas.includes(area.id) && (
                        <div className="mt-2 flex items-center text-white text-sm font-medium">
                          <CheckCircle size={16} className="mr-1.5" />
                          Selected
                        </div>
                      )}
                    </div>
                    {!selectedAreas.includes(area.id) && (
                      <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${area.color} rounded-full opacity-10`} />
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={generateRecommendations}
                disabled={selectedAreas.length === 0}
                whileHover={{ scale: selectedAreas.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedAreas.length > 0 ? 0.98 : 1 }}
                className={`w-full py-4 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                  selectedAreas.length === 0
                    ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 shadow-lg shadow-amber-500/20'
                }`}
              >
                <Zap size={22} strokeWidth={2} />
                Generate Personalized Plan
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light flex items-center gap-3">
                <Sparkles className="text-purple-400" size={28} />
                Your Training Plan
              </h2>
              {showRecommendations && (
                <motion.button
                  onClick={resetAnalysis}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <RotateCcw size={18} />
                  Start Over
                </motion.button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {showRecommendations && selectedAreas.length > 0 ? (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {selectedAreas.map((areaId) => {
                    const area = bodyAreas.find(a => a.id === areaId)
                    return (
                      <motion.div
                        key={areaId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * selectedAreas.indexOf(areaId) }}
                        className={`rounded-2xl overflow-hidden border border-slate-800/50 ${
                          selectedAreas.length > 1 ? 'bg-slate-900/40' : 'bg-slate-900/60'
                        }`}
                      >
                        <div className={`p-5 bg-gradient-to-r ${area.color} flex items-center justify-between`}>
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{area.icon}</div>
                            <h3 className="text-xl font-bold text-white">{area.name}</h3>
                          </div>
                          <div className="text-white/90 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                            {recommendations[areaId].length} exercises
                          </div>
                        </div>
                        
                        <div className="p-5 space-y-3">
                          {recommendations[areaId].map((exercise, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.05 }}
                              className="group bg-slate-900/30 rounded-xl p-4 border border-slate-800/50 hover:border-slate-700 transition-all"
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                  <div className="font-bold text-lg text-slate-100">{exercise.name}</div>
                                  <div className="text-slate-400 text-sm mt-1">{exercise.description}</div>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                  <div className="text-center min-w-[70px]">
                                    <div className="text-amber-400">{exercise.sets} sets</div>
                                    <div className="text-slate-500 text-xs">Sets</div>
                                  </div>
                                  <div className="text-center min-w-[70px]">
                                    <div className="text-blue-400">{exercise.reps}</div>
                                    <div className="text-slate-500 text-xs">Reps</div>
                                  </div>
                                  <button 
                                    onClick={() => navigate('/exercises', { state: { exercise: exercise.name } })}
                                    className="hidden md:block bg-gradient-to-r from-blue-600 to-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                                  >
                                    View Details
                                  </button>
                                </div>
                              </div>
                              <button 
                                onClick={() => navigate('/exercises', { state: { exercise: exercise.name } })}
                                className="mt-3 w-full md:hidden bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                              >
                                View Exercise Details
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                    <motion.button
                      onClick={() => navigate('/exercises')}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 rounded-xl transition-colors"
                    >
                      Full Exercise Library
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/workout')}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-medium py-4 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                    >
                      Start Workout
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/50"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-amber-500/20 rounded-full blur-xl" />
                    <div className="relative bg-slate-800/50 rounded-full p-5 flex items-center justify-center">
                      <Target className="text-slate-500" size={48} strokeWidth={1.8} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-light bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 mb-3">
                    Personalized Training Plan
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto px-4">
                    Select your focus areas above to generate a customized workout plan targeting your specific goals. 
                    Your recommendations will appear here instantly.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Saved Analyses Section */}
        {savedAnalyses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-slate-800/50"
          >
            <h2 className="text-xl font-light mb-6 flex items-center gap-3">
              <Save className="text-green-400" size={24} />
              Saved Analyses ({savedAnalyses.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAnalyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  whileHover={{ y: -3 }}
                  className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/50 hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-slate-100">{analysis.name}</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                      {analysis.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.areas.map(areaId => {
                      const area = bodyAreas.find(a => a.id === areaId)
                      return (
                        <span 
                          key={areaId} 
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300"
                        >
                          {area?.name || areaId}
                        </span>
                      )
                    })}
                  </div>
                  {analysis.image && (
                    <div className="mt-3 h-24 bg-slate-800/50 rounded-lg overflow-hidden">
                      <img 
                        src={analysis.image} 
                        alt={analysis.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedAreas(analysis.areas)
                        if (analysis.image) setUploadedImage(analysis.image)
                        setAnalysisName('')
                        setShowRecommendations(true)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Load Analysis
                    </button>
                    <button 
                      onClick={() => deleteAnalysis(analysis.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      title="Delete analysis"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BodyAnalysis

