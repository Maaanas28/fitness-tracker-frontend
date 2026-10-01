import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, useMotionValue, useTransform, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import {
  Dumbbell, Apple, TrendingUp, User, LogOut,
  Target, Activity, BarChart3, Brain, Droplet,
  AlarmClock, ChevronRight, ChevronLeft, ChevronDown, Sun, Moon, Zap, Flame, Calendar,
  Heart, Timer, BookOpen, Sparkles, MousePointer2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { useApi } from '../hooks/useApi'
import { useTheme } from '../context/ThemeContext'


// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: Dumbbell, label: 'Train', path: '/workout' },
  { icon: Apple, label: 'Diet', path: '/diet' },
  { icon: TrendingUp, label: 'Stats', path: '/progress' },
  { icon: User, label: 'Profile', path: '/profile' },
]

function toDayKey(rawDate) {
  if (!rawDate) return null
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate
  let parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime()) && typeof rawDate === 'string' && /^[A-Za-z]{3}\s+\d{1,2}$/.test(rawDate.trim())) {
    parsed = new Date(`${rawDate} ${new Date().getFullYear()}`)
  }
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).toISOString().split('T')[0]
}

const QUICK_LINKS = [
  { icon: BarChart3, label: 'PLAN', sub: 'Workout Plan', path: '/workout-plan', color: 'from-violet-500 to-purple-600' },
  { icon: Target, label: 'BMI', sub: 'Calculator', path: '/calculator', color: 'from-emerald-500 to-teal-600' },
  { icon: Droplet, label: 'WATER', sub: 'Water Tracker', path: '/water', color: 'from-blue-500 to-cyan-600' },
  { icon: AlarmClock, label: 'TIMER', sub: 'Rest Timer', path: '/timer', color: 'from-amber-500 to-orange-600' },
  { icon: BookOpen, label: 'LIBRARY', sub: 'Exercise DB', path: '/exercises', color: 'from-pink-500 to-rose-600' },
  { icon: Brain, label: 'AI', sub: 'AI Trainer', path: '/ai', color: 'from-fuchsia-500 to-violet-600' },
]

const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Pain is temporary. Glory is forever.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Champions aren't made in gyms. Champions are made from something they have deep inside them.",
  "If it doesn't challenge you, it doesn't change you.",
  "Sweat is just fat crying.",
  "Be stronger than your excuses.",
  "The hardest lift is lifting your ass off the couch.",
  "Success starts with self-discipline.",
  "Train insane or remain the same.",
]

const GYM_IMAGES = {
  tl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  tr: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
  bl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
  br: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
}


// ─── CONTACT BUTTON (from reference) ─────────────────────────────────────────
const ContactButton = ({ children, onClick, className = '' }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={`px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.25em] rounded-full text-white transition-all duration-300 ${className}`}
    style={{
      background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
      boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
      outline: '2px solid white',
      outlineOffset: '-3px',
    }}
  >
    {children}
  </motion.button>
)


// ─── FADE IN COMPONENT ───────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, x, y }}
    whileInView={{ opacity: 1, x: 0, y: 0 }}
    viewport={{ once: true, margin: '50px', amount: 0 }}
    transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
)


