import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Send, Zap, Dumbbell, Apple, TrendingUp,
  User, Bot, Loader2, X, ChevronRight, Sparkles,
  RotateCcw, Activity, Flame, Target, Brain
} from 'lucide-react'

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAEBkB3crMQBUMPiNixOF5hLPi16YWBGQc'
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`

// ─── LOAD ALL USER DATA FROM LOCALSTORAGE ─────────────────────────────────────
function getUserContext() {
  const safe = (key, fallback = null) => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : fallback
    } catch { return fallback }
  }

  const profile = safe('profileData') || safe('userProfile')
  const workoutHistory = Array.isArray(safe('workoutHistory')) ? safe('workoutHistory') : []
  const currentWorkout = Array.isArray(safe('currentWorkout')) ? safe('currentWorkout') : []
  const todayLog = Array.isArray(safe('todayLog')) ? safe('todayLog') : []
  const dailyMeals = Array.isArray(safe('dailyMeals')) ? safe('dailyMeals') : []
  const calorieData = safe('calorieData')
  const waterIntake = safe('waterIntake')
  const progressPhotos = Array.isArray(safe('progressPhotos')) ? safe('progressPhotos') : []
  const savedAnalyses = Array.isArray(safe('savedAnalyses')) ? safe('savedAnalyses') : []

  // Build smart context summary
  const totalWorkouts = workoutHistory.length
  const totalVolume = workoutHistory.reduce((s, w) => s + (w?.volume || 0), 0)
  const avgCalories = workoutHistory.length
    ? Math.round(workoutHistory.reduce((s, w) => s + (w?.calories || 0), 0) / workoutHistory.length)
    : 0

  const todayCalories = todayLog.reduce((s, m) => s + (m?.calories || 0), 0)
  const todayProtein = todayLog.reduce((s, m) => s + (m?.protein || 0), 0)

  return {
    profile,
    workoutHistory: workoutHistory.slice(0, 10), // last 10
    currentWorkout,
    todayLog,
    calorieData,
    waterIntake,
    totalWorkouts,
    totalVolume,
    avgCalories,
    todayCalories,
    todayProtein,
    progressPhotos: progressPhotos.length,
    savedAnalyses,
    raw: {
      dailyMeals: dailyMeals.slice(0, 5)
    }
  }
}

// ─── BUILD SYSTEM PROMPT WITH REAL USER DATA ──────────────────────────────────
function buildSystemPrompt(ctx) {
  const p = ctx.profile
  return `You are an elite AI personal trainer and nutritionist inside an AI Fitness Tracker app. You have FULL access to this user's real fitness data. Be specific, data-driven, and feel like a real coach who actually knows them — not a generic chatbot.

USER PROFILE:
${p ? `- Name: ${p.name || 'User'}
- Age: ${p.age || 'unknown'} | Gender: ${p.gender || 'unknown'}
- Weight: ${p.weight || '?'}kg | Height: ${p.height || '?'}cm
- Goal: ${p.fitnessGoal || p.goal || 'not set'}
- Activity Level: ${p.activityLevel || 'unknown'}
- Experience: ${p.experience || 'unknown'}` : '- No profile set up yet'}

WORKOUT DATA:
- Total workouts completed: ${ctx.totalWorkouts}
- Total volume lifted all time: ${ctx.totalVolume.toLocaleString()}kg
- Avg calories burned per workout: ${ctx.avgCalories} kcal
${ctx.workoutHistory.length > 0 ? `- Recent workouts: ${ctx.workoutHistory.slice(0, 5).map(w => `${w?.date || 'Unknown'} (${w?.exercises || 0} exercises, ${w?.volume || 0}kg volume)`).join(', ')}` : '- No workout history yet'}
${ctx.currentWorkout.length > 0 ? `- Current active workout: ${ctx.currentWorkout.map(e => e?.name || 'Exercise').filter(Boolean).join(', ')}` : ''}

TODAY'S NUTRITION:
- Calories consumed today: ${ctx.todayCalories} kcal
- Protein today: ${ctx.todayProtein}g
${ctx.calorieData ? `- Daily calorie goal: ${ctx.calorieData.goalCalories || ctx.calorieData.maintenanceCalories || 'not set'} kcal` : ''}
${ctx.todayLog.length > 0 ? `- Foods logged: ${ctx.todayLog.map(m => m?.name || m?.food).filter(Boolean).join(', ')}` : '- No food logged today'}

