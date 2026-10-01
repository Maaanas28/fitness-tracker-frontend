import { useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, TrendingUp, Target, Flame,
  Plus, Trash2, ChevronDown, ChevronUp, BarChart3,
  Activity, Zap, Save, X, Loader2, Camera,
  Image as ImageIcon, Upload, ZoomIn, Tag, Check, Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useApi, apiPost, apiDelete } from '../hooks/useApi'
import toast from 'react-hot-toast'
import { EmptyState } from '../components/EmptyState'

// ─── CUSTOM DARK TOOLTIP ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  const displayLabel = payload?.[0]?.payload?.range || label
  return (
    <div className="rounded-2xl p-4 bg-[#141419] text-white font-mono text-xs shadow-2xl border-none">
      <p className="font-bold text-sm mb-2 text-cyan-400">{displayLabel}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
          <span className="text-zinc-400">{item.name}:</span>
          <span className="font-bold text-white">{item.value}{unit || (item.unit || '')}</span>
        </div>
      ))}
    </div>
  )
}

// ─── IMAGE COMPRESSION HELPER ───────────────────────────────────────────────
const compressImage = (file, maxW = 900, quality = 0.72) =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxW) { height = Math.round((height * maxW) / width); width = maxW }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })

const PHOTO_LABELS = ['Front', 'Back', 'Left Side', 'Right Side', 'Full Body', 'Progress']

