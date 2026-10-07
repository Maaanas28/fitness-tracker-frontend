import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Lock, User, Zap, AlertTriangle, ChevronLeft, Loader2, Shield } from 'lucide-react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { login, signup, clearUserData, isAuthenticated } from '../services/api'
import toast from 'react-hot-toast'

// ─── 1. THE STRETCHING STARFIELD BACKGROUND ──────────────────────────────────
const WarpBackground = ({ warpState }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let lastTime = 0
    const fps = 30
    const interval = 1000 / fps
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const stars = Array.from({ length: 400 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2,
      size: Math.random() * 1.5
    }))

    const render = (currentTime) => {
      if (currentTime - lastTime >= interval) {
        ctx.fillStyle = 'rgba(11, 15, 20, 0.2)' // Slate background trace
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const cx = canvas.width / 2
        const cy = canvas.height / 2

        let speed = 0.15
        if (warpState === 'forward') speed = 40
        if (warpState === 'reverse') speed = -20

        stars.forEach(star => {
          const dx = (star.x - cx) / canvas.width
          const dy = (star.y - cy) / canvas.height
          
          star.x += dx * speed * star.z
          star.y += dy * speed * star.z
          
          if (warpState !== 'reverse') {
            if (star.x < 0 || star.x > canvas.width || star.y < 0 || star.y > canvas.height) {
              star.x = cx + (Math.random() - 0.5) * 20
              star.y = cy + (Math.random() - 0.5) * 20
              if (warpState === 'idle') {
                star.x = Math.random() * canvas.width
                star.y = Math.random() * canvas.height
              }
            }
          } else {
            const dist = Math.sqrt((star.x - cx)**2 + (star.y - cy)**2)
            if (dist < 5) {
              star.x = Math.random() * canvas.width
              star.y = Math.random() * canvas.height
              if (Math.random() > 0.5) star.x = star.x > cx ? canvas.width : 0
              else star.y = star.y > cy ? canvas.height : 0
            }
          }

          const size = (warpState !== 'idle') ? star.size * 2.5 : star.size
          let color = `rgba(165, 243, 252, ${Math.random() * 0.4})` // Cyan stars
          
          if (warpState === 'forward') color = `rgba(34, 211, 238, 0.7)`
          if (warpState === 'reverse') color = `rgba(59, 130, 246, 0.7)`

          ctx.beginPath()
          if (warpState !== 'idle') {
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(star.x - (dx * 20), star.y - (dy * 20))
            ctx.strokeStyle = color
            ctx.lineWidth = size
            ctx.stroke()
          } else {
            ctx.fillStyle = color
            ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
            ctx.fill()
          }
        })

        lastTime = currentTime
      }
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [warpState])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

// ─── 2. HACKER TEXT ──────────────────────────────────────────────────────────
const HackerText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"

  const scramble = () => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((l, i) => {
        if (i < iteration) return text[i]
        return chars[Math.floor(Math.random() * chars.length)]
      }).join(""))
      if (iteration >= text.length) clearInterval(interval)
      iteration += 1 / 3
    }, 25)
  }

  return (
    <span onMouseEnter={scramble} className={`cursor-default ${className}`}>
      {displayText}
    </span>
  )
}