// ─── MAGNET COMPONENT ────────────────────────────────────────────────────────
const Magnet = ({ children, padding = 80, strength = 3, className = '' }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < padding + rect.width / 2) {
      x.set(dx / strength)
      y.set(dy / strength)
    } else {
      x.set(0)
      y.set(0)
    }
  }, [x, y, padding, strength])

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }, [x, y])

  const handleEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
      style={{
        x, y,
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
        transition: isHovered ? 'transform 0.3s ease-out' : 'transform 0.6s ease-in-out',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}


// ─── ANIMATED TEXT (character-by-character) ──────────────────────────────────
const AnimatedCharWithHook = ({ char, index, total, scrollYProgress }) => {
  const progress = useTransform(
    scrollYProgress,
    [index / total, (index + 1) / total],
    [0.15, 1]
  )
  return (
    <motion.span style={{ opacity: progress }}>
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}

const AnimatedText = ({ text, className = '' }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  return (
    <p ref={ref} className={`relative ${className}`}>
      {text.split('').map((char, i) => (
        <AnimatedCharWithHook
          key={i}
          char={char}
          index={i}
          total={text.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </p>
  )
}



// ─── NAV LINK ────────────────────────────────────────────────────────────────
const NavLink = ({ icon: Icon, label, isActive, onClick }) => {
  const { isDark } = useTheme() || { isDark: true }
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
    >
      <Icon size={15} className={isActive ? (isDark ? 'text-red-500' : 'text-red-600') : (isDark ? 'text-red-500/80' : 'text-slate-700')} />
      <span className={`text-[12px] uppercase tracking-[0.18em] font-black transition-all ${isActive
          ? (isDark ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]' : 'text-red-600')
          : (isDark ? 'text-white hover:text-red-400' : 'text-slate-900 hover:text-black')
        }`}>
        {label}
      </span>
    </motion.button>
  )
}


// ─── RING PROGRESS ───────────────────────────────────────────────────────────
const RingProgress = ({ pct, size = 90, color, label, value }) => {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(215,226,234,0.08)" strokeWidth={5} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm font-bold" style={{ color, fontFamily: 'Kanit' }}>{value}</p>
        </div>
      </div>
      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    </motion.div>
  )
}


// ─── CHART TOOLTIP ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(12,12,12,0.95)', border: '1px solid rgba(255,26,26,0.25)', fontFamily: 'Kanit', backdropFilter: 'blur(10px)' }}>
      <p className="text-zinc-500 mb-1 font-medium">{label}</p>
      {payload.map((item, i) => <p key={i} className="font-bold" style={{ color: item.color || '#ff1a1a' }}>{item.value}{item.name === 'weight' ? 'kg' : item.name === 'calories' ? 'kcal' : ''}</p>)}
    </div>
  )
}


// ─── SECTION CARD (numbered list style from reference) ───────────────────────
const SectionCard = ({ number, title, description, icon: Icon, onClick, delay }) => {
  const { isDark } = useTheme() || { isDark: true }
  return (
    <FadeIn delay={delay} className={`border-b ${isDark ? 'border-[#D7E2EA]/10' : 'border-slate-200'} py-6 sm:py-8 md:py-10 transition-colors`}>
      <motion.button
        onClick={onClick}
        whileHover={{ x: 8 }}
        className="w-full flex items-center gap-4 sm:gap-6 md:gap-8 text-left group"
      >
        <span
          className={`font-black uppercase leading-none transition-colors ${isDark ? 'text-[#D7E2EA]/10 group-hover:text-[#D7E2EA]/20' : 'text-slate-300 group-hover:text-slate-400'}`}
          style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
        >
          {number}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className={isDark ? 'text-red-500' : 'text-red-600'} />
            <span className={`font-medium uppercase tracking-[0.15em] ${isDark ? 'text-[#D7E2EA]/90' : 'text-slate-800'}`} style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)' }}>
              {title}
            </span>
          </div>
          <p className={`font-light leading-relaxed max-w-xl ${isDark ? 'text-zinc-400' : 'text-slate-600'}`} style={{ fontSize: 'clamp(0.75rem, 1.3vw, 1rem)' }}>
            {description}
          </p>
        </div>
        <ChevronRight size={16} className={`${isDark ? 'text-zinc-600 group-hover:text-[#D7E2EA]' : 'text-slate-400 group-hover:text-slate-800'} transition-colors mt-2`} />
      </motion.button>
    </FadeIn>
  )
}


// ─── STICKY STACK CARD ───────────────────────────────────────────────────────
const StickyStackCard = ({ children, index, totalCards }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const scale = useTransform(springProgress, [0, 1], [1 - (totalCards - 1 - index) * 0.03, 1])

  return (
    <div ref={ref} className="h-[80vh] sticky top-24 md:top-28 flex items-start" style={{ marginTop: `${index * 20}px` }}>
      <motion.div style={{ scale }} className="w-full">
        {children}
      </motion.div>
    </div>
  )
}


// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
function calcBMI(weight, height) {
  if (!weight || !height) return null
  const h = parseFloat(height) / 100
  const w = parseFloat(weight)
  if (isNaN(h) || isNaN(w) || h <= 0) return null
  const bmi = w / (h * h)
  if (bmi < 18.5) return { val: bmi.toFixed(1), label: 'Underweight', color: '#3b82f6' }
  if (bmi < 25) return { val: bmi.toFixed(1), label: 'Normal', color: '#22c55e' }
  if (bmi < 30) return { val: bmi.toFixed(1), label: 'Overweight', color: '#f59e0b' }
  return { val: bmi.toFixed(1), label: 'Obese', color: '#ff1a1a' }
}

function asNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toFiniteOrNull(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function safePercent(value, goal) {
  const val = asNumber(value, 0)
  const target = asNumber(goal, 0)
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((val / target) * 100)))
}