function ProgressPage() {
  const navigate = useNavigate()
  const [showLogModal, setShowLogModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview'|'history'|'body'|'photos'

  // Photo state
  const [photoLabel, setPhotoLabel] = useState('Front')
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [lightbox, setLightbox] = useState(null) // { src, date, label }
  const photoInputRef = useRef(null)

  // Form state for new progress log
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    notes: '',
    chest: '', waist: '', hips: '', arms: '', legs: ''
  })
  const [saving, setSaving] = useState(false)

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────
  const { data: progressEntries, refetch: refetchProgress } = useApi('/progress')
  const { data: workouts } = useApi('/workouts')
  const { data: userProfile } = useApi('/auth/me')

  // ─── DERIVED DATA ──────────────────────────────────────────────────────────
  const profile = useMemo(() => userProfile?.profileData || {}, [userProfile])
  const currentWeight = useMemo(() => parseFloat(profile.weight) || null, [profile])
  const goalWeight = useMemo(() => parseFloat(profile.goalWeight) || null, [profile])

  // Weight chart from progress entries
  const weightChartData = useMemo(() => {
    if (!progressEntries?.length) return []
    return [...progressEntries]
      .filter(e => e.weight)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-12)
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: parseFloat(e.weight),
        bodyFat: e.bodyFat ? parseFloat(e.bodyFat) : null,
        goal: goalWeight || currentWeight
      }))
  }, [progressEntries, goalWeight, currentWeight])

  // Key stats
  const totalWorkouts = workouts?.length || 0

  const streak = useMemo(() => {
    if (!workouts?.length) return 0
    let s = 0
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (workouts.some(w => (w.date || w.createdAt?.split('T')[0]) === ds)) s++
      else if (i > 0) break
    }
    return s
  }, [workouts])

  const totalVolume = useMemo(() =>
    workouts?.reduce((s, w) => s + (w.volume || 0), 0) || 0
    , [workouts])

  const latestWeight = useMemo(() => {
    const entry = progressEntries?.find(e => e.weight)
    if (entry) return parseFloat(entry.weight)
    return currentWeight
  }, [progressEntries, currentWeight])

  const goalDelta = useMemo(() => {
    if (latestWeight == null || goalWeight == null) return null
    return Number((latestWeight - goalWeight).toFixed(1))
  }, [latestWeight, goalWeight])

  // All photos from all entries
  const allPhotos = useMemo(() => {
    if (!progressEntries?.length) return []
    const photos = []
      ;[...progressEntries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(entry => {
          (entry.photos || []).forEach(photoStr => {
            const [label, src] = photoStr.includes('||') ? photoStr.split('||') : ['Photo', photoStr]
            photos.push({ src, label, date: entry.date, entryId: entry._id })
          })
        })
    return photos
  }, [progressEntries])

  // UPLOAD PHOTO
  const handlePhotoUpload = useCallback(async (files) => {
    if (!files?.length) return
    setUploadingPhoto(true)
    try {
      const compressed = await compressImage(files[0])
      const photoStr = `${photoLabel}||${compressed}`
      const res = await apiPost('/progress', {
        date: photoDate,
        photos: [photoStr]
      })
      if (res) {
        toast.success('Progress photo saved!')
        refetchProgress()
      } else {
        toast.error('Could not save photo. Login required.')
      }
    } catch (e) {
      toast.error('Upload failed: ' + (e.message || 'Error'))
    } finally {
      setUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }, [photoLabel, photoDate, refetchProgress])

  // SAVE PROGRESS LOG
  const handleSave = useCallback(async () => {
    if (!form.date) return toast.error('Date is required')
    if (!form.weight && !form.bodyFat && !form.chest && !form.waist && !form.notes) {
      return toast.error('Enter at least one measurement')
    }
    setSaving(true)
    try {
      const payload = {
        date: form.date,
        ...(form.weight && { weight: parseFloat(form.weight) }),
        ...(form.bodyFat && { bodyFat: parseFloat(form.bodyFat) }),
        ...(form.notes && { notes: form.notes }),
        measurements: {
          ...(form.chest && { chest: parseFloat(form.chest) }),
          ...(form.waist && { waist: parseFloat(form.waist) }),
          ...(form.hips && { hips: parseFloat(form.hips) }),
          ...(form.arms && { arms: parseFloat(form.arms) }),
          ...(form.legs && { legs: parseFloat(form.legs) }),
        }
      }
      const res = await apiPost('/progress', payload)
      if (res) {
        toast.success('Progress logged successfully!')
        setShowLogModal(false)
        setForm({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', notes: '', chest: '', waist: '', hips: '', arms: '', legs: '' })
        refetchProgress()
      } else {
        toast.error('Failed to save progress.')
      }
    } catch (e) {
      toast.error(e.message || 'Failed to save progress')
    } finally {
      setSaving(false)
    }
  }, [form, refetchProgress])

  // DELETE PROGRESS ENTRY
  const handleDelete = useCallback(async (id) => {
    setDeletingId(id)
    try {
      await apiDelete(`/progress/${id}`)
      toast.success('Entry deleted')
      refetchProgress()
    } catch {
      toast.error('Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }, [refetchProgress])

  return (
    <div 
      className="min-h-screen w-full bg-[#09090b] text-[#E4E4E7] select-none pb-16"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      {/* ─── SLEEK HEADER WITH BACK BUTTON ────────────────────────────────────── */}
      <header className="px-6 md:px-10 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
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
              Progress & Stats
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Track body metrics, weight trends & progress photos</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Kanit' }}>
              {latestWeight ? `${latestWeight} KG` : '--'}
              <span className="text-xs font-normal text-zinc-500"> / {goalWeight || '--'} GOAL</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
              {goalDelta != null ? `${goalDelta > 0 ? '+' : ''}${goalDelta} kg to goal` : 'Streak: ' + streak + 'd'}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogModal(true)}
            className="px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Metric</span>
          </motion.button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-8 space-y-8">

        {/* ─── NAVIGATION TABS ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'body', label: 'Body Metrics' },
            { id: 'photos', label: `Photos (${allPhotos.length})` },
            { id: 'history', label: `Log History (${progressEntries?.length || 0})` },
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

        {/* ─── TAB 1: OVERVIEW ───────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-[24px] bg-white/[0.03] p-6 space-y-2 border-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Current Weight</span>
                <div className="text-3xl font-black text-white">{latestWeight ? `${latestWeight} kg` : '--'}</div>
                <p className="text-[11px] text-cyan-400 font-mono">Goal: {goalWeight || '--'} kg</p>
              </div>

              <div className="rounded-[24px] bg-white/[0.03] p-6 space-y-2 border-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Active Streak</span>
                <div className="text-3xl font-black text-amber-400">{streak} Days</div>
                <p className="text-[11px] text-zinc-500 font-mono">{totalWorkouts} Total Workouts</p>
              </div>

              <div className="rounded-[24px] bg-white/[0.03] p-6 space-y-2 border-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Total Lifted Volume</span>
                <div className="text-3xl font-black text-purple-400">{totalVolume.toLocaleString()} kg</div>
                <p className="text-[11px] text-zinc-500 font-mono">Lifetime volume</p>
              </div>

              <div className="rounded-[24px] bg-white/[0.03] p-6 space-y-2 border-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Logged Entries</span>
                <div className="text-3xl font-black text-emerald-400">{progressEntries?.length || 0}</div>
                <p className="text-[11px] text-zinc-500 font-mono">Check-in history</p>
              </div>
            </div>

            {/* Weight Progress Trend Line Chart */}
            <div className="rounded-[28px] bg-white/[0.03] p-6 sm:p-8 space-y-5 border-none">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" size={20} />
                    Weight Progress Trend
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Historical weight logs over time</p>
                </div>
              </div>

              {weightChartData.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  No weight entries logged. Click "+ Log Metric" to add your first weight log.
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip content={(props) => <CustomTooltip {...props} unit=" kg" />} />
                      {goalWeight && (
                        <ReferenceLine y={goalWeight} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'GOAL', fill: '#f59e0b', fontSize: 10 }} />
                      )}
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ fill: '#3b82f6', r: 4 }} 
                        activeDot={{ r: 7 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─── TAB 2: BODY METRICS & MEASUREMENTS ─────────────────────────────── */}
        {activeTab === 'body' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white">Body Circumference Metrics</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Chest, Waist, Hips, Arms & Legs measurements (cm/inches)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progressEntries?.filter(e => e.measurements && Object.keys(e.measurements).length > 0).length === 0 ? (
                <div className="md:col-span-2 rounded-[24px] bg-white/[0.02] p-12 text-center border-none">
                  <EmptyState
                    icon={BarChart3}
                    title="No Body Measurements Logged"
                    message="Use '+ Log Metric' to add your chest, waist, or arm measurements."
                  />
                </div>
              ) : (
                progressEntries?.filter(e => e.measurements && Object.keys(e.measurements).length > 0).map((entry) => (
                  <div key={entry._id} className="rounded-[24px] bg-white/[0.03] p-6 space-y-4 border-none">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="font-bold text-sm text-white uppercase font-mono">{entry.date}</span>
                      {entry.weight && <span className="text-xs font-mono text-cyan-400 font-bold">{entry.weight} kg</span>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(entry.measurements || {}).map(([key, val]) => (
                        <div key={key} className="p-3 rounded-xl bg-white/[0.04]">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">{key}</span>
                          <span className="text-base font-bold text-white font-mono">{val} cm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: PROGRESS PHOTOS ──────────────────────────────────────────── */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white">Progress Photo Gallery</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Upload & compare your physique transformation over time</p>
              </div>
            </div>

            {/* Photo Upload Box */}
            <div className="rounded-[28px] bg-white/[0.03] p-6 space-y-4 border-none">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Pose / Angle</label>
                  <select
                    value={photoLabel}
                    onChange={(e) => setPhotoLabel(e.target.value)}
                    className="w-full bg-white/[0.05] border-none rounded-xl px-4 py-3 text-xs text-white focus:outline-none font-medium"
                  >
                    {PHOTO_LABELS.map((lbl) => (
                      <option key={lbl} value={lbl} className="bg-black text-white">{lbl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Date</label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full bg-white/[0.05] border-none rounded-xl px-4 py-3 text-xs text-white focus:outline-none font-medium"
                  />
                </div>

                <div className="flex items-end">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all border-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload size={16} />
                    <span>{uploadingPhoto ? 'Compressing & Saving...' : 'Upload Photo'}</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Photos Grid */}
            {allPhotos.length === 0 ? (
              <div className="rounded-[24px] bg-white/[0.02] p-12 text-center border-none">
                <EmptyState
                  icon={ImageIcon}
                  title="No Progress Photos Uploaded"
                  message="Use the upload controls above to add front, back, or side progress photos."
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {allPhotos.map((photo, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setLightbox(photo)}
                    className="rounded-[20px] overflow-hidden bg-white/[0.03] cursor-pointer group relative aspect-square border-none"
                  >
                    <img src={photo.src} alt={photo.label} className="w-full h-full object-cover group-hover:brightness-110 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                      <span className="text-xs font-bold text-white uppercase">{photo.label}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{photo.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: LOG HISTORY ──────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-white">Full Check-in History</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">Chronological record of logged metrics</p>
              </div>
            </div>

            {progressEntries?.length === 0 ? (
              <div className="rounded-[24px] bg-white/[0.02] p-12 text-center border-none">
                <EmptyState
                  icon={Calendar}
                  title="No Log History"
                  message="All logged weight and metric entries will appear here."
                />
              </div>
            ) : (
              <div className="space-y-3">
                {progressEntries?.map((entry) => (
                  <div
                    key={entry._id}
                    className="rounded-[20px] p-5 bg-white/[0.03] hover:bg-white/[0.05] transition-all flex items-center justify-between border-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/[0.05] text-zinc-400 font-mono font-bold text-xs">
                        {entry.date}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          {entry.weight && <span className="font-bold text-base text-white">{entry.weight} kg</span>}
                          {entry.bodyFat && <span className="text-xs font-mono text-cyan-400">{entry.bodyFat}% Body Fat</span>}
                        </div>
                        {entry.notes && <p className="text-xs text-zinc-400 mt-0.5">{entry.notes}</p>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(entry._id)}
                      disabled={deletingId === entry._id}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/[0.05] transition-colors border-none cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── LOG METRIC MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[32px] bg-[#121216] p-6 sm:p-8 space-y-6 border-none shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Log Progress Metric</h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-zinc-500 hover:text-white p-2 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-white focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Body Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm({...form, weight: e.target.value})}
                      placeholder="e.g. 74.5"
                      className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-cyan-400 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.bodyFat}
                      onChange={(e) => setForm({...form, bodyFat: e.target.value})}
                      placeholder="e.g. 15.2"
                      className="w-full bg-white/[0.05] border-none rounded-2xl px-4 py-3 text-sm text-amber-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Optional Circumference Measurements */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold block">Tape Measurements (cm)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={form.chest}
                      onChange={(e) => setForm({...form, chest: e.target.value})}
                      placeholder="Chest"
                      className="bg-white/[0.04] border-none rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none"
                    />
                    <input
                      type="number"
                      value={form.waist}
                      onChange={(e) => setForm({...form, waist: e.target.value})}
                      placeholder="Waist"
                      className="bg-white/[0.04] border-none rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none"
                    />
                    <input
                      type="number"
                      value={form.arms}
                      onChange={(e) => setForm({...form, arms: e.target.value})}
                      placeholder="Arms"
                      className="bg-white/[0.04] border-none rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Notes / Journal</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                    placeholder="Feeling lean, strong energy today..."
                    className="w-full bg-white/[0.05] border-none rounded-2xl p-4 text-sm text-white focus:outline-none resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.05] hover:bg-white/10 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── LIGHTBOX PHOTO MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl w-full rounded-[32px] overflow-hidden bg-[#121216] p-6 space-y-4 border-none"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-lg uppercase">{lightbox.label}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{lightbox.date}</p>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="text-zinc-500 hover:text-white p-2 rounded-full border-none bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-hidden rounded-2xl flex items-center justify-center">
                <img src={lightbox.src} alt={lightbox.label} className="w-full h-full object-contain max-h-[60vh]" />
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

export default ProgressPage