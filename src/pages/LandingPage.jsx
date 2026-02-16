import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Play, Zap, Activity } from 'lucide-react'
import { 
  motion, 
  useScroll, 
  useSpring, 
  useMotionValue, 
  useMotionTemplate 
} from 'framer-motion'

// --- 1. OPTIMIZED CUSTOM CURSOR (Hidden on Touch Devices) ---
const CustomCursor = () => {
  const mouse = { x: useMotionValue(0), y: useMotionValue(0) }
  const smoothOptions = { damping: 20, stiffness: 300, mass: 0.5 }
  const smoothMouse = { x: useSpring(mouse.x, smoothOptions), y: useSpring(mouse.y, smoothOptions) }

  useEffect(() => {
    const manageMouseMove = (e) => {
      const { clientX, clientY } = e
      mouse.x.set(clientX)
      mouse.y.set(clientY)
    }
    window.addEventListener("mousemove", manageMouseMove)
    return () => window.removeEventListener("mousemove", manageMouseMove)
  }, [mouse.x, mouse.y])

  return (
    <motion.div 
      className="hidden md:block fixed top-0 left-0 w-8 h-8 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference"
      style={{ 
        left: smoothMouse.x, 
        top: smoothMouse.y, 
        translateX: '-50%', 
        translateY: '-50%' 
      }}
    />
  )
}

