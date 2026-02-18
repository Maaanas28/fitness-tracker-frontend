import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, User, Zap, Disc, AlertTriangle, ChevronLeft } from 'lucide-react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

// --- 1. THE WARP ENGINE ---
const WarpBackground = ({ warpState }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    const stars = Array.from({ length: 500 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2,
      size: Math.random() * 2
    }))

    const render = () => {
      if (warpState === 'idle') {
          ctx.fillStyle = 'rgba(0, 0, 0, 1)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      let speed = 0.2
      if (warpState === 'forward') speed = 50
      if (warpState === 'reverse') speed = -30

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

        const size = (warpState !== 'idle') ? star.size * 3 : star.size
        let color = `rgba(255, 255, 255, ${Math.random()})`
        
        if (warpState === 'forward') color = `rgba(100, 200, 255, 0.8)`
        if (warpState === 'reverse') color = `rgba(255, 50, 50, 0.8)`

        ctx.beginPath()
        if (warpState !== 'idle') {
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(star.x - (dx * 30), star.y - (dy * 30))
            ctx.strokeStyle = color
            ctx.lineWidth = size
            ctx.stroke()
        } else {
            ctx.fillStyle = color
            ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
            ctx.fill()
        }
      })

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

// --- 2. HACKER TEXT ---
const HackerText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&"

  const scramble = () => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((l, i) => {
          if (i < iteration) return text[i]
          return chars[Math.floor(Math.random() * chars.length)]
        }).join(""))
      if (iteration >= text.length) clearInterval(interval)
      iteration += 1 / 3
    }, 30)
  }

  return (
    <span onMouseEnter={scramble} className={`cursor-default ${className}`}>
      {displayText}
    </span>
  )
}

// --- 3. MAIN COMPONENT ---
function LoginPage() {
  const navigate = useNavigate()
  const [warpState, setWarpState] = useState('idle')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mouse Tilt logic
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [0, windowSize.height], [5, -5])
  const rotateY = useTransform(mouseX, [0, windowSize.width], [-5, 5])

  const handleMove = (e) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  const validateForm = () => {
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setWarpState('forward')
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  const handleAbort = () => {
    setWarpState('reverse')
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <div 
        className="min-h-screen bg-black flex items-center justify-center overflow-hidden perspective-1000 selection:bg-red-500 selection:text-white"
        onMouseMove={handleMove}
    >
      <WarpBackground warpState={warpState} />
      
      {/* HUD OVERLAY */}
      <div className={`fixed inset-0 z-10 pointer-events-none transition-colors duration-500 ${warpState === 'reverse' ? 'bg-red-900/20' : 'bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)]'}`} />

      {/* ABORT BUTTON */}
      <motion.button
        onClick={handleAbort}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        whileHover={{ x: 10, scale: 1.05 }}
        className="fixed top-8 left-0 z-50 group"
      >
        <div className="bg-zinc-900/90 border-r-4 border-yellow-500 text-white pl-8 pr-6 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:border-red-600 transition-all duration-300">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
            <ChevronLeft className="group-hover:-translate-x-1 transition-transform text-gray-500 group-hover:text-red-500" />
            <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-yellow-500 group-hover:text-red-500 tracking-[0.2em] uppercase leading-none mb-1">
                    Emergency
                </span>
                <span className="text-sm font-bold tracking-widest text-white group-hover:text-red-100">
                    ABORT MISSION
                </span>
            </div>
            <AlertTriangle className="text-yellow-500 group-hover:text-red-600 animate-pulse ml-2" size={18} />
        </div>
      </motion.button>

      {/* MAIN HUD CARD */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={
            warpState === 'forward' ? { scale: [1, 0.1], opacity: 0, rotateZ: 45 } : 
            warpState === 'reverse' ? { scale: [1, 1.2], opacity: 0, x: [0, -50, 50, 0] } :
            { scale: 1, opacity: 1 }
        }
        transition={{ duration: warpState === 'idle' ? 0.5 : 1.5 }}
        className="relative z-20 w-full max-w-md p-8"
      >
        <div className="absolute inset-0 border border-white/20 rounded-xl bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(255,255,255,0.05)]" />
        
        {/* CORNER ACCENTS */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-red-600" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-red-600" />

        <div className="relative z-10 flex flex-col items-center">
            
            <div className="mb-10 relative">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
                <Zap size={50} className="text-white relative z-10" />
            </div>

            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                <HackerText text="SYSTEM_LOGIN" />
            </h2>
            <p className="text-[10px] text-red-500 font-mono tracking-[0.5em] mb-12">
                RESTRICTED AREA // CLASS 4
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-6">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                        type="email" 
                        placeholder="IDENTIFIER"
                        value={formData.email}
                        onChange={e => {
                          setFormData({...formData, email: e.target.value})
                          setErrors({...errors, email: ''})
                        }}
                        className={`w-full bg-white/5 border-l-2 ${errors.email ? 'border-red-500' : 'border-white/10'} p-4 pl-12 text-white placeholder-gray-600 outline-none focus:bg-white/10 focus:border-red-600 transition-all font-mono text-sm tracking-wider`}
                    />
                    {errors.email && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-widest">{errors.email}</motion.p>
                    )}
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                        type="password" 
                        placeholder="SECURITY KEY"
                        value={formData.password}
                        onChange={e => {
                          setFormData({...formData, password: e.target.value})
                          setErrors({...errors, password: ''})
                        }}
                        className={`w-full bg-white/5 border-l-2 ${errors.password ? 'border-red-500' : 'border-white/10'} p-4 pl-12 text-white placeholder-gray-600 outline-none focus:bg-white/10 focus:border-red-600 transition-all font-mono text-sm tracking-wider`}
                    />
                    {errors.password && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] mt-1 font-mono uppercase tracking-widest">{errors.password}</motion.p>
                    )}
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white text-black font-black py-5 mt-4 uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-red-600 hover:text-white transition-all duration-300 relative group overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Initialize <ArrowRight size={18} />
                    </span>
                    <div className="absolute inset-0 bg-red-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
            </form>

            <div className="mt-8 flex justify-between w-full text-[10px] text-gray-500 font-mono uppercase">
                <button className="hover:text-red-500 transition-colors">Recover Key</button>
                <button className="hover:text-red-500 transition-colors">New Connection</button>
            </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage;
