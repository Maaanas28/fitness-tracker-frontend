import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity, Dumbbell, ShieldCheck, Brain, ArrowUpRight,
  ChevronRight, Apple, Target, Droplet, AlarmClock
} from 'lucide-react'
import { isAuthenticated } from '../services/api'

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

// FadeIn component
const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, scale = 1, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x, y, scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Magnet component
const Magnet = ({ children, padding = 150, strength = 3, activeTransition = "transform 0.3s ease-out", inactiveTransition = "transform 0.6s ease-in-out" }) => {
  const ref = useRef(null)
  const [transform, setTransform] = useState("translate3d(0px, 0px, 0px)")
  const [transition, setTransition] = useState(inactiveTransition)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

    if (distance < padding) {
      setTransition(activeTransition)
      const tx = distanceX / strength
      const ty = distanceY / strength
      setTransform(`translate3d(${tx}px, ${ty}px, 0px)`)
    } else {
      setTransition(inactiveTransition)
      setTransform("translate3d(0px, 0px, 0px)")
    }
  }, [padding, strength, activeTransition, inactiveTransition])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <div
      ref={ref}
      style={{
        transform,
        transition,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  )
}

// CTA Button
const CTAButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        color: '#D7E2EA',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center gap-2">
        {label}
        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
      </span>
    </button>
  )
}

// Ghost Button
const GhostButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border-2 border-[#D7E2EA] hover:bg-[#D7E2EA]/10 text-[#D7E2EA] transition-all duration-300"
    >
      {label}
    </button>
  )
}

// Character Reveal Scroll Text
const AnimatedText = ({ text }) => {
  const containerRef = useRef(null)
  const [revealProgress, setRevealProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const triggerTop = windowHeight * 0.8
      const triggerBottom = windowHeight * 0.2
      const progress = (triggerTop - rect.top) / (triggerTop - triggerBottom)
      setRevealProgress(Math.max(0, Math.min(1, progress)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const words = text.split(" ")
  const revealCount = Math.floor(words.length * revealProgress)

  return (
    <p ref={containerRef} className="text-zinc-400 text-lg sm:text-xl md:text-2xl lg:text-3xl font-light leading-relaxed max-w-4xl tracking-wide select-none">
      {words.map((word, i) => {
        const isRevealed = i <= revealCount
        return (
          <span
            key={i}
            className="inline-block mr-2 transition-colors duration-300"
            style={{ color: isRevealed ? '#D7E2EA' : 'rgba(161,161,170,0.18)' }}
          >
            {word}
          </span>
        )
      })}
    </p>
  )
}

// Custom Cursor Overlay
const CustomCursor = () => {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return
    const isDesktop = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches
    if (!isDesktop) {
      cursor.style.display = 'none'
      return
    }

    const onMouseMove = (e) => {
      cursor.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[100]"
      style={{ willChange: 'transform', transform: 'translate(-100px, -100px)' }}
    >
      <div className="w-full h-full bg-white rounded-full opacity-40 blur-[1px]" />
    </div>
  )
}

// Noise Texture
const NoiseTexture = memo(() => (
  <div
    className="fixed inset-0 z-50 pointer-events-none opacity-[0.025]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      backgroundSize: '128px 128px',
    }}
  />
))
NoiseTexture.displayName = 'NoiseTexture'

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

// 1. HeroSection
const HeroSection = ({ onNavigate }) => {
  return (
    <section className="relative h-screen flex flex-col justify-between overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-cyan-900/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-blue-950/15 blur-[160px] rounded-full" />
      </div>

      {/* Navbar */}
      <FadeIn delay={0} y={-20}>
        <nav className="w-full px-6 md:px-10 pt-6 md:pt-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-black tracking-[0.25em] text-[#D7E2EA]">FITTRACK AI</span>
          </div>
          <div className="flex items-center gap-6 md:gap-12">
            {['Dashboard', 'Workouts', 'AI Analysis'].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item === 'Dashboard' ? '/dashboard' : item === 'Workouts' ? '/workout' : '/ai')}
                className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#D7E2EA] hover:opacity-70 transition-opacity duration-200"
              >
                {item}
              </button>
            ))}
            {isAuthenticated() ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 rounded-full hover:bg-cyan-500/20 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 border border-[#D7E2EA]/20 rounded-full hover:bg-white/5 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      </FadeIn>

      {/* Hero Layout Content */}
      <div className="relative z-10 flex-1 grid lg:grid-cols-[1.2fr,0.8fr] items-center gap-10 px-6 md:px-10">
        {/* Left Side */}
        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#D7E2EA]/12 bg-white/5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[9px] tracking-[0.22em] font-black text-cyan-300 uppercase">BRUTAL MODE ENABLED</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} y={40}>
            <h1 className="hero-heading text-[7.5vw] sm:text-[6.5vw] lg:text-[5.2vw] font-black uppercase leading-[0.9] tracking-tight">
              Train Smarter<br />With AI.
            </h1>
          </FadeIn>
        </div>

        {/* Right Side: Mockup Visual */}
        <FadeIn delay={0.6} y={30} className="flex justify-center">
          <Magnet padding={150} strength={3}>
            <div
              className="w-[280px] h-[340px] sm:w-[320px] sm:h-[390px] p-6 rounded-[32px] border flex flex-col justify-between select-none relative overflow-hidden"
              style={{
                background: 'rgba(10,10,10,0.6)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
              }}
            >
              <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">BIOMETRICS FEED</span>
                </div>
                <Activity size={14} className="text-cyan-400" />
              </div>

              <div className="flex-1 flex flex-col justify-center items-center py-4">
                <p className="text-[10px] text-zinc-450 uppercase tracking-[0.2em] mb-1 font-mono">Real-Time Pulse</p>
                <div className="text-5xl font-black text-white flex items-end tracking-tighter">
                  78 <span className="text-xs font-mono text-zinc-500 ml-1 pb-1">BPM</span>
                </div>
                <div className="w-full h-12 mt-4 opacity-40">
                  <svg viewBox="0 0 100 30" className="w-full h-full stroke-cyan-400 fill-none" strokeWidth="1.5">
                    <path d="M0,15 L30,15 L35,8 L40,22 L45,15 L100,15" />
                  </svg>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 pt-3 border-t border-white/5 font-mono">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase">Streak</p>
                  <p className="text-sm font-black text-[#D7E2EA]">5 Days</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 uppercase">Load score</p>
                  <p className="text-sm font-black text-cyan-400">92%</p>
                </div>
              </div>
            </div>
          </Magnet>
        </FadeIn>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 flex justify-between items-end z-10 w-full">
        <FadeIn delay={0.35} y={20}>
          <p className="text-[#D7E2EA] font-light uppercase tracking-widest leading-relaxed max-w-[260px] sm:max-w-[340px]" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 1.2rem)' }}>
            AI-powered form analysis, workout tracking, and 2FA-secured progress, all in one dashboard.
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <CTAButton label="Get Started" onClick={() => onNavigate('/login', { state: { fromLanding: true } })} />
        </FadeIn>
      </div>
    </section>
  )
}

