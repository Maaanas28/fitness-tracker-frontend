import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

function LoginPage() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now, just navigate to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Back to Home */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <Dumbbell size={24} className="text-lime-500" />
        <span className="font-semibold">AI Fitness Tracker</span>
      </button>

      {/* Login/Signup Card */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Login to continue your fitness journey' : 'Start your fitness journey today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Only for Signup) */}
          {!isLogin && (
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-gray-900 text-white pl-10 pr-12 py-3 rounded-lg border border-gray-700 focus:border-lime-500 focus:outline-none transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password (Only for Login) */}
          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-lime-500 text-sm hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-lime-500 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage