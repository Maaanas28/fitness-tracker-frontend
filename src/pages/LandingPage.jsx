import { useNavigate } from 'react-router-dom'
   import { Dumbbell, Target, TrendingUp, Users } from 'lucide-react'

   function LandingPage() {
     const navigate = useNavigate()

     return (
       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
         {/* Navbar */}
         <nav className="flex justify-between items-center px-8 py-6">
           <div className="flex items-center gap-2">
             <Dumbbell className="text-lime-500" size={32} />
             <h1 className="text-2xl font-bold text-white">AI Fitness Tracker</h1>
           </div>
           <div className="flex gap-4">
             <button 
  onClick={() => navigate('/login')}
  className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
>
  Login
</button>
             <button 
  onClick={() => navigate('/login')}
  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
>
  Sign Up
</button>
           </div>
         </nav>

         {/* Hero Section */}
         <div className="max-w-6xl mx-auto px-8 py-20 text-center">
           <h2 className="text-6xl font-bold text-white mb-6">
             Transform Your Body,
             <span className="text-lime-500"> Track Your Progress</span>
           </h2>
           <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
             Your intelligent fitness companion powered by AI. Track workouts, monitor nutrition, 
             and achieve your fitness goals with personalized insights.
           </p>
           <button className="bg-lime-500 hover:bg-lime-600 text-black font-bold text-lg px-10 py-4 rounded-lg transition-all transform hover:scale-105">
             Get Started Free 💪
           </button>
         </div>

         {/* Features Section */}
         <div className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-8">
           <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
             <Target className="text-lime-500 mb-4" size={40} />
             <h3 className="text-xl font-bold text-white mb-3">Smart Goals</h3>
             <p className="text-gray-400">
               Set personalized fitness goals and get AI-powered workout plans tailored to your needs.
             </p>
           </div>

           <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
             <TrendingUp className="text-lime-500 mb-4" size={40} />
             <h3 className="text-xl font-bold text-white mb-3">Track Progress</h3>
             <p className="text-gray-400">
               Monitor your weight, workouts, and nutrition with beautiful charts and insights.
             </p>
           </div>

           <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition-colors">
             <Users className="text-lime-500 mb-4" size={40} />
             <h3 className="text-xl font-bold text-white mb-3">Body Analysis</h3>
             <p className="text-gray-400">
               Analyze your body composition and get targeted exercise recommendations.
             </p>
           </div>
         </div>

         {/* Footer */}
         <footer className="text-center text-gray-500 py-8 border-t border-gray-800">
           <p>© 2026 AI Fitness Tracker. Transform your fitness journey.</p>
         </footer>
       </div>
     )
   }

   export default LandingPage