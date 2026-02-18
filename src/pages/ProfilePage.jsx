import { useState, useEffect } from 'react' // <-- ADD useEffect here
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Calendar, Target, Activity, Ruler, Weight, Edit, Save, X, Camera, Settings, Bell, Lock, LogOut, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (415) 555-0198',
    age: 28,
    gender: 'Male',
    height: 178,
    currentWeight: 82.3,
    goalWeight: 76,
    activityLevel: 'Active',
    fitnessGoal: 'Strength Building',
    joinDate: '2025-11-15'
  })
  const [tempData, setTempData] = useState({...profileData})

  // âœ… CORRECT: useEffect inside the component, after state declarations
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profileData))
  }, [profileData])

  const handleEdit = () => {
    setTempData({...profileData})
    setIsEditing(true)
  }

  const handleSave = () => {
    setProfileData({...tempData})
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData({...profileData})
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 relative overflow-x-hidden">
      {/* Subtle organic background shapes */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-blue-600/5 to-transparent rounded-full blur-3xl -z-10" />
      
      {/* Header - floating, minimal */}
      <motion.header 
        className="py-6 px-8 flex items-center justify-between sticky top-0 z-50"
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
              Profile
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 ml-1">Your personal fitness sanctuary</p>
          </div>
        </div>
        
        {!isEditing && (
          <motion.button 
            onClick={handleEdit} 
            className="group relative px-6 py-3 rounded-full overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2.5 text-slate-300 group-hover:text-slate-900 transition-colors">
              <Edit size={20} strokeWidth={2} />
              <span className="font-medium">Edit Profile</span>
            </div>
          </motion.button>
        )}
      </motion.header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header - fluid, organic layout */}
        <motion.div 
          className="relative rounded-3xl overflow-hidden mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Hero gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-blue-600/5" />
          
          <div className="relative p-8 md:p-12 lg:px-16 lg:py-14">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
              {/* Avatar with organic treatment */}
              <div className="relative">
                <div className="relative w-44 h-44">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-blue-600/20 rounded-2xl blur-xl -z-10" />
                  <div className="w-full h-full bg-slate-800/40 rounded-2xl flex items-center justify-center border border-slate-700/50">
                    <User className="text-slate-400" size={68} strokeWidth={1.5} />
                  </div>
                </div>
                {isEditing && (
                  <motion.button 
                    className="absolute bottom-2 right-2 w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera size={24} strokeWidth={1.8} className="text-slate-900" />
                  </motion.button>
                )}
              </div>
              
              {/* Profile content with elegant typography */}
              <div className="text-center lg:text-left max-w-2xl space-y-5">
                <div>
                  <h2 className="text-4xl md:text-5xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                    {profileData.name}
                  </h2>
                  <p className="text-xl text-slate-300 mt-2 max-w-xl mx-auto lg:mx-0">{profileData.email}</p>
                </div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <span className="px-5 py-2 bg-amber-500/10 text-amber-300 font-medium rounded-full">
                    �??� {profileData.fitnessGoal}
                  </span>
                  <span className="px-5 py-2 bg-blue-500/10 text-blue-300 font-medium rounded-full">
                    �??� {profileData.activityLevel}
                  </span>
                  <span className="px-5 py-2 bg-emerald-500/10 text-emerald-300 font-medium rounded-full">
                    �??? Since {new Date(profileData.joinDate).getFullYear()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto lg:mx-0 mt-3">
                  <div className="text-center p-4">
                    <Weight className="text-amber-400 mx-auto mb-3" size={28} strokeWidth={1.8} />
                    <p className="text-2xl font-light bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                      {profileData.currentWeight} kg
                    </p>
                    <p className="text-slate-400 text-sm mt-1.5">Current</p>
                  </div>
                  <div className="text-center p-4">
                    <Target className="text-emerald-400 mx-auto mb-3" size={28} strokeWidth={1.8} />
                    <p className="text-2xl font-light bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                      {profileData.goalWeight} kg
                    </p>
                    <p className="text-slate-400 text-sm mt-1.5">Goal</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile details as elegant tags */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 pt-8 border-t border-slate-800/60">
              <div className="flex items-center gap-3 text-slate-300">
                <Phone size={20} className="text-amber-400 flex-shrink-0" strokeWidth={1.8} />
                <span className="font-medium">{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar size={20} className="text-amber-400 flex-shrink-0" strokeWidth={1.8} />
                <span className="font-medium">{profileData.age} years</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Ruler size={20} className="text-amber-400 flex-shrink-0" strokeWidth={1.8} />
                <span className="font-medium">{profileData.height} cm</span>
              </div>
            </div>
            
            {/* Edit controls floating elegantly */}
            {isEditing && (
              <div className="mt-10 flex flex-wrap justify-center lg:justify-end gap-4">
                <motion.button 
                  onClick={handleSave} 
                  className="group relative px-8 py-4 rounded-full overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2.5 text-white font-medium">
                    <Save size={20} strokeWidth={2} />
                    Save Changes
                  </div>
                </motion.button>
                <motion.button 
                  onClick={handleCancel} 
                  className="group relative px-8 py-4 rounded-full overflow-hidden border border-slate-700/80"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2.5 text-slate-300 group-hover:text-slate-100 font-medium">
                    <X size={20} strokeWidth={2} />
                    Cancel
                  </div>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation - minimalist underline style */}
        <div className="flex justify-center mb-16">
          {[
            { id: 'profile', label: 'Personal', icon: User },
            { id: 'fitness', label: 'Fitness', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab, index) => {
            const Icon = tab.icon
            return (
              <motion.button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative mx-2 md:mx-6 px-2 py-3 flex flex-col items-center transition-all ${
                  activeTab === tab.id 
                    ? 'text-amber-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon size={24} strokeWidth={1.8} className="mb-2" />
                <span className="text-lg font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                    layoutId="tabIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500/30 rounded-full transition-all ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} />
              </motion.button>
            )
          })}
        </div>

        {/* Tab Content - spacious, borderless layout */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto space-y-9"
            >
              <div className="space-y-2">
                <h3 className="text-3xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                  Personal Details
                </h3>
                <p className="text-slate-500 max-w-2xl">Manage your core personal information and contact details.</p>
              </div>
              
              <div className="space-y-8">
                {[
                  { label: 'Full Name', icon: User, field: 'name', type: 'text' },
                  { label: 'Email Address', icon: Mail, field: 'email', type: 'email' },
                  { label: 'Phone Number', icon: Phone, field: 'phone', type: 'tel' },
                  { label: 'Age', icon: Calendar, field: 'age', type: 'number' },
                ].map((input, index) => (
                  <motion.div 
                    key={input.field} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <label className="text-slate-400 text-sm font-medium mb-2.5 flex items-center gap-3">
                      <input.icon size={20} className="text-amber-400 flex-shrink-0" strokeWidth={1.8} />
                      {input.label}
                    </label>
                    <input 
                      type={input.type} 
                      value={isEditing ? tempData[input.field] : profileData[input.field]} 
                      onChange={(e) => setTempData({
                        ...tempData, 
                        [input.field]: input.type === 'number' ? parseInt(e.target.value) : e.target.value
                      })}
                      disabled={!isEditing} 
                      className={`w-full bg-transparent border-b border-slate-800/80 py-3 px-1 focus:border-amber-500/50 focus:outline-none transition-colors font-medium text-lg placeholder:text-slate-600 ${
                        !isEditing && 'cursor-default'
                      }`}
                      placeholder={`Enter your ${input.label.toLowerCase()}`}
                    />
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.4 }}
                  className="group"
                >
                  <label className="text-slate-400 text-sm font-medium mb-2.5 flex items-center gap-3">
                    <User size={20} className="text-amber-400 flex-shrink-0" strokeWidth={1.8} />
                    Gender
                  </label>
                  <select 
                    value={isEditing ? tempData.gender : profileData.gender} 
                    onChange={(e) => setTempData({...tempData, gender: e.target.value})}
                    disabled={!isEditing} 
                    className={`w-full bg-transparent border-b border-slate-800/80 py-3 px-1 focus:border-amber-500/50 focus:outline-none transition-colors font-medium text-lg appearance-none cursor-pointer ${
                      !isEditing && 'cursor-default'
                    }`}
                  >
                    <option className="bg-slate-900 text-slate-200 py-2">Male</option>
                    <option className="bg-slate-900 text-slate-200 py-2">Female</option>
                    <option className="bg-slate-900 text-slate-200 py-2">Other</option>
                  </select>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'fitness' && (
            <motion.div 
              key="fitness" 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto space-y-9"
            >
              <div className="space-y-2">
                <h3 className="text-3xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                  Fitness Profile
                </h3>
                <p className="text-slate-500 max-w-2xl">Your physical metrics and training preferences that power your personalized program.</p>
              </div>
              
              <div className="space-y-8">
                {[
                  { label: 'Height (cm)', icon: Ruler, field: 'height', type: 'number' },
                  { label: 'Current Weight (kg)', icon: Weight, field: 'currentWeight', type: 'number' },
                  { label: 'Goal Weight (kg)', icon: Target, field: 'goalWeight', type: 'number' },
                  { 
                    label: 'Activity Level', 
                    icon: Activity, 
                    field: 'activityLevel', 
                    type: 'select', 
                    options: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] 
                  },
                ].map((input, index) => (
                  <motion.div 
                    key={input.field} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <label className="text-slate-400 text-sm font-medium mb-2.5 flex items-center gap-3">
                      <input.icon size={20} className="text-amber-400 flex-shrink-0" strokeWidth={1.8} />
                      {input.label}
                    </label>
                    {input.type === 'select' ? (
                      <select 
                        value={isEditing ? tempData[input.field] : profileData[input.field]} 
                        onChange={(e) => setTempData({...tempData, [input.field]: e.target.value})}
                        disabled={!isEditing} 
                        className={`w-full bg-transparent border-b border-slate-800/80 py-3 px-1 focus:border-amber-500/50 focus:outline-none transition-colors font-medium text-lg appearance-none cursor-pointer ${
                          !isEditing && 'cursor-default'
                        }`}
                      >
                        {input.options.map(opt => (
                          <option key={opt} className="bg-slate-900 text-slate-200 py-2">{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type={input.type} 
                        value={isEditing ? tempData[input.field] : profileData[input.field]} 
                        onChange={(e) => setTempData({
                          ...tempData, 
                          [input.field]: input.type === 'number' ? parseFloat(e.target.value) : e.target.value
                        })}
                        disabled={!isEditing} 
                        className={`w-full bg-transparent border-b border-slate-800/80 py-3 px-1 focus:border-amber-500/50 focus:outline-none transition-colors font-medium text-lg placeholder:text-slate-600 ${
                          !isEditing && 'cursor-default'
                        }`}
                        placeholder={`Enter ${input.label.toLowerCase()}`}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Progress visualization without boxes */}
              <div className="mt-12 pt-10 border-t border-slate-800/60">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500/15 to-transparent rounded-2xl flex items-center justify-center">
                    <Target className="text-amber-400" size={28} strokeWidth={1.8} />
                  </div>
                  <h4 className="text-2xl font-light text-slate-100">Your Journey So Far</h4>
                </div>
                
                <div className="space-y-6 max-w-2xl">
                  <p className="text-slate-300 text-lg">
                    You've lost <span className="font-medium text-amber-300">{(85 - profileData.currentWeight).toFixed(1)} kg</span> 
                    on your path to {profileData.goalWeight} kg.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-slate-500 mb-3">
                        <span>85.0 kg</span>
                        <span>{profileData.goalWeight} kg</span>
                      </div>
                      <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700"
                          style={{ 
                            width: `${Math.min(98, ((85 - profileData.currentWeight) / (85 - profileData.goalWeight)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xl font-light">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-400">
                        {profileData.currentWeight} kg
                      </span>
                      <span className="text-emerald-400">
                        {Math.round(((85 - profileData.currentWeight) / (85 - profileData.goalWeight)) * 100)}% there
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {/* Notifications - elegant list style */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Bell className="text-blue-400" size={26} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-3xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                    Notifications
                  </h3>
                </div>
                
                <div className="space-y-5 max-w-2xl">
                  {[
                    { 
                      title: 'Workout Reminders', 
                      desc: 'Get notified 30 minutes before scheduled workouts', 
                      enabled: true 
                    },
                    { 
                      title: 'Progress Reports', 
                      desc: 'Weekly summaries of your fitness progress', 
                      enabled: true 
                    },
                    { 
                      title: 'Nutrition Tips', 
                      desc: 'Daily healthy eating suggestions', 
                      enabled: false 
                    }
                  ].map((setting, index) => (
                    <motion.div 
                      key={index} 
                      className="group py-4 border-b border-slate-800/50 last:border-b-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-lg text-slate-100">{setting.title}</p>
                          <p className="text-slate-500 text-sm mt-1.5 max-w-md">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={setting.enabled} 
                            className="sr-only peer"
                          />
                          <div className={`w-12 h-7 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/30 transition-colors ${
                            setting.enabled ? 'peer-checked:bg-amber-500' : ''
                          }`}>
                            <div className={`w-5 h-5 bg-slate-400 rounded-full absolute top-1 transition-transform ${
                              setting.enabled ? 'translate-x-5 bg-white' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Privacy - elegant list style */}
              <div className="space-y-2 pt-8 border-t border-slate-800/40">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                    <Lock className="text-purple-400" size={26} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-3xl font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                    Privacy & Security
                  </h3>
                </div>
                
                <div className="space-y-3 max-w-2xl">
                  {[
                    { action: 'Change Password', desc: 'Update your account password', color: 'text-slate-200' },
                    { action: 'Two-Factor Authentication', desc: 'Add an extra layer of security', color: 'text-slate-200' },
                    { action: 'Export Your Data', desc: 'Download all your personal information', color: 'text-slate-200' },
                    { action: 'Delete Account', desc: 'Permanently remove your account', color: 'text-red-400' }
                  ].map((action, index) => (
                    <motion.button 
                      key={action.action} 
                      className={`w-full text-left py-4 group border-b border-slate-800/50 last:border-b-0 ${
                        action.color === 'text-red-400' ? 'hover:bg-red-500/5' : 'hover:bg-slate-800/40'
                      } transition-colors`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium text-lg ${action.color}`}>{action.action}</p>
                          <p className="text-slate-500 text-sm mt-1 max-w-md">{action.desc}</p>
                        </div>
                        <ChevronRight size={22} className="text-slate-600 group-hover:text-amber-400 transition-colors" strokeWidth={1.8} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Logout - elegant standalone button */}
              <motion.button
                className="group relative mt-6 max-w-md mx-auto w-full py-5 rounded-xl overflow-hidden border border-red-500/20"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3 text-red-300 font-medium text-lg">
                  <LogOut size={22} strokeWidth={1.8} />
                  <span>Sign Out</span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating decorative element */}
      <div className="hidden lg:block fixed bottom-16 right-16 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl -z-10 animate-float" />
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default ProfilePage