// ─── 3D COSMIC VORTEX COMPONENT (Volcanic Red Edition) ─────────────────────────
const CosmicVortex = () => {
  return (
    <div className="relative w-[650px] h-[650px] sm:w-[850px] sm:h-[850px] lg:w-[1050px] lg:h-[1050px] flex items-center justify-center overflow-visible select-none pointer-events-none">
      <style>{`
        @keyframes vortex-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes vortex-orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes vortex-dash {
          to { stroke-dashoffset: -1000; }
        }
        @keyframes vortex-pulse {
          0%, 100% { transform: scale(1) translateZ(40px); opacity: 0.85; filter: drop-shadow(0 0 20px rgba(255,26,26,0.6)); }
          50% { transform: scale(1.15) translateZ(50px); opacity: 1; filter: drop-shadow(0 0 40px rgba(255,26,26,0.9)); }
        }
        .animate-vortex-orbit {
          animation: vortex-orbit 30s linear infinite;
        }
        .animate-vortex-orbit-reverse {
          animation: vortex-orbit-reverse 20s linear infinite;
        }
        .animate-vortex-orbit-fast {
          animation: vortex-orbit 12s linear infinite;
        }
        .animate-vortex-dash-1 {
          animation: vortex-dash 15s linear infinite;
        }
        .animate-vortex-dash-2 {
          animation: vortex-dash 10s linear infinite;
        }
        .animate-vortex-dash-3 {
          animation: vortex-dash 8s linear infinite;
        }
        .animate-vortex-pulse {
          animation: vortex-pulse 4s ease-in-out infinite;
        }
      `}</style>

      {/* Deep Volcanic ambient radial glow behind the vortex */}
      <div
        className="absolute w-[130%] h-[130%] rounded-full opacity-50 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,26,26,0.5) 0%, rgba(249,115,22,0.25) 35%, rgba(185,28,28,0.15) 60%, rgba(0,0,0,0) 80%)'
        }}
      />

      {/* 3D Perspective Wrapper */}
      <div
        className="w-full h-full relative flex items-center justify-center"
        style={{
          perspective: '1500px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Layer 1: Outer Volcanic Dust Ring */}
        <div
          className="absolute w-[100%] h-[100%] border border-red-500/15 rounded-full animate-vortex-orbit"
          style={{
            transform: 'rotateX(72deg) rotateY(-18deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d'
          }}
        />

        {/* Layer 2: Main Orbital Disk */}
        <div
          className="absolute w-[90%] h-[90%] animate-vortex-orbit-reverse"
          style={{
            transform: 'rotateX(72deg) rotateY(-18deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Multiple concentric SVG orbit lines and particle streams */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="vortex-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1a1a" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff1a1a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vortex-g2" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#b91c1c" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Orbit Ring 1 */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255, 26, 26, 0.08)" strokeWidth="1" />
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#vortex-g1)"
              strokeWidth="1.8"
              strokeDasharray="40 180"
              className="animate-vortex-dash-1"
            />

            {/* Orbit Ring 2 */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(249, 115, 22, 0.12)" strokeWidth="1.5" strokeDasharray="10 15" />
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#vortex-g2)"
              strokeWidth="2.2"
              strokeDasharray="80 250"
              className="animate-vortex-dash-2"
            />
          </svg>
        </div>

        {/* Layer 3: Inner Fast Disk */}
        <div
          className="absolute w-[70%] h-[70%] animate-vortex-orbit"
          style={{
            transform: 'rotateX(72deg) rotateY(-18deg) translateZ(15px)',
            transformStyle: 'preserve-3d'
          }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            {/* Orbit Ring 3 */}
            <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" />
            <circle
              cx="100"
              cy="100"
              r="55"
              fill="none"
              stroke="url(#vortex-g1)"
              strokeWidth="2.5"
              strokeDasharray="25 120"
              className="animate-vortex-dash-3"
            />
            {/* Additional fast sparks */}
            <circle
              cx="100"
              cy="100"
              r="45"
              fill="none"
              stroke="url(#vortex-g2)"
              strokeWidth="2"
              strokeDasharray="15 90"
              className="animate-vortex-dash-2"
            />
          </svg>
        </div>

        {/* Layer 4: Accretion Ring (Bright Volcanic Edge) */}
        <div
          className="absolute w-[45%] h-[45%] border-2 border-red-500/50 rounded-full animate-vortex-orbit-reverse"
          style={{
            transform: 'rotateX(72deg) rotateY(-18deg) translateZ(28px)',
            boxShadow: '0 0 30px rgba(255,26,26,0.45), inset 0 0 30px rgba(255,26,26,0.45)',
            background: 'radial-gradient(circle, transparent 55%, rgba(255,26,26,0.2) 100%)'
          }}
        />

        {/* Layer 5: Glowing Volcanic Core Portal (Singularity) */}
        <div
          className="absolute w-[90px] h-[90px] rounded-full bg-black border-2 border-red-500/70 flex items-center justify-center animate-vortex-pulse"
          style={{
            transformStyle: 'preserve-3d',
            background: 'radial-gradient(circle, #000 45%, #1f0505 100%)'
          }}
        >
          {/* Volcanic core sphere */}
          <div
            className="w-7 h-7 rounded-full bg-red-500 shadow-[0_0_35px_#ff1a1a] opacity-95"
            style={{
              background: 'radial-gradient(circle, #ffffff 10%, #ff1a1a 80%)'
            }}
          />
        </div>
      </div>
    </div>
  )
}


// ─── 3D SCROLL DOWN INDICATOR COMPONENT ──────────────────────────────────────
const ScrollDownIndicator = ({ isDark }) => {
  return (
    <motion.div
      onClick={() => {
        window.scrollTo({
          top: window.innerHeight * 0.95,
          behavior: 'smooth',
        })
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8 }}
      className="relative z-20 flex flex-col items-center justify-center cursor-pointer group pb-4 select-none"
    >
      <style>{`
        @keyframes scroll-pulse-ring {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.15; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes scroll-bounce-float {
          0%, 100% { transform: translateY(0px) rotateX(25deg); }
          50% { transform: translateY(8px) rotateX(35deg); }
        }
        .animate-pulse-ring {
          animation: scroll-pulse-ring 2.5s ease-in-out infinite;
        }
        .animate-bounce-float {
          animation: scroll-bounce-float 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Label */}
      <span className={`text-[9px] uppercase tracking-[0.3em] font-mono mb-2.5 transition-colors duration-300 ${isDark ? 'text-zinc-500 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-600'
        }`}>
        EXPLORE
      </span>

      {/* 3D Glass Floating Disc */}
      <div
        className="relative flex items-center justify-center"
        style={{ perspective: '800px' }}
      >
        {/* Ambient Ring Pulse Behind */}
        <div className={`absolute w-14 h-14 rounded-full border animate-pulse-ring pointer-events-none ${isDark ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-cyan-500/30 bg-cyan-500/5'
          }`} />

        {/* 3D Tilting Disc */}
        <div
          className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 animate-bounce-float relative ${isDark
            ? 'bg-black/60 border-cyan-400/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]'
            : 'bg-white/80 border-slate-300 group-hover:border-cyan-500 group-hover:bg-cyan-50 group-hover:shadow-[0_4px_20px_rgba(34,211,238,0.3)] shadow-sm'
            }`}
          style={{
            backdropFilter: 'blur(12px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Arrow */}
          <div className="flex flex-col items-center justify-center">
            <svg
              className={`w-4 h-4 transition-colors ${isDark ? 'stroke-cyan-300 group-hover:stroke-white' : 'stroke-slate-700 group-hover:stroke-cyan-600'}`}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [greeting, setGreeting] = useState('')
  const [time, setTime] = useState(new Date())
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }, 8000)
    return () => clearInterval(quoteTimer)
  }, [])

  // ─── DATA ─────────────────────────────────────────────────────────────────
  const { data: userProfile } = useApi('/auth/me')
  const { data: workouts } = useApi('/workouts')
  const { data: meals } = useApi('/meals')
  const { data: progressLogs } = useApi('/progress')
  const { data: waterLogs } = useApi('/water')

  const rawToken = localStorage.getItem('token')
  const authToken = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null
  const isDemoSession = authToken === 'demo-token-skip-auth'
  const shouldUseLocalFallback = !authToken || isDemoSession

  const user = useMemo(() => {
    if (userProfile) return userProfile
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }, [userProfile])

  const profileAvatar = useMemo(() => {
    const localProfile = shouldUseLocalFallback ? (() => { try { return JSON.parse(localStorage.getItem('userProfile') || '{}') } catch { return {} } })() : {}
    const fromData = user?.profileData?.avatar || user?.profileData?.photoUrl || user?.profileData?.image || user?.avatar || user?.avatarUrl || user?.photoUrl || user?.picture || localProfile?.avatar || localProfile?.photoUrl || localProfile?.image
    if (typeof fromData === 'string' && fromData.trim()) return fromData.trim()
    const nameSeed = encodeURIComponent(user?.name || 'User')
    return `https://ui-avatars.com/api/?name=${nameSeed}&background=0C0C0C&color=D7E2EA&size=128`
  }, [shouldUseLocalFallback, user])

  const localUserProfile = useMemo(() => { try { const parsed = JSON.parse(localStorage.getItem('userProfile') || '{}'); return parsed && typeof parsed === 'object' ? parsed : {} } catch { return {} } }, [])
  const calorieData = useMemo(() => { try { const parsed = JSON.parse(localStorage.getItem('userCalorieData') || '{}'); return parsed && typeof parsed === 'object' ? parsed : {} } catch { return {} } }, [])

  const profile = useMemo(() => {
    const server = user?.profileData || {}
    if (!shouldUseLocalFallback) return server
    return { ...server, weight: server.weight ?? localUserProfile.currentWeight ?? localUserProfile.weight, height: server.height ?? localUserProfile.height, goalWeight: server.goalWeight ?? localUserProfile.goalWeight, activityLevel: server.activityLevel ?? localUserProfile.activityLevel, fitnessGoal: server.fitnessGoal ?? localUserProfile.fitnessGoal }
  }, [user, localUserProfile, shouldUseLocalFallback])

  const todayStr = new Date().toISOString().split('T')[0]
  const apiWorkouts = useMemo(() => (Array.isArray(workouts) ? workouts : []), [workouts])
  const apiMeals = useMemo(() => (Array.isArray(meals) ? meals : []), [meals])
  const apiWaterLogs = useMemo(() => (Array.isArray(waterLogs) ? waterLogs : []), [waterLogs])
  const localTodayLog = useMemo(() => { try { const parsed = JSON.parse(localStorage.getItem('todayLog') || '[]'); return Array.isArray(parsed) ? parsed : [] } catch { return [] } }, [])
  const localWorkoutHistory = useMemo(() => { try { const parsed = JSON.parse(localStorage.getItem('workoutHistory') || '[]'); return Array.isArray(parsed) ? parsed : [] } catch { return [] } }, [])

  const localTodayWaterMl = useMemo(() => {
    if (!shouldUseLocalFallback) return 0
    const storedDate = toDayKey(localStorage.getItem('waterDate'))
    if (storedDate !== todayStr) return 0
    const localGlasses = Math.max(0, asNumber(localStorage.getItem('waterIntake')))
    return localGlasses * 250
  }, [shouldUseLocalFallback, todayStr])

  const todayWaterRecord = useMemo(() => apiWaterLogs.find((entry) => toDayKey(entry?.date || entry?.createdAt) === todayStr) || null, [apiWaterLogs, todayStr])
  const todayWaterMl = useMemo(() => shouldUseLocalFallback ? localTodayWaterMl : Math.max(0, asNumber(todayWaterRecord?.amount)), [shouldUseLocalFallback, localTodayWaterMl, todayWaterRecord])
  const waterGoalMl = useMemo(() => shouldUseLocalFallback ? 2000 : Math.max(1, asNumber(todayWaterRecord?.goal, 2000)), [shouldUseLocalFallback, todayWaterRecord])

  const sourceWorkouts = useMemo(() => {
    const normalizedLocal = localWorkoutHistory.map((w) => ({ ...w, createdAt: w.createdAt || (w.id ? new Date(w.id).toISOString() : undefined), volume: asNumber(w.volume), calories: asNumber(w.calories), completedSets: asNumber(w.completedSets), exercises: asNumber(w.exercises) }))
    const merged = shouldUseLocalFallback ? [...apiWorkouts, ...normalizedLocal] : [...apiWorkouts]
    const seen = new Set()
    return merged.filter((w) => { const k = `${w._id || w.id || ''}|${toDayKey(w.date || w.createdAt) || ''}|${asNumber(w.volume)}|${asNumber(w.calories)}`; if (seen.has(k)) return false; seen.add(k); return true })
  }, [apiWorkouts, localWorkoutHistory, shouldUseLocalFallback])

  const todayMeals = useMemo(() => {
    if (!shouldUseLocalFallback) return apiMeals.filter(m => toDayKey(m?.date || m?.createdAt) === todayStr)
    const apiToday = apiMeals.filter(m => toDayKey(m?.date || m?.createdAt) === todayStr)
    if (apiToday.length > 0) return apiToday
    return localTodayLog.map((m) => ({ ...m, date: todayStr, calories: Number(m.calories) || 0, protein: Number(m.protein) || 0 }))
  }, [apiMeals, localTodayLog, todayStr, shouldUseLocalFallback])

  const todayCalories = useMemo(() => todayMeals.reduce((s, m) => s + (m.calories || 0), 0), [todayMeals])
  const todayProtein = useMemo(() => todayMeals.reduce((s, m) => s + (m.protein || 0), 0), [todayMeals])
  const calorieGoal = parseInt(shouldUseLocalFallback ? (profile.calorieGoal || calorieData.goalCalories || calorieData.maintenanceCalories) : profile.calorieGoal) || 2500
  const proteinGoal = parseInt(shouldUseLocalFallback ? (profile.proteinGoal || calorieData.protein) : profile.proteinGoal) || Math.round((parseFloat(profile.weight) || 70) * 2.2)

  const workoutDaySet = useMemo(() => { const keys = sourceWorkouts.map((w) => toDayKey(w.date || w.createdAt)).filter(Boolean); return new Set(keys) }, [sourceWorkouts])
  const streak = useMemo(() => {
    if (workoutDaySet.size === 0) return 0
    let s = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) { const d = new Date(today); d.setDate(today.getDate() - i); const ds = d.toISOString().split('T')[0]; if (workoutDaySet.has(ds)) { s += 1 } else { break } }
    return s
  }, [workoutDaySet])
  const totalVolume = useMemo(() => sourceWorkouts.reduce((s, w) => s + asNumber(w.volume), 0), [sourceWorkouts])

  const calorieHistory = useMemo(() => {
    const apiCalsByDay = apiMeals.reduce((acc, m) => { const key = toDayKey(m?.date || m?.createdAt); if (!key) return acc; acc[key] = (acc[key] || 0) + (Number(m.calories) || 0); return acc }, {})
    const localTodayCalories = shouldUseLocalFallback ? localTodayLog.reduce((sum, m) => sum + (Number(m.calories) || 0), 0) : 0
    const result = []
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0]; const hasApiToday = Boolean(apiCalsByDay[ds]); const cal = hasApiToday ? apiCalsByDay[ds] : shouldUseLocalFallback && ds === todayStr ? localTodayCalories : 0; result.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), calories: cal }) }
    return result
  }, [apiMeals, localTodayLog, todayStr, shouldUseLocalFallback])

  const calorieHistoryAvg = useMemo(() => { if (!calorieHistory.length) return 0; const total = calorieHistory.reduce((sum, day) => sum + asNumber(day.calories), 0); return Math.round(total / calorieHistory.length) }, [calorieHistory])
  const calorieChartDomain = useMemo(() => { if (!calorieHistory.length) return [0, 2400]; const values = calorieHistory.map((d) => asNumber(d.calories, 0)); const min = Math.max(0, Math.min(...values) - 120); const max = Math.max(400, Math.max(...values) + 120); return [min, max] }, [calorieHistory])

  const profileWeight = useMemo(() => toFiniteOrNull(profile.weight), [profile.weight])

  const weightTrend = useMemo(() => {
    if (!progressLogs?.length) { if (!Number.isFinite(profileWeight)) return []; return [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: profileWeight }] }
    const normalized = [...progressLogs].filter(e => e.weight).map((e) => { const dayKey = toDayKey(e.date || e.createdAt); if (!dayKey) return null; const dateObj = new Date(`${dayKey}T00:00:00`); return { dayKey, date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: toFiniteOrNull(e.weight) } }).filter((e) => e && Number.isFinite(e.weight)).sort((a, b) => new Date(`${a.dayKey}T00:00:00`) - new Date(`${b.dayKey}T00:00:00`))
    const byDay = new Map(normalized.map((p) => [p.dayKey, p]))
    if (Number.isFinite(profileWeight)) { const todayKey = new Date().toISOString().split('T')[0]; byDay.set(todayKey, { dayKey: todayKey, date: new Date(`${todayKey}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: profileWeight }) }
    const mergedPoints = [...byDay.values()].sort((a, b) => new Date(`${a.dayKey}T00:00:00`) - new Date(`${b.dayKey}T00:00:00`)).slice(-8).map(({ date, weight }) => ({ date, weight }))
    if (mergedPoints.length > 0) return mergedPoints
    if (!Number.isFinite(profileWeight)) return []
    return [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: profileWeight }]
  }, [progressLogs, profileWeight])

  const latestWeight = useMemo(() => {
    if (Number.isFinite(profileWeight)) return profileWeight
    const normalized = (progressLogs || []).map((e) => ({ dayKey: toDayKey(e.date || e.createdAt), weight: toFiniteOrNull(e.weight) })).filter((e) => e.dayKey && Number.isFinite(e.weight)).sort((a, b) => new Date(`${b.dayKey}T00:00:00`) - new Date(`${a.dayKey}T00:00:00`))
    return normalized[0]?.weight ?? null
  }, [progressLogs, profileWeight])

  const dashboardWeightDomain = useMemo(() => {
    if (!weightTrend.length) return ['auto', 'auto']
    const values = weightTrend.map((p) => Number(p.weight)).filter((v) => Number.isFinite(v))
    if (!values.length) return ['auto', 'auto']
    const min = Math.min(...values); const max = Math.max(...values); const spread = Math.max(0.5, max - min); const pad = Math.max(0.2, spread * 0.35); return [Number((min - pad).toFixed(1)), Number((max + pad).toFixed(1))]
  }, [weightTrend])

  const recentWorkouts = useMemo(() => {
    return [...sourceWorkouts].sort((a, b) => { const aKey = toDayKey(a.date || a.createdAt); const bKey = toDayKey(b.date || b.createdAt); const aTs = aKey ? new Date(`${aKey}T00:00:00`).getTime() : 0; const bTs = bKey ? new Date(`${bKey}T00:00:00`).getTime() : 0; if (aTs !== bTs) return bTs - aTs; const aRaw = new Date(a.createdAt || 0).getTime() || 0; const bRaw = new Date(b.createdAt || 0).getTime() || 0; return bRaw - aRaw }).filter((w) => toDayKey(w.date || w.createdAt)).slice(0, 3)
  }, [sourceWorkouts])

  const weekSummary = useMemo(() => {
    if (!sourceWorkouts.length) return { sessions: 0, volume: 0, calories: 0 }
    const weekDays = new Set(Array.from({ length: 7 }).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0] }))
    const recent = sourceWorkouts.filter((w) => { const dayKey = toDayKey(w.date || w.createdAt); return dayKey && weekDays.has(dayKey) })
    return { sessions: recent.length, volume: recent.reduce((s, w) => s + asNumber(w.volume), 0), calories: recent.reduce((s, w) => s + asNumber(w.calories), 0) }
  }, [sourceWorkouts])

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }

  const caloriePct = safePercent(todayCalories, calorieGoal)
  const proteinPct = safePercent(todayProtein, proteinGoal)
  const waterPct = safePercent(todayWaterMl, waterGoalMl)


  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full transition-colors duration-300"
      style={{ background: isDark ? '#0C0C0C' : '#F8FAFC', color: isDark ? '#D7E2EA' : '#0F172A', fontFamily: "'Kanit', sans-serif", overflowX: 'clip' }}
    >

      {/* ─── HERO SECTION WITH INTEGRATED FLOATING NAVBAR & UNCLIPPED 3D VORTEX ───── */}
      <section className="h-screen min-h-[650px] flex flex-col justify-between relative overflow-x-clip pb-6">
        {/* Ambient 3D Cosmic Vortex (Flowing seamlessly behind the top navbar) */}
        <div className="absolute top-[-120px] sm:top-[-150px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-90">
          <CosmicVortex />
        </div>

        {/* ─── FULL-WIDTH TRANSPARENT NAVBAR (Nav links centered in the middle) ───────────────── */}
        <FadeIn delay={0} y={-20} className="relative z-30 pt-3 sm:pt-4 px-6 md:px-10">
          <nav className="flex items-center justify-between pointer-events-auto w-full relative">
            {/* Far Left: Brand Logo */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <Flame size={18} className={isDark ? 'text-red-500' : 'text-red-600'} />
              <span className={`text-[13px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`}>FitTrack</span>
            </motion.div>

            {/* Exact Horizontal Center: Nav Links */}
            <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>

            {/* Far Right: Action Buttons (Borderless & Ultra Aesthetic Volcanic Red) */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all select-none ${isDark
                    ? 'bg-white/5 hover:bg-white/10 text-amber-400'
                    : 'bg-slate-200/60 hover:bg-slate-200 text-indigo-600'
                  }`}
              >
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
                <span className="hidden sm:inline text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
              </motion.button>

              {/* AI Trainer Button (Volcanic Red) */}
              <motion.button
                onClick={() => navigate('/ai')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all select-none ${isDark
                    ? 'bg-gradient-to-r from-red-600/25 via-orange-600/25 to-red-600/25 text-red-300 hover:from-red-600/40 hover:to-orange-600/40 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
                  }`}
              >
                <Brain size={14} className={isDark ? 'text-red-400 animate-pulse' : 'text-white'} />
                <span>AI Trainer</span>
              </motion.button>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
                className={`px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all select-none ${isDark
                    ? 'bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400'
                    : 'bg-slate-200/60 hover:bg-red-50 text-slate-600 hover:text-red-600'
                  }`}
              >
                <LogOut size={13} />
                <span className="hidden sm:inline text-[11px]">Logout</span>
              </motion.button>
            </div>
          </nav>
        </FadeIn>

        {/* Greeting */}
        <FadeIn delay={0.3} y={20} className="relative z-20 mt-2">
          <div className="px-6 md:px-10">
            <p className={`text-[10px] uppercase tracking-[0.3em] font-medium ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{greeting} &mdash; {time.toLocaleTimeString('en-US', { hour12: false })}</p>
          </div>
        </FadeIn>

        {/* Hero Content Container (Layered above the background ring) */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 z-20 my-auto relative">
          <div className="max-w-3xl space-y-4">
            <FadeIn delay={0.15} y={40}>
              <h1 className={`hero-heading font-black uppercase tracking-tight leading-[0.95] ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`} style={{ fontSize: 'clamp(2.75rem, 6.5vw, 92px)' }}>
                Dashboard
              </h1>
            </FadeIn>
            <FadeIn delay={0.35} y={20}>
              <p className={`font-light uppercase tracking-wide leading-snug max-w-sm ${isDark ? 'text-[#D7E2EA]' : 'text-slate-600'}`} style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1.1rem)' }}>
                a fitness tracker driven by training, nutrition, and progress data
              </p>
            </FadeIn>
            <FadeIn delay={0.5} y={20}>
              <motion.button
                onClick={() => navigate('/workout-plan')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-7 py-3 sm:px-8 sm:py-3.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] rounded-full flex items-center gap-2.5 transition-all duration-300 backdrop-blur-md select-none ${isDark
                    ? 'bg-red-500/15 hover:bg-red-500/30 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                  }`}
              >
                <Zap size={15} className={isDark ? 'fill-red-500 text-red-500' : 'fill-white text-white'} />
                <span>Start Workout</span>
              </motion.button>
            </FadeIn>
          </div>
        </div>

        {/* 3D Animated Scroll Down Indicator */}
        <ScrollDownIndicator isDark={isDark} />
      </section>


      {/* ─── STATS SECTION (numbered list style) ──────────────────────── */}
      <section className="px-5 sm:px-8 md:px-10 py-16 sm:py-20">
        <FadeIn delay={0} y={40}>
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center" style={{ fontSize: 'clamp(2rem, 8vw, 100px)' }}>
            Today&apos;s Stats
          </h2>
        </FadeIn>

        <div className="max-w-3xl mx-auto mt-10 sm:mt-14 md:mt-16">
          <SectionCard
            number="01"
            title="Streak"
            description={`${streak} consecutive days of training. ${streak === 0 ? 'Start today to build your first streak.' : `Keep going — you're on a ${streak}-day roll!`}`}
            icon={Flame}
            onClick={() => navigate('/progress')}
            delay={0.1}
          />
          <SectionCard
            number="02"
            title="Calories"
            description={`${todayCalories} kcal consumed today out of ${calorieGoal} kcal goal. ${caloriePct}% of your daily target reached.`}
            icon={Heart}
            onClick={() => navigate('/diet')}
            delay={0.2}
          />
          <SectionCard
            number="03"
            title="Protein"
            description={`${todayProtein}g protein logged today. Goal is ${proteinGoal}g — you're at ${proteinPct}% of your target.`}
            icon={Dumbbell}
            onClick={() => navigate('/diet')}
            delay={0.3}
          />
          <SectionCard
            number="04"
            title="Volume"
            description={`${totalVolume}kg total lifetime volume lifted across ${sourceWorkouts.length} sessions. ${weekSummary.volume}kg this week alone.`}
            icon={Activity}
            onClick={() => navigate('/progress')}
            delay={0.4}
          />
          <SectionCard
            number="05"
            title="Water"
            description={`${todayWaterMl}ml water consumed today. Target is ${waterGoalMl}ml — ${waterPct}% of your hydration goal complete.`}
            icon={Droplet}
            onClick={() => navigate('/water')}
            delay={0.5}
          />
        </div>
      </section>


      {/* ─── QUICK ACCESS SECTION (white bg from reference) ───────────── */}
      <section
        className="px-5 sm:px-8 md:px-10 py-16 sm:py-20 md:py-24 transition-colors duration-300"
        style={{ background: isDark ? '#141414' : '#FFFFFF', borderRadius: '40px 40px 0 0' }}
      >
        <FadeIn delay={0} y={40}>
          <h2 className={`font-black uppercase text-center ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`} style={{ fontSize: 'clamp(2rem, 8vw, 100px)' }}>
            Quick Access
          </h2>
        </FadeIn>

        <div className="max-w-4xl mx-auto mt-10 sm:mt-14 md:mt-16">
          {QUICK_LINKS.map((link, i) => (
            <SectionCard
              key={link.path}
              number={`0${i + 1}`}
              title={link.sub}
              description={link.label}
              icon={link.icon}
              onClick={() => navigate(link.path)}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>


      {/* ─── CHARTS SECTION (Single-page 3-card grid layout) ──────────────────── */}
      <section
        className="px-5 sm:px-8 md:px-10 py-16 sm:py-20 relative transition-colors duration-300"
        style={{ background: isDark ? '#0C0C0C' : '#F8FAFC' }}
      >
        <FadeIn delay={0} y={40}>
          <h2 className={`hero-heading font-black uppercase leading-none tracking-tight text-center ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`} style={{ fontSize: 'clamp(2rem, 6vw, 80px)' }}>
            Progress
          </h2>
        </FadeIn>

        {/* Single Page 3-Card Grid */}
        <div className="mt-10 sm:mt-14 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card 1: Weight Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-[30px] border p-6 sm:p-8 flex flex-col justify-between transition-all backdrop-blur-md ${isDark ? 'border-white/15 bg-transparent hover:border-red-500/50' : 'border-slate-200 bg-white/80 shadow-sm'
              }`}
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-red-500/40 font-black text-2xl">01</span>
                  <h3 className={`font-medium uppercase ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`} style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)' }}>Weight Trend</h3>
                </div>
                <motion.button
                  onClick={() => navigate('/progress')}
                  whileHover={{ scale: 1.03 }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-all ${isDark ? 'border-[#D7E2EA]/30 text-[#D7E2EA] hover:border-red-500' : 'border-slate-300 text-slate-700 hover:border-slate-500'
                    }`}
                >
                  Open
                </motion.button>
              </div>

              {weightTrend.length > 0 ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
                    <AreaChart data={weightTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightAreaV3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff1a1a" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#ff1a1a" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} domain={dashboardWeightDomain} />
                      <Tooltip content={<ChartTip />} />
                      <Area type="linear" dataKey="weight" stroke="#ff1a1a" fill="url(#weightAreaV3)" strokeWidth={2.5} dot={{ r: 3, fill: '#ff1a1a', stroke: '#0C0C0C', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#ff4d4d', stroke: '#0C0C0C', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm">No weight logs yet</div>
              )}
            </div>

            <p className="text-[#D7E2EA]/50 text-xs mt-4 font-mono">
              {latestWeight ? `Current: ${latestWeight}kg` : 'Log your weight to see the trend'}
            </p>
          </motion.div>

          {/* Card 2: Nutrition & Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`rounded-[30px] border p-6 sm:p-8 flex flex-col justify-between transition-all backdrop-blur-md ${isDark ? 'border-white/15 bg-transparent hover:border-emerald-400/50' : 'border-slate-200 bg-white/80 shadow-sm'
              }`}
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-emerald-400/40 font-black text-2xl">02</span>
                  <h3 className={`font-medium uppercase ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`} style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)' }}>Nutrition & Goals</h3>
                </div>
                <motion.button
                  onClick={() => navigate('/diet')}
                  whileHover={{ scale: 1.03 }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-all ${isDark ? 'border-[#D7E2EA]/30 text-[#D7E2EA] hover:border-emerald-400' : 'border-slate-300 text-slate-700 hover:border-slate-500'
                    }`}
                >
                  Open
                </motion.button>
              </div>

              {/* Calorie chart */}
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
                  <AreaChart data={calorieHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="calAreaV3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} domain={calorieChartDomain} />
                    <Tooltip content={<ChartTip />} />
                    <ReferenceLine y={calorieHistoryAvg} stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.5} ifOverflow="extendDomain" />
                    <Area type="monotone" dataKey="calories" stroke="#34d399" fill="url(#calAreaV3)" strokeWidth={2} dot={{ r: 2, fill: '#34d399' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Progress Rings Grid */}
              <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-white/5">
                <RingProgress pct={caloriePct} size={60} color="#BBCCD7" label="CAL" value={`${caloriePct}%`} />
                <RingProgress pct={proteinPct} size={60} color="#f59e0b" label="PRO" value={`${proteinPct}%`} />
                <RingProgress pct={waterPct} size={60} color="#22d3ee" label="WATER" value={`${waterPct}%`} />
                <RingProgress pct={Math.min(100, streak * 10)} size={60} color="#a78bfa" label="STREAK" value={`${streak}D`} />
              </div>
            </div>

            <p className="text-[#D7E2EA]/50 text-[10px] font-mono mt-4">
              7-day avg: {calorieHistoryAvg} kcal &bull; target: {calorieGoal} kcal
            </p>
          </motion.div>

          {/* Card 3: Recent Workouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`rounded-[30px] border p-6 sm:p-8 flex flex-col justify-between transition-all backdrop-blur-md ${isDark ? 'border-white/15 bg-transparent hover:border-amber-400/50' : 'border-slate-200 bg-white/80 shadow-sm'
              }`}
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-amber-400/30 font-black text-2xl">03</span>
                  <h3 className={`font-medium uppercase ${isDark ? 'text-[#D7E2EA]' : 'text-slate-900'}`} style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)' }}>Recent Workouts</h3>
                </div>
                <motion.button
                  onClick={() => navigate('/workout')}
                  whileHover={{ scale: 1.03 }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-all ${isDark ? 'border-[#D7E2EA]/30 text-[#D7E2EA] hover:border-amber-400' : 'border-slate-300 text-slate-700 hover:border-slate-500'
                    }`}
                >
                  View All
                </motion.button>
              </div>

              {recentWorkouts.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm">No workouts yet. Start one now.</div>
              ) : (
                <div className="space-y-2.5">
                  {recentWorkouts.slice(0, 3).map((w, i) => (
                    <motion.button
                      key={w._id || w.id || i}
                      onClick={() => navigate('/workout')}
                      whileHover={{ x: 4 }}
                      className="w-full text-left rounded-xl p-3 border border-[#D7E2EA]/10 bg-[#D7E2EA]/[0.03] hover:bg-[#D7E2EA]/[0.06] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#D7E2EA]">{w.createdAt || w.date ? new Date(w.createdAt || w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Session'}</p>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">{asNumber(w.volume)}kg</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{asNumber(w.calories)} kcal burned &bull; {w.exercises?.length || 0} exercises</p>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[#D7E2EA]/50 text-xs mt-4 font-mono">
              Total lifetime volume: {totalVolume}kg
            </p>
          </motion.div>

        </div>
      </section>

      {/* ─── QUOTE SECTION ────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 md:px-10 py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-[#D7E2EA] font-light italic text-center leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', opacity: 0.7 }}
            >
              &ldquo;{MOTIVATIONAL_QUOTES[quoteIdx]}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── BOTTOM MOBILE NAV BAR ─────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0C0C0C]/85 backdrop-blur-md border-t border-[#D7E2EA]/10 flex items-center justify-around z-50">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 text-[#D7E2EA]"
            >
              <item.icon size={18} className={isActive ? 'text-[#D7E2EA]' : 'text-zinc-500'} />
              <span className={`text-[9px] uppercase tracking-wider ${isActive ? 'text-[#D7E2EA] font-bold' : 'text-zinc-500'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Bottom padding */}
      <div className="h-20 md:h-8" />
    </div>
  )
}

export default Dashboard