OTHER:
- Water tracker in use: ${ctx.waterIntake ? 'yes' : 'no'}
- Progress photos: ${ctx.progressPhotos}
- Body analyses saved: ${ctx.savedAnalyses.length}

RESPONSE RULES:
1. Be conversational and direct — like a real coach texting them
2. Use their ACTUAL data when relevant (mention real numbers, real workouts)
3. Be specific — never give generic advice if you have their data
4. Use bullet points for lists, be concise
5. If they ask about a workout plan, use their goal and experience level
6. If they ask about nutrition, use their actual calorie/protein data
7. Respond in markdown — bold key points, use bullets
8. End with ONE specific actionable tip or question to keep the conversation going
9. Keep responses focused — not too long unless they ask for detailed plans`
}

// ─── QUICK ACTION BUTTONS ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: TrendingUp,
    label: 'Analyze my progress',
    color: 'from-blue-500 to-cyan-500',
    prompt: 'Analyze my workout history and progress. What are my strengths and weaknesses? What should I focus on?'
  },
  {
    icon: Dumbbell,
    label: 'Build me a workout',
    color: 'from-amber-500 to-orange-500',
    prompt: "Create a personalized workout plan for today based on my goals, experience level, and recent training history."
  },
  {
    icon: Apple,
    label: 'Plan my nutrition',
    color: 'from-green-500 to-emerald-500',
    prompt: "Based on my calorie goal and today's food log, tell me exactly what I should eat for the rest of today to hit my macro targets."
  },
  {
    icon: Target,
    label: 'Am I on track?',
    color: 'from-purple-500 to-violet-500',
    prompt: "Look at all my data — workouts, nutrition, progress — and give me an honest assessment. Am I on track to reach my goals?"
  },
  {
    icon: Flame,
    label: 'How to break plateau',
    color: 'from-red-500 to-rose-500',
    prompt: "I feel like I'm stuck. Based on my workout history and current routine, what specific changes should I make to break through my plateau?"
  },
  {
    icon: Brain,
    label: 'Recovery advice',
    color: 'from-indigo-500 to-blue-500',
    prompt: "Based on my recent training volume and frequency, what does my recovery look like? Am I overtraining or undertraining? What should I do?"
  }
]

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-3 mb-6">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
      <Bot size={16} className="text-white" />
    </div>
    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-5 py-4">
      <div className="flex gap-1.5 items-center h-5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-amber-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </div>
)

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'

  // Simple markdown renderer
  const renderContent = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-amber-400 mt-1 flex-shrink-0">▸</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
          </div>
        )
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)[1]
        return (
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-amber-400 font-bold flex-shrink-0 w-4">{num}.</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />
          </div>
        )
      }
      // Empty line
      if (line.trim() === '') return <div key={i} className="h-2" />
      // Normal line
      return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-slate-600 to-slate-700'
          : 'bg-gradient-to-br from-amber-500 to-orange-600'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] px-5 py-4 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-sm'
          : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-sm'
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="space-y-0.5">
            {renderContent(message.content)}
            {message.streaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 align-middle"
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AIAssistant() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [userCtx] = useState(() => getUserContext())
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Welcome message on mount
  useEffect(() => {
    const name = userCtx.profile?.name
    const hasData = userCtx.totalWorkouts > 0 || userCtx.todayCalories > 0

    const welcome = name
      ? `Hey ${name}! 👋 I'm your AI trainer. I can see your fitness data — ${userCtx.totalWorkouts} workouts logged${userCtx.todayCalories > 0 ? `, ${userCtx.todayCalories} calories today` : ''}. What do you want to work on?`
      : `Hey! I'm your AI personal trainer. ${hasData ? `I can see your fitness data — ask me anything about your progress, workouts, or nutrition.` : `Set up your profile to get personalized advice, or just ask me anything about fitness!`}`

    setMessages([{ id: 1, role: 'assistant', content: welcome }])
  }, [])

  // ── STREAMING GEMINI CALL ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isStreaming) return

    const userMsg = { id: Date.now(), role: 'user', content: userText }
    const assistantId = Date.now() + 1

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)
    setShowQuickActions(false)

    // Build conversation history for Gemini
    const systemPrompt = buildSystemPrompt(userCtx)
    const history = [...messages, userMsg]

    // Build contents array (Gemini format)
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + history[0]?.content }] },
      ...history.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ]

    // Add streaming assistant message placeholder
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true
    }])

    try {
      abortRef.current = new AbortController()

      const response = await fetch(GEMINI_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const json = JSON.parse(data)
              const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
              if (text) {
                fullText += text
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: fullText, streaming: true }
                    : m
                ))
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }

      // Mark streaming done
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ))

    } catch (err) {
      if (err.name === 'AbortError') return

      console.error('Gemini error:', err)

      // Fallback response using user data
      const fallback = generateFallback(userText, userCtx)
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: fallback, streaming: false }
          : m
      ))
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming, userCtx])

  // Fallback when API fails
  function generateFallback(prompt, ctx) {
    const p = prompt.toLowerCase()
    if (p.includes('workout') || p.includes('train') || p.includes('exercise')) {
      return `Based on your data (${ctx.totalWorkouts} workouts, ${ctx.totalVolume.toLocaleString()}kg total volume), here's what I'd recommend:\n\n**Focus on progressive overload** — if you've been hitting the same weights, bump them up by 2.5-5% next session.\n\n**Your recent training suggests** you're ready for more intensity. Consider adding a 4th set to your main compound lifts.\n\n*Note: AI is temporarily offline — this is a data-based suggestion.*`
    }
    if (p.includes('eat') || p.includes('food') || p.includes('calorie') || p.includes('nutrition')) {
      const remaining = (ctx.calorieData?.goalCalories || 2500) - ctx.todayCalories
      return `You've had **${ctx.todayCalories} calories** and **${ctx.todayProtein}g protein** today.\n\n${remaining > 0 ? `You have **${remaining} calories** left to hit your goal.` : `You've hit your calorie target for today!`}\n\n**Quick suggestion:** ${ctx.todayProtein < 150 ? 'Protein is low — add a chicken breast or protein shake.' : 'Protein is on track! Focus on hitting your calorie goal with complex carbs.'}\n\n*Note: AI is temporarily offline — this is based on your logged data.*`
    }
    return `I can see you've completed **${ctx.totalWorkouts} workouts** and lifted **${ctx.totalVolume.toLocaleString()}kg** total. You're making progress!\n\n**Today:** ${ctx.todayCalories} calories consumed.\n\nUnfortunately the AI connection is temporarily down. Try again in a moment!\n\n*Tip: Make sure your VITE_GEMINI_API_KEY is set in your .env file.*`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleQuickAction = (prompt) => {
    sendMessage(prompt)
  }

  const clearChat = () => {
    const name = userCtx.profile?.name
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: name ? `Fresh start, ${name}! What do you want to work on?` : 'Fresh start! What do you want to work on?'
    }])
    setShowQuickActions(true)
    if (abortRef.current) abortRef.current.abort()
    setIsStreaming(false)
  }

  // ── STATS BAR ──────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Workouts', value: userCtx.totalWorkouts, icon: Dumbbell, color: 'text-amber-400' },
    { label: 'Volume', value: `${Math.round(userCtx.totalVolume / 1000)}t`, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Today kcal', value: userCtx.todayCalories, icon: Flame, color: 'text-orange-400' },
    { label: 'Protein', value: `${userCtx.todayProtein}g`, icon: Target, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col">

      {/* ── HEADER ── */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight">AI Trainer</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-500">Powered by Gemini • Knows your data</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          title="Clear chat"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      {/* ── YOUR DATA STATS BAR ── */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-slate-800/50 bg-slate-900/40">
        <div className="flex gap-6 overflow-x-auto pb-1 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <stat.icon size={14} className={stat.color} />
              <span className="text-xs text-slate-500">{stat.label}:</span>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.value || '—'}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 flex-shrink-0 ml-2 pl-4 border-l border-slate-700">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-xs text-slate-500">AI sees all your real data</span>
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">

        {/* Messages */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator when loading (before streaming starts) */}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        {/* Quick action buttons */}
        <AnimatePresence>
          {showQuickActions && messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Quick actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl text-left transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{action.label}</span>
                    <ChevronRight size={14} className="text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your training, nutrition, recovery..."
              rows={1}
              disabled={isStreaming}
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none transition-all disabled:opacity-50"
              style={{ maxHeight: '120px' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
          </div>

          {isStreaming ? (
            <button
              onClick={() => { abortRef.current?.abort(); setIsStreaming(false) }}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
              title="Stop generating"
            >
              <X size={18} className="text-white" />
            </button>
          ) : (
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-700 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-lg shadow-amber-500/20 disabled:shadow-none"
            >
              <Send size={18} className="text-white" />
            </motion.button>
          )}
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