// 2. StatsMarqueeSection
const StatsMarqueeSection = () => {
  const sectionRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      if (rect.top < windowHeight && rect.bottom > 0) {
        setScrollProgress((windowHeight - rect.top) / (windowHeight + rect.height))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const row1Items = [
    "10,000+ Reps Tracked", "AI Form Score: 94%", "2FA Secured Accounts",
    "Real-Time Body Analysis", "Custom Workout Plans", "Progress Streaks"
  ]

  const row2Items = [
    "Groq Vision Insights", "Weekly Leaderboards", "Calorie Tracking",
    "Rest Timer Alerts", "Real-Time Biometrics", "Milestone Celebrations"
  ]

  const row1X = (scrollProgress * 250) - 100
  const row2X = (scrollProgress * -250) + 100

  return (
    <section ref={sectionRef} className="py-24 bg-black overflow-hidden relative">
      <div className="space-y-6">
        {/* Row 1 */}
        <div
          className="flex whitespace-nowrap gap-4 transition-transform duration-75 ease-out"
          style={{ transform: `translate3d(${row1X}px, 0px, 0px)`, willChange: 'transform' }}
        >
          {[...row1Items, ...row1Items, ...row1Items].map((text, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-3 px-8 py-6 rounded-2xl border text-sm font-semibold uppercase tracking-widest text-[#D7E2EA] select-none"
              style={{
                width: '320px',
                background: 'rgba(10,10,10,0.5)',
                borderColor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              {text}
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div
          className="flex whitespace-nowrap gap-4 transition-transform duration-75 ease-out"
          style={{ transform: `translate3d(${row2X}px, 0px, 0px)`, willChange: 'transform' }}
        >
          {[...row2Items, ...row2Items, ...row2Items].map((text, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-3 px-8 py-6 rounded-2xl border text-sm font-semibold uppercase tracking-widest text-[#D7E2EA] select-none"
              style={{
                width: '320px',
                background: 'rgba(10,10,10,0.5)',
                borderColor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



// 4. FeaturesSection
const FeaturesSection = () => {
  const features = [
    {
      num: '01',
      title: 'AI Form Analysis',
      desc: 'Groq Vision-powered posture and rep-form scoring from your workout video or webcam feed.'
    },
    {
      num: '02',
      title: '2FA Account Security',
      desc: 'Speakeasy-based two-factor authentication keeps your training data locked down.'
    },
    {
      num: '03',
      title: 'Custom Workout Plans',
      desc: 'Adaptive plans that adjust to your logged progress and recovery stats.'
    },
    {
      num: '04',
      title: 'Progress Dashboard',
      desc: 'Charted history of reps, weight, and streaks with celebratory confetti on milestones.'
    },
    {
      num: '05',
      title: 'Smart Rest Timers',
      desc: 'Context-aware rest suggestions based on previous exercise set intensity.'
    }
  ]

  return (
    <section className="bg-white text-zinc-950 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-6 md:px-10 py-24 md:py-32 relative z-20">
      <div className="max-w-6xl mx-auto space-y-20">
        <FadeIn>
          <h2 className="text-center font-black uppercase text-zinc-950 tracking-tighter" style={{ fontSize: 'clamp(2.5rem, 8vw, 110px)', leading: '1' }}>
            Features
          </h2>
        </FadeIn>

        <div className="divide-y divide-zinc-200">
          {features.map((f, i) => (
            <div key={i} className="py-8 md:py-12 grid md:grid-cols-[100px,1fr] gap-6 md:gap-12 items-start">
              <FadeIn delay={i * 0.1}>
                <span className="text-xl md:text-2xl font-mono font-black text-zinc-300">{f.num}</span>
              </FadeIn>
              <div className="space-y-2">
                <FadeIn delay={i * 0.1 + 0.05}>
                  <h3 className="text-lg md:text-2xl font-bold uppercase tracking-tight text-zinc-900">{f.title}</h3>
                </FadeIn>
                <FadeIn delay={i * 0.1 + 0.1}>
                  <p className="text-zinc-650 text-sm md:text-base leading-relaxed max-w-3xl">{f.desc}</p>
                </FadeIn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// 5. ProgressShowcaseSection
const ProgressShowcaseSection = ({ onNavigate }) => {
  const cardData = [
    {
      label: 'STATS RECAP',
      title: 'This Week',
      num: '01',
      desc: 'Monitor weekly totals, average caloric burn rates, volumes lifted, and active session streak statistics.',
      renderGrid: () => (
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="rounded-2xl p-4 border border-white/5 bg-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 font-mono">STREAK</span>
            <span className="text-2xl font-black text-cyan-400">5d</span>
          </div>
          <div className="rounded-2xl p-4 border border-white/5 bg-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 font-mono">VOLUME</span>
            <span className="text-2xl font-black text-white">4.8k kg</span>
          </div>
          <div className="rounded-2xl p-4 border border-white/5 bg-white/5 flex flex-col justify-between col-span-2">
            <span className="text-[10px] text-zinc-400 font-mono">CALORIES BURNED</span>
            <span className="text-2xl font-black text-zinc-200">1,820 kcal</span>
          </div>
        </div>
      )
    },
    {
      label: 'BIOMECHANICS',
      title: 'AI Insights',
      num: '02',
      desc: 'Form correction insights captured from webcam and video upload analysis.',
      renderGrid: () => (
        <div className="grid grid-cols-1 gap-3 h-full">
          <div className="rounded-2xl p-3 border border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-xs text-zinc-200">Hip Alignment (Squats)</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">96%</span>
          </div>
          <div className="rounded-2xl p-3 border border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-xs text-zinc-200">Elbow Flare (Bench Press)</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">82%</span>
          </div>
          <div className="rounded-2xl p-3 border border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs text-zinc-200">Spine Rounding (Deadlift)</span>
            </div>
            <span className="text-xs font-mono font-bold text-red-400">65%</span>
          </div>
        </div>
      )
    },
    {
      label: 'ACHIEVEMENTS',
      title: 'Milestones',
      num: '03',
      desc: 'Unlock training trophies and celebrate personal records with visual milestones.',
      renderGrid: () => (
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="rounded-2xl p-4 border border-white/5 bg-white/5 text-center flex flex-col justify-center items-center">
            <Target size={24} className="text-cyan-400 mb-1" />
            <span className="text-[10px] text-zinc-400 font-mono block">STREAK PR</span>
            <span className="text-lg font-black text-white">12 Days</span>
          </div>
          <div className="rounded-2xl p-4 border border-white/5 bg-white/5 text-center flex flex-col justify-center items-center">
            <Dumbbell size={24} className="text-blue-400 mb-1" />
            <span className="text-[10px] text-zinc-400 font-mono block">BENCH PRESS</span>
            <span className="text-lg font-black text-white">100 kg</span>
          </div>
          <div className="rounded-2xl p-4 border border-white/5 bg-white/5 text-center flex flex-col justify-center items-center col-span-2">
            <Apple size={24} className="text-emerald-400 mb-1" />
            <span className="text-[10px] text-zinc-400 font-mono block">HEALTHY DIET MONTH</span>
            <span className="text-sm font-bold text-zinc-200">100% Target Met</span>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="bg-black rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-12 sm:-mt-14 relative z-30 px-6 md:px-10 py-24 md:py-32">
      <div className="max-w-6xl mx-auto space-y-16">
        <FadeIn>
          <h2 className="hero-heading uppercase font-black" style={{ fontSize: 'clamp(2.5rem, 8vw, 110px)', leading: '1' }}>
            Your Progress
          </h2>
        </FadeIn>

        {/* Stacking Cards */}
        <div className="space-y-24">
          {cardData.map((card, i) => {
            const scale = 1 - (cardData.length - 1 - i) * 0.03
            const topOffset = i * 32

            return (
              <div
                key={i}
                className="sticky rounded-[40px] md:rounded-[60px] border-2 border-[#D7E2EA]/12 bg-[#080808] p-6 md:p-10 select-none overflow-hidden"
                style={{
                  top: `${100 + topOffset}px`,
                  transform: `scale(${scale})`,
                  willChange: 'transform',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
                }}
              >
                <div className="grid md:grid-cols-[1fr,1fr] gap-8 items-stretch h-full">
                  {/* Left Side: Stats and Info */}
                  <div className="flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-mono font-bold text-zinc-500">{card.num}</span>
                        <span className="w-1.5 h-1.5 bg-[#D7E2EA]/40 rounded-full" />
                        <span className="text-xs uppercase tracking-wider text-[#D7E2EA]/60 font-semibold">{card.label}</span>
                      </div>
                      <h3 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase text-[#D7E2EA] mb-4">
                        {card.title}
                      </h3>
                      <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                        {card.desc}
                      </p>
                    </div>

                    <div className="pt-4">
                      <GhostButton label="View Details" onClick={() => onNavigate('/progress')} />
                    </div>
                  </div>

                  {/* Right Side: Graphic Rendering */}
                  <div className="border border-white/5 bg-black/40 rounded-3xl p-6 flex flex-col justify-between">
                    {card.renderGrid()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate()

  const handleNavigation = useCallback((path, options) => {
    // If user is not logged in, auto-seed demo token so all features work directly from landing
    if (!localStorage.getItem('token') || localStorage.getItem('token') === 'null') {
      localStorage.setItem('token', 'demo-token-skip-auth')
      localStorage.setItem('user', JSON.stringify({
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@fittracker.app',
        profileData: {}
      }))
    }
    const targetPath = path === '/login' ? '/dashboard' : path
    navigate(targetPath, options)
  }, [navigate])


  return (
    <div className="bg-black text-white min-h-screen selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden relative">
      <CustomCursor />
      <NoiseTexture />

      {/* Sections rendering */}
      <HeroSection onNavigate={handleNavigation} />
      <StatsMarqueeSection />
      <FeaturesSection />
      <ProgressShowcaseSection onNavigate={handleNavigation} />

      {/* Footer */}
      <footer className="border-t border-[#D7E2EA]/12 py-12 md:py-16 px-6 md:px-10 flex flex-col md:flex-row justify-between items-end bg-[#050505] relative z-40">
        <div className="space-y-2">
          <h1 className="text-[8vw] leading-none font-black text-zinc-900 select-none tracking-tighter">AI.FIT</h1>
          <p className="text-xs text-zinc-500 font-mono">© 2026 FitTrack AI. All rights reserved.</p>
        </div>
        <div className="flex gap-6 text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 mt-6 md:mt-0">
          {['Instagram', 'Twitter', 'Support'].map((item) => (
            <a key={item} href="#" className="hover:text-cyan-400 transition-colors">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
