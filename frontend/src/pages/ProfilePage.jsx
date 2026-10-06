import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Phone, Calendar, Target,
  Activity, Ruler, Weight, Edit3, Camera, Settings,
  LogOut, ChevronRight, Lock, Shield, Download, Check,
  Sparkles, Award, Bell, ShieldCheck, Key, Eye, EyeOff, X,
  Dumbbell, Flame, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { changePassword, generate2FA, verify2FA, disable2FA } from '../services/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => {
  const t = localStorage.getItem('token')
  return t && t !== 'null' && t !== 'undefined' && t !== 'demo-token-skip-auth' ? t : null
}

const DEFAULT_PROFILE = {
  name: 'Demo User',
  email: 'demo@fittracker.app',
  avatar: '',
  phone: '+1 (555) 019-2834',
  age: '24',
  gender: 'Male',
  height: '180',
  currentWeight: '75',
  goalWeight: '70',
  activityLevel: 'Very Active',
  fitnessGoal: 'Muscle Gain & Peak Conditioning',
  joinDate: new Date().toISOString().split('T')[0],
}

function ProfilePage() {
  const navigate = useNavigate()
  const avatarInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('bio') // 'bio' | 'security' | 'alerts' | 'badges'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securityModal, setSecurityModal] = useState(null) // 'password' | '2fa-enable' | '2fa-disable'
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState({ qrCode: '', secret: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [profileData, setProfileData] = useState({ ...DEFAULT_PROFILE })
  const [tempData, setTempData] = useState({ ...DEFAULT_PROFILE })

  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('profileNotificationSettings') || 'null')
      if (saved) return saved
    } catch {
      // ignore
    }
    return {
      workoutReminders: true,
      progressReports: true,
      nutritionTips: true,
    }
  })

  useEffect(() => {
    const token = getToken()
    if (!token) {
      try {
        const saved = localStorage.getItem('userProfile')
        if (saved) {
          const parsed = JSON.parse(saved)
          const merged = { ...DEFAULT_PROFILE, ...parsed }
          setProfileData(merged)
          setTempData(merged)
        }
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        if (user) {
          setProfileData((prev) => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            avatar: user.profileData?.avatar || prev.avatar,
          }))
          setTwoFactorEnabled(Boolean(user.twoFactorEnabled))
        }
      } catch {
        // ignore
      }
      setLoading(false)
      return
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((user) => {
        if (user?.email) {
          const pd = {
            name: user.name || 'Demo User',
            email: user.email || '',
            avatar: user.profileData?.avatar || '',
            phone: user.profileData?.phone || '',
            age: user.profileData?.age || '',
            gender: user.profileData?.gender || 'Male',
            height: user.profileData?.height || '',
            currentWeight: user.profileData?.weight || '',
            goalWeight: user.profileData?.goalWeight || '',
            activityLevel: user.profileData?.activityLevel || 'Very Active',
            fitnessGoal: user.profileData?.fitnessGoal || 'Muscle Gain & Peak Conditioning',
            joinDate: user.createdAt?.split('T')[0] || DEFAULT_PROFILE.joinDate,
          }
          setProfileData(pd)
          setTempData(pd)
          setTwoFactorEnabled(Boolean(user.twoFactorEnabled))
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('userProfile')
          if (saved) {
            const parsed = JSON.parse(saved)
            const merged = { ...DEFAULT_PROFILE, ...parsed }
            setProfileData(merged)
            setTempData(merged)
          }
        } catch {
          // ignore
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const [searchParams] = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true' || !localStorage.getItem('profileCompleted')

  useEffect(() => {
    if (isOnboarding) {
      setIsEditing(true)
    }
  }, [isOnboarding])

  const handleEdit = () => {
    setTempData({ ...profileData })
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const token = getToken()

    const ageVal = Number(tempData.age) || 24
    const heightVal = Number(tempData.height) || 180
    const weightVal = Number(tempData.currentWeight) || 75
    const goalWeightVal = Number(tempData.goalWeight) || weightVal
    const genderVal = tempData.gender || 'Male'
    const actVal = tempData.activityLevel || 'Very Active'
    const goalVal = tempData.fitnessGoal || 'Muscle Gain & Peak Conditioning'

    // BMR (Mifflin-St Jeor)
    let bmr = 10 * weightVal + 6.25 * heightVal - 5 * ageVal
    bmr = genderVal === 'Female' ? bmr - 161 : bmr + 5

    // Activity Multiplier
    let mult = 1.55
    if (actVal === 'Sedentary') mult = 1.2
    else if (actVal === 'Lightly Active') mult = 1.375
    else if (actVal === 'Active') mult = 1.55
    else if (actVal === 'Very Active') mult = 1.725

    const maintenance = Math.round(bmr * mult)

    // Goal Calorie Offset
    let goalCals = maintenance
    if (goalVal.toLowerCase().includes('gain') || goalVal.toLowerCase().includes('muscle') || goalWeightVal > weightVal) {
      goalCals = Math.round(maintenance + 400)
    } else if (goalVal.toLowerCase().includes('loss') || goalVal.toLowerCase().includes('cut') || goalWeightVal < weightVal) {
      goalCals = Math.round(maintenance - 450)
    }

    const proteinVal = Math.round(weightVal * 2.2)
    const carbsVal = Math.round((goalCals * 0.45) / 4)
    const fatsVal = Math.round((goalCals * 0.25) / 9)
    const waterGoalVal = Math.round(weightVal * 35)

    const userCalorieData = {
      maintenanceCalories: maintenance,
      goalCalories: goalCals,
      protein: proteinVal,
      carbs: carbsVal,
      fat: fatsVal,
      bmr: Math.round(bmr),
    }

    const updatedProfile = {
      ...tempData,
      age: ageVal,
      gender: genderVal,
      height: heightVal,
      currentWeight: weightVal,
      weight: weightVal,
      goalWeight: goalWeightVal,
      activityLevel: actVal,
      fitnessGoal: goalVal,
      calorieGoal: goalCals,
      proteinGoal: proteinVal,
    }

    localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
    localStorage.setItem('userCalorieData', JSON.stringify(userCalorieData))
    localStorage.setItem('waterGoal', waterGoalVal)
    localStorage.setItem('profileCompleted', 'true')

    if (token) {
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            age: ageVal,
            gender: genderVal,
            weight: weightVal,
            height: heightVal,
            goalWeight: goalWeightVal,
            activityLevel: actVal,
            fitnessGoal: goalVal,
            phone: tempData.phone,
            avatar: tempData.avatar || '',
            calorieGoal: goalCals,
            proteinGoal: proteinVal,
          }),
        })
        if (res.ok) {
          toast.success(`Profile & Macros Calculated! Daily: ${goalCals} kcal, ${proteinVal}g protein.`)
        } else {
          toast.success(`Profile saved! Daily: ${goalCals} kcal, ${proteinVal}g protein.`)
        }
      } catch {
        toast.success(`Profile saved! Daily: ${goalCals} kcal, ${proteinVal}g protein.`)
      }
    } else {
      toast.success(`Profile saved! Daily: ${goalCals} kcal, ${proteinVal}g protein.`)
    }

    setProfileData(updatedProfile)
    setIsEditing(false)
    setSaving(false)

    if (searchParams.get('onboarding') === 'true') {
      toast.success('Setup Complete! Redirecting to Dashboard... 🚀')
      setTimeout(() => navigate('/dashboard'), 1200)
    }
  }

  const handleCancel = () => {
    setTempData({ ...profileData })
    setIsEditing(false)
  }

  const handleAvatarUpload = (files) => {
    const file = files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) {
        toast.error('Could not read image.')
        return
      }
      setTempData((prev) => ({ ...prev, avatar: dataUrl }))
      if (!isEditing) setIsEditing(true)
      toast.success('Avatar selected! Click Save to apply.')
    }
    reader.onerror = () => toast.error('Could not read image.')
    reader.readAsDataURL(file)
  }

  const toggleNotificationSetting = (key) => {
    setNotificationSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('profileNotificationSettings', JSON.stringify(next))
      return next
    })
  }

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Signed out')
    navigate('/login')
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password confirmation does not match.')
      return
    }

    setSecurityLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully.')
      setSecurityModal(null)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error?.message || 'Could not change password.')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleEnable2FAStart = async () => {
    setSecurityLoading(true)
    try {
      const setup = await generate2FA()
      setTwoFactorSetup({ qrCode: setup.qrCode || '', secret: setup.secret || '' })
      setTwoFactorCode('')
      setSecurityModal('2fa-enable')
    } catch (error) {
      toast.error(error?.message || 'Failed to generate 2FA setup.')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleEnable2FAConfirm = async () => {
    if (!twoFactorCode.trim()) {
      toast.error('Enter verification code from your authenticator app.')
      return
    }

    setSecurityLoading(true)
    try {
      await verify2FA(twoFactorCode.trim())
      setTwoFactorEnabled(true)
      toast.success('Two-factor authentication enabled.')
      setSecurityModal(null)
      setTwoFactorCode('')
      setTwoFactorSetup({ qrCode: '', secret: '' })
    } catch (error) {
      toast.error(error?.message || 'Invalid verification code.')
    } finally {
      setSecurityLoading(false)
    }
  }

  const _handleDisable2FAConfirm = async () => {
    if (!twoFactorCode.trim()) {
      toast.error('Enter your authenticator code to disable 2FA.')
      return
    }

    setSecurityLoading(true)
    try {
      await disable2FA(twoFactorCode.trim())
      setTwoFactorEnabled(false)
      toast.success('Two-factor authentication disabled.')
      setSecurityModal(null)
      setTwoFactorCode('')
    } catch (error) {
      toast.error(error?.message || 'Could not disable 2FA.')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handleExportData = async () => {
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const loadEndpoint = async (path) => {
      const res = await fetch(`${API_URL}${path}`, { headers })
      if (!res.ok) return null
      return res.json()
    }

    setSecurityLoading(true)
    try {
      const [workouts, meals, progress] = await Promise.all([
        loadEndpoint('/workouts'),
        loadEndpoint('/meals'),
        loadEndpoint('/progress'),
      ])

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile: profileData,
        notifications: notificationSettings,
        workouts: workouts || [],
        meals: meals || [],
        progress: progress || [],
      }

      const jsonStr = JSON.stringify(exportPayload, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `FitTrack_Export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Fitness data exported successfully!')
    } catch (error) {
      toast.error('Export failed: ' + (error.message || 'Error'))
    } finally {
      setSecurityLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen w-full bg-[#09090b] text-[#E4E4E7] select-none pb-16 relative overflow-x-clip"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      {/* ─── SLEEK HEADER WITH BACK BUTTON ────────────────────────────────────── */}
      <header className="px-6 md:px-10 pt-6 pb-4 flex items-center justify-between border-b border-white/5 relative z-20">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white transition-all border-none flex items-center justify-center cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white flex items-center gap-2">
              <Flame className="text-red-500" size={24} />
              Athlete Profile
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Manage identity, security & fitness parameters</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 border-none transition-all cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEdit}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            className="p-2.5 rounded-2xl text-red-400 bg-white/[0.04] hover:bg-red-500/20 border-none transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-8 space-y-8 relative z-20">

        {/* Onboarding Welcome Banner */}
        <AnimatePresence>
          {isOnboarding && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-[32px] p-6 sm:p-8 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 border-none space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 shrink-0">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                    Welcome to FitTrack! Complete Your Athlete Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                    Please fill out your physical parameters (Height, Weight, Age, Gender, Activity Level, and Fitness Goal) below. All metrics including <span className="text-cyan-400 font-bold">BMI</span>, <span className="text-amber-400 font-bold">Daily Calories</span>, <span className="text-purple-400 font-bold">Protein Targets</span>, and <span className="text-blue-400 font-bold">Water Goals</span> will be automatically calculated and synced across all pages!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── LUXURY HERO PROFILE CARD ───────────────────────────────────────── */}
        <div className="rounded-[32px] bg-white/[0.03] p-8 backdrop-blur-md border-none flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-red-500 via-orange-500 to-amber-500 shadow-2xl flex items-center justify-center">
                {tempData.avatar || profileData.avatar ? (
                  <img
                    src={tempData.avatar || profileData.avatar}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#141419] flex items-center justify-center text-4xl font-black text-white font-mono">
                    {(profileData.name || 'D').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-white text-black shadow-xl hover:scale-110 transition-transform border-none cursor-pointer"
                title="Change Avatar"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                      className="bg-white/[0.05] border-none rounded-xl px-3 py-1 text-xl text-white font-bold focus:outline-none"
                    />
                  ) : (
                    profileData.name || 'Demo User'
                  )}
                </h2>
                <span className="px-3.5 py-1 rounded-full bg-red-500/15 text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  Titanium Athlete &bull; Level 99
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">{profileData.email || 'demo@fittracker.app'}</p>
              <p className="text-[11px] text-zinc-500 font-mono">Member since {profileData.joinDate || '2026-08-02'}</p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-white/[0.03] text-center min-w-[100px]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Height</span>
              <span className="text-xl font-bold text-white font-mono">{profileData.height || '180'} <span className="text-xs font-normal text-zinc-500">CM</span></span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-center min-w-[100px]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Weight</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{profileData.currentWeight || '75'} <span className="text-xs font-normal text-zinc-500">KG</span></span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-center min-w-[100px]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Target</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{profileData.goalWeight || '70'} <span className="text-xs font-normal text-zinc-500">KG</span></span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] text-center min-w-[100px]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Activity</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mt-1">{profileData.activityLevel || 'Very Active'}</span>
            </div>
          </div>

        </div>

        {/* ─── NAVIGATION TABS ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'bio', label: 'Personal Bio' },
            { id: 'security', label: 'Security & Auth' },
            { id: 'alerts', label: 'Preferences' },
            { id: 'badges', label: 'Athlete Badges' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: PERSONAL BIO & PHYSICAL PARAMETERS ──────────────────────── */}
        {activeTab === 'bio' && (
          <div className="rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-6 border-none">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">Physical Parameters & Goals</h3>
              <span className="text-xs text-zinc-500 font-mono">{isEditing ? 'Editing Mode' : 'Read Only'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Number */}
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.phone}
                    onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] font-mono text-sm text-white">{profileData.phone || 'Not specified'}</div>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={tempData.age}
                    onChange={(e) => setTempData({ ...tempData, age: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] font-mono text-sm text-white">{profileData.age ? `${profileData.age} years old` : 'Not specified'}</div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Gender</label>
                {isEditing ? (
                  <select
                    value={tempData.gender}
                    onChange={(e) => setTempData({ ...tempData, gender: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  >
                    <option value="Male" className="bg-black">Male</option>
                    <option value="Female" className="bg-black">Female</option>
                    <option value="Other" className="bg-black">Other</option>
                  </select>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] font-mono text-sm text-white">{profileData.gender}</div>
                )}
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Activity Level</label>
                {isEditing ? (
                  <select
                    value={tempData.activityLevel}
                    onChange={(e) => setTempData({ ...tempData, activityLevel: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  >
                    <option value="Sedentary" className="bg-black">Sedentary (Little or no exercise)</option>
                    <option value="Lightly Active" className="bg-black">Lightly Active (1-3 days/week)</option>
                    <option value="Active" className="bg-black">Active (3-5 days/week)</option>
                    <option value="Very Active" className="bg-black">Very Active (6-7 days/week)</option>
                  </select>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] font-mono text-sm text-white">{profileData.activityLevel}</div>
                )}
              </div>

              {/* Fitness Goal */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5">Primary Fitness Goal</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.fitnessGoal}
                    onChange={(e) => setTempData({ ...tempData, fitnessGoal: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] font-mono text-sm text-cyan-400 font-bold">{profileData.fitnessGoal}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: SECURITY & AUTHENTICATION ────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Password Management */}
              <div className="rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-4 border-none flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-2xl bg-white/[0.05] text-white">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase">Password Security</h3>
                      <p className="text-xs text-zinc-500">Update your login credentials</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                    Ensure your account stays secure by using a strong, unique password with at least 6 characters.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSecurityModal('password')}
                  className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all cursor-pointer"
                >
                  Change Password
                </motion.button>
              </div>

              {/* 2FA Authenticator */}
              <div className="rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-4 border-none flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-white/[0.05] text-white">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase">Two-Factor Auth (2FA)</h3>
                        <p className="text-xs text-zinc-500">Authenticator app verification</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                    Protect your account with Time-based One-Time Passwords (TOTP) via Google Authenticator or Authy.
                  </p>
                </div>

                {twoFactorEnabled ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSecurityModal('2fa-disable')}
                    className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-red-400 bg-red-500/10 hover:bg-red-500/20 border-none transition-all cursor-pointer"
                  >
                    Disable 2FA
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnable2FAStart}
                    className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all cursor-pointer"
                  >
                    Enable 2FA Setup
                  </motion.button>
                )}
              </div>

              {/* Data Export Box */}
              <div className="md:col-span-2 rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-4 border-none flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                    <Download size={18} className="text-cyan-400" />
                    Export Full Fitness Data
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Download your workouts, meals, progress metrics & profile settings in clean JSON format.</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportData}
                  disabled={securityLoading}
                  className="px-7 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all cursor-pointer shrink-0"
                >
                  {securityLoading ? 'Exporting...' : 'Export Data (.JSON)'}
                </motion.button>
              </div>

            </div>
          </div>
        )}

        {/* ─── TAB 3: PREFERENCES & NOTIFICATIONS ──────────────────────────────── */}
        {activeTab === 'alerts' && (
          <div className="rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-6 border-none">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">App Preferences & Notifications</h3>
            </div>

            <div className="space-y-4">
              {[
                { key: 'workoutReminders', title: 'Workout Reminders', desc: 'Receive daily training notifications and rest timers.' },
                { key: 'progressReports', title: 'Weekly Progress Reports', desc: 'Get automated weekly summary reports of volume & calories.' },
                { key: 'nutritionTips', title: 'AI Nutrition Recommendations', desc: 'Receive personalized meal tips based on your macros.' },
              ].map((item) => (
                <div key={item.key} className="p-5 rounded-2xl bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white uppercase">{item.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting(item.key)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors border-none cursor-pointer flex items-center ${
                      notificationSettings[item.key] ? 'bg-cyan-500 justify-end' : 'bg-zinc-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: ATHLETE BADGES SHOWCASE ─────────────────────────────────── */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white">Athlete Milestones & Badges</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Unlocked achievements and fitness rank badges</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { title: 'Consistency Champion', desc: 'Logged workouts 7 days in a row', icon: Flame, color: '#f59e0b', unlocked: true },
                { title: 'Iron Lifter', desc: 'Surpassed 10,000 kg total session volume', icon: Dumbbell, color: '#22d3ee', unlocked: true },
                { title: 'Nutrition Master', desc: 'Met daily protein targets 5 days straight', icon: Target, color: '#a78bfa', unlocked: true },
                { title: 'Titanium Rank', desc: 'Completed over 50 workout check-ins', icon: Award, color: '#ef4444', unlocked: false },
              ].map((badge, i) => (
                <div
                  key={i}
                  className={`rounded-[24px] p-6 flex flex-col justify-between space-y-4 border-none transition-all ${
                    badge.unlocked ? 'bg-white/[0.04]' : 'bg-white/[0.01] opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-white/[0.05]" style={{ color: badge.color }}>
                      <badge.icon size={24} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      badge.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-white uppercase">{badge.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ─── CHANGE PASSWORD MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {securityModal === 'password' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[32px] bg-[#121216] p-6 sm:p-8 space-y-5 border-none shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Change Password</h3>
                <button
                  onClick={() => setSecurityModal(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSecurityModal(null)}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={securityLoading}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  {securityLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 2FA SETUP MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {securityModal === '2fa-enable' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[32px] bg-[#121216] p-6 sm:p-8 space-y-5 border-none shadow-2xl text-center"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Scan 2FA QR Code</h3>
                <button
                  onClick={() => setSecurityModal(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {twoFactorSetup.qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto">
                  <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="w-44 h-44" />
                </div>
              )}

              <p className="text-xs text-zinc-400">Scan this QR code using Google Authenticator or Authy, then enter the 6-digit code below.</p>

              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000 000"
                className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-center font-mono font-bold text-lg text-cyan-400 focus:outline-none tracking-widest"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSecurityModal(null)}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnable2FAConfirm}
                  disabled={securityLoading}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  {securityLoading ? 'Verifying...' : 'Confirm 2FA'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  )
}

export default ProfilePage