// ─── 3. MAIN COMPONENT ────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [warpState, setWarpState] = useState('idle')
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [pendingLogin, setPendingLogin] = useState(null)
  const [errors, setErrors] = useState({ email: '', password: '', name: '' })
  
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const user = params.get('user')
    const error = params.get('error')

    if (isAuthenticated() && !token && !user && !error && !location.state?.fromLanding) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (error) {
      toast.error('Google authentication failed')
      return
    }

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user))
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(parsedUser))
        toast.success('Logged in with Google! 🎉')
        setWarpState('forward')
        setTimeout(() => navigate('/dashboard'), 1500)
      } catch (e) {
        console.error('Failed to parse user:', e)
        toast.error('Authentication error. Please try again.')
      }
    }
  }, [location, navigate])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [0, windowSize.height], [4, -4])
  const rotateY = useTransform(mouseX, [0, windowSize.width], [-4, 4])

  const handleMove = (e) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  const validateForm = () => {
    if (!isSignup && requiresTwoFactor) {
      const newErrors = {}
      if (!/^\d{6}$/.test(twoFactorCode)) {
        newErrors.twoFactor = 'Enter valid 6-digit code'
      }
      setErrors(prev => ({ ...prev, twoFactor: newErrors.twoFactor || '' }))
      return Object.keys(newErrors).length === 0
    }

    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid format'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password required'
    } else if (formData.password.length < 6) {
      newErrors.password = '6+ characters required'
    }
    
    if (isSignup && !formData.name) {
      newErrors.name = 'Name required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    setWarpState('forward')

    try {
      if (isSignup) {
        const data = await signup(formData.name, formData.email, formData.password)
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user || { email: formData.email, name: formData.name }))
          toast.success('Account created! 🎉')
          setTimeout(() => navigate('/dashboard'), 1500)
        } else {
          toast.error(data.message || 'Signup failed')
          setWarpState('idle')
          setLoading(false)
        }
      } else {
        const loginEmail = requiresTwoFactor ? pendingLogin?.email : formData.email
        const loginPassword = requiresTwoFactor ? pendingLogin?.password : formData.password

        const data = await login(loginEmail, loginPassword, requiresTwoFactor ? twoFactorCode : undefined)

        if (data.requiresTwoFactor) {
          setPendingLogin({ email: formData.email, password: formData.password })
          setRequiresTwoFactor(true)
          setWarpState('idle')
          setLoading(false)
          toast('Enter 6-digit code from your authenticator app', { icon: '🛡️' })
          return
        }

        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user || { email: formData.email }))
          
          const profileCompleted = localStorage.getItem('profileCompleted') === 'true'
          if (isSignup || !profileCompleted) {
            toast.success('Welcome to FitTrack! Let\'s set up your athlete profile. 💪')
            setTimeout(() => navigate('/profile?onboarding=true'), 1200)
          } else {
            toast.success('Welcome back! 💪')
            setTimeout(() => navigate('/dashboard'), 1200)
          }
        } else {
          toast.error(data.message || 'Login failed')
          setWarpState('idle')
          setLoading(false)
        }
      }
    } catch {
      toast.error('Connection error. Is backend running?')
      setWarpState('idle')
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const apiBase = rawApiUrl.replace(/\/api\/?$/, '')
    const frontendOrigin = window.location.origin
    window.location.href = `${apiBase}/api/auth/google?frontend=${encodeURIComponent(frontendOrigin)}`
  }

  const handleAbort = () => {
    setWarpState('reverse')
    setTimeout(() => navigate('/'), 1200)
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setErrors({ email: '', password: '', name: '', twoFactor: '' })
    setRequiresTwoFactor(false)
    setPendingLogin(null)
    setTwoFactorCode('')
  }

  return (
    <div 
      className="min-h-screen bg-[#0B0F14] flex items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-6 sm:py-12 perspective-1000 selection:bg-cyan-500 selection:text-black font-sans relative"
      onMouseMove={handleMove}
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      <WarpBackground warpState={warpState} />
      
      {/* Background radial overlays */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-cyan-950/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] bg-blue-950/10 blur-[120px] rounded-full" />
      </div>

      {/* BACK TO HOME BUTTON */}
      <motion.button
        onClick={handleAbort}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.03 }}
        className="fixed top-6 left-6 z-50 group pointer-events-auto"
      >
        <div 
          className="px-5 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider text-[#D7E2EA] flex items-center gap-2"
          style={{
            background: 'rgba(20,24,30,0.5)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255,255,255,0.08)'
          }}
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Home
        </div>
      </motion.button>

      {/* MAIN CONTAINER */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={
          warpState === 'forward' ? { scale: [1, 0.1], opacity: 0, rotateZ: 35 } : 
          warpState === 'reverse' ? { scale: [1, 1.15], opacity: 0 } :
          { scale: 1, opacity: 1 }
        }
        transition={{ duration: warpState === 'idle' ? 0.5 : 1.2 }}
        className="relative z-20 w-full max-w-[460px] p-6 sm:p-8"
      >
        {/* Card base styling */}
        <div 
          className="absolute inset-0 border rounded-[32px] pointer-events-none"
          style={{
            background: 'rgba(20, 24, 30, 0.5)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
        />
        
        <div className="relative z-10 w-full flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-10 animate-pulse" />
            <Shield size={36} className="text-cyan-400 relative z-10" />
          </div>

          <div className="w-full text-center space-y-2">
            <h2 className="hero-heading text-3xl font-black uppercase tracking-tight leading-none">
              <HackerText text={isSignup ? "Create Account" : "Welcome Back"} />
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono tracking-[0.24em] uppercase">
              {isSignup ? 'NEW IDENTITY SYSTEM' : 'AUTHORIZED ACCESS ONLY'}
            </p>
          </div>

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white text-zinc-900 hover:bg-[#D7E2EA] font-bold text-xs uppercase tracking-[0.12em] rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-zinc-650 font-bold text-[9px] uppercase tracking-widest font-mono">OR</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
              
            {isSignup && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => {
                    setFormData({...formData, name: e.target.value})
                    setErrors({...errors, name: ''})
                  }}
                  className={`w-full h-12 rounded-xl bg-white/5 border ${errors.name ? 'border-red-400/40' : 'border-white/5'} pl-11 pr-4 text-white placeholder-zinc-600 outline-none focus:bg-white/10 focus:border-cyan-400/50 transition-all text-sm`}
                />
                {errors.name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] mt-1 font-mono uppercase tracking-widest">{errors.name}</motion.p>
                )}
              </div>
            )}

            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={formData.email}
                onChange={e => {
                  setFormData({...formData, email: e.target.value})
                  setErrors({...errors, email: ''})
                }}
                className={`w-full h-12 rounded-xl bg-white/5 border ${errors.email ? 'border-red-400/40' : 'border-white/5'} pl-11 pr-4 text-white placeholder-zinc-600 outline-none focus:bg-white/10 focus:border-cyan-400/50 transition-all text-sm`}
              />
              {errors.email && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] mt-1 font-mono uppercase tracking-widest">{errors.email}</motion.p>
              )}
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Security Key"
                value={formData.password}
                onChange={e => {
                  setFormData({...formData, password: e.target.value})
                  setErrors({...errors, password: ''})
                }}
                className={`w-full h-12 rounded-xl bg-white/5 border ${errors.password ? 'border-red-400/40' : 'border-white/5'} pl-11 pr-4 text-white placeholder-zinc-600 outline-none focus:bg-white/10 focus:border-cyan-400/50 transition-all text-sm`}
              />
              {errors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] mt-1 font-mono uppercase tracking-widest">{errors.password}</motion.p>
              )}
            </div>

            {!isSignup && requiresTwoFactor && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="2FA Authenticator Code"
                  value={twoFactorCode}
                  onChange={e => {
                    setTwoFactorCode(e.target.value.replace(/\D/g, ''))
                    setErrors({ ...errors, twoFactor: '' })
                  }}
                  className={`w-full h-12 rounded-xl bg-white/5 border ${errors.twoFactor ? 'border-red-400/40' : 'border-white/5'} pl-11 pr-4 text-white placeholder-zinc-600 outline-none focus:bg-white/10 focus:border-cyan-400/50 transition-all text-sm`}
                />
                {errors.twoFactor && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] mt-1 font-mono uppercase tracking-widest">{errors.twoFactor}</motion.p>
                )}
              </div>
            )}

            {/* CTA Gradient Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden relative group"
              style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
                color: '#D7E2EA',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <><Loader2 className="animate-spin" size={16} /> {isSignup ? 'Creating...' : 'Initializing...'}</>
                ) : (
                  <>{isSignup ? 'Create Account' : 'Initialize Session'} <ArrowRight size={16} /></>
                )}
              </span>
            </motion.button>
        </form>

        <div className="w-full pt-2 flex justify-between text-[10px] text-zinc-500 font-mono uppercase">
          <button 
            onClick={toggleMode} 
            className="hover:text-cyan-400 transition-colors"
          >
            {isSignup ? '← BACK TO LOGIN' : 'CREATE ACCOUNT'}
          </button>
          <button 
            onClick={() => {
              clearUserData()
              localStorage.setItem('token', 'demo-token-skip-auth')
              localStorage.setItem('user', JSON.stringify({
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@fittracker.app',
                profileData: {}
              }))
              toast.success('Entered demo mode')
              navigate('/dashboard', { replace: true })
            }} 
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            SKIP AUTH
          </button>
        </div>
      </div>
    </motion.div>
  </div>
  )
}

export default LoginPage