// --- 2. SPOTLIGHT CARD (Performance Optimized) ---
const SpotlightCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div 
      className={`group relative border border-white/10 bg-zinc-900/80 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(220, 38, 38, 0.15),
              transparent 80%
            )
          `
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  
  // Track Window Scroll for Parallax
  const { scrollYProgress } = useScroll()

  return (
    // 'md:cursor-none' ensures normal cursor on mobile, hidden on desktop
    <div className="bg-black text-white min-h-screen md:cursor-none selection:bg-red-600 selection:text-black font-sans overflow-x-hidden">
      <CustomCursor />

      {/* --- NOISE TEXTURE (Fixed: pointer-events-none) --- */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.05] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-red-800/20 blur-[120px] rounded-full" 
         />
         <motion.div 
           animate={{ scale: [1, 1.5, 1], x: [0, 100, 0] }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 blur-[120px] rounded-full" 
         />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-40 px-6 md:px-10 py-8 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="text-xl font-bold tracking-tighter">AI.FIT</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-xs md:text-sm font-medium uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
        >
          [ Login ]
        </button>
      </nav>

      {/* --- HERO SECTION: THE SANDWICH LAYOUT (No Overlap) --- */}
      <section className="relative min-h-screen flex flex-col justify-between items-center overflow-hidden py-24 md:py-32">
        
        {/* TOP TEXT - Slides Up */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="relative z-10 text-center"
        >
          <h1 className="text-[18vw] md:text-[14vw] leading-none font-black tracking-tighter text-transparent select-none bg-clip-text bg-gradient-to-b from-white to-zinc-600">
            DEFINE
          </h1>
        </motion.div>

        {/* MIDDLE: THE CARD (Floating in the safe zone) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="relative z-20 w-[300px] h-[400px] md:w-[350px] md:h-[450px] my-8"
        >
           {/* GLOWING ORB BEHIND CARD */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-red-600/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />

           {/* THE CARD ITSELF */}
           <div className="relative w-full h-full bg-zinc-900/90 border border-white/10 rounded-[30px] overflow-hidden flex flex-col items-center justify-between p-8 shadow-2xl shadow-black backdrop-blur-sm">
              
              {/* Header */}
              <div className="w-full flex justify-between items-center border-b border-white/5 pb-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-gray-400">LIVE FEED</span>
                 </div>
                 <Zap size={16} className="text-white" />
              </div>

              {/* Center Icon */}
              <div className="flex-1 flex items-center justify-center">
                 <motion.div 
                   animate={{ 
                     filter: ["drop-shadow(0 0 0px #ef4444)", "drop-shadow(0 0 20px #ef4444)", "drop-shadow(0 0 0px #ef4444)"] 
                   }}
                   transition={{ duration: 2, repeat: Infinity }}
                 >
                    <Activity size={80} className="text-white" strokeWidth={1} />
                 </motion.div>
              </div>

              {/* Footer Stats */}
              <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                 <div>
                    <p className="text-[10px] text-gray-500 font-mono">HRV</p>
                    <p className="text-xl font-bold text-white">42<span className="text-xs text-gray-500 ml-1">ms</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-mono">LOAD</p>
                    <p className="text-xl font-bold text-white">98<span className="text-xs text-gray-500 ml-1">%</span></p>
                 </div>
              </div>

              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-50 mix-blend-overlay" />
           </div>
        </motion.div>

        {/* BOTTOM TEXT - Slides Down */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="relative z-10 text-center"
        >
           {/* Hollow Text Style for 'LIMITS' */}
          <h1 
            className="text-[18vw] md:text-[14vw] leading-none font-black tracking-tighter text-transparent select-none"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}
          >
            LIMITS
          </h1>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 mix-blend-screen"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</p>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>

      </section>

      {/* --- CONTENT GRID --- */}
      <section className="relative z-20 px-4 md:px-10 pb-32 pt-10 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Main Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="col-span-1 md:col-span-8 h-[400px] md:h-[500px]"
          >
            <SpotlightCard className="h-full rounded-3xl p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <Activity className="text-red-500" size={40} />
                  <span className="text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded">V.2.0.1</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">Neural Tracking.</h3>
                <p className="text-zinc-400 max-w-lg text-lg leading-relaxed">
                  Our AI doesn't just count reps. It analyzes biomechanics in real-time, adjusting load and volume dynamically to ensure progressive overload without injury.
                </p>
              </div>
              <div className="flex justify-end">
                <button className="rounded-full w-14 h-14 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group-hover:scale-110">
                  <ArrowUpRight size={24} />
                </button>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 2: Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-4 h-[400px] md:h-[500px]"
          >
            <SpotlightCard className="h-full rounded-3xl p-8 relative flex flex-col">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-900/10 pointer-events-none" />
               <h3 className="text-2xl font-medium mb-8">Live Analytics</h3>
               
               <div className="space-y-6 flex-1">
                 {[
                   { label: 'HYPERTROPHY', val: 92 },
                   { label: 'RECOVERY', val: 64 },
                   { label: 'INTENSITY', val: 88 }
                 ].map((stat, i) => (
                   <div key={i} className="group/bar">
                     <div className="flex justify-between text-xs font-mono text-zinc-500 mb-2">
                       <span>{stat.label}</span>
                       <span>{stat.val}%</span>
                     </div>
                     <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${stat.val}%` }}
                         transition={{ duration: 1.5, delay: 0.2 + (i * 0.1), ease: "circOut" }}
                         className="h-full bg-white group-hover/bar:bg-red-500 transition-colors duration-300" 
                       />
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-auto pt-8 border-t border-white/5">
                  <p className="text-xs text-zinc-500">Processing real-time user data...</p>
               </div>
            </SpotlightCard>
          </motion.div>

           {/* Card 3: Big CTA Banner */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-12 h-[300px] mt-6"
          >
            <div 
              onClick={() => navigate('/login')}
              className="relative h-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/10 transition-colors duration-500"
            >
               {/* Marquee Background */}
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 leading-none select-none pointer-events-none overflow-hidden">
                  <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} className="flex whitespace-nowrap text-[10rem] font-black">
                    START NOW START NOW START NOW START NOW
                  </motion.div>
               </div>
               
               <div className="relative z-10 text-center">
                 <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 mix-blend-overlay group-hover:mix-blend-normal transition-all">
                   JOIN THE ELITE
                 </h2>
                 <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-3 mx-auto transition-transform group-hover:scale-105">
                   <Play size={18} fill="currentColor" /> Initialize
                 </button>
               </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 py-12 px-6 md:px-10 flex flex-col md:flex-row justify-between items-end bg-black relative z-10">
         <div>
            <h1 className="text-[12vw] leading-none font-black text-zinc-900 select-none">AI.FIT</h1>
         </div>
         <div className="flex gap-8 text-xs uppercase tracking-widest text-zinc-500 mb-2 md:mb-6">
            <a href="#" className="hover:text-red-500 transition-colors">Instagram</a>
            <a href="#" className="hover:text-red-500 transition-colors">Twitter</a>
            <a href="#" className="hover:text-red-500 transition-colors">Support</a>
         </div>
      </footer>

    </div>
  )
}

export default LandingPage