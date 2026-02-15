import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Target, 
  Activity, Ruler, Weight, Edit, Save, X, Camera
} from 'lucide-react'

function ProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    age: 25,
    gender: 'Male',
    height: 175,
    currentWeight: 80.5,
    goalWeight: 75,
    activityLevel: 'Moderate',
    fitnessGoal: 'Weight Loss',
    joinDate: '2026-01-01'
  })

  const [tempData, setTempData] = useState({...profileData})

  const handleEdit = () => {
    setTempData({...profileData})
    setIsEditing(true)
  }

  const handleSave = () => {
    setProfileData({...tempData})
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData({...profileData})
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <User className="text-lime-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-gray-400 text-sm">Manage your account settings</p>
            </div>
          </div>
        </div>
        {!isEditing && (
          <button 
            onClick={handleEdit}
            className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Edit size={18} />
            Edit Profile
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header Card */}
        <div className="bg-gray-800 p-8 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-lime-500 to-green-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={64} />
              </div>
              <button className="absolute bottom-0 right-0 bg-lime-500 hover:bg-lime-600 p-2 rounded-full transition-colors">
                <Camera size={18} className="text-black" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{profileData.name}</h2>
              <p className="text-gray-400 mb-4">{profileData.email}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-2 bg-lime-500/20 text-lime-500 rounded-lg font-semibold text-sm">
                  🎯 {profileData.fitnessGoal}
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-semibold text-sm">
                  💪 {profileData.activityLevel} Activity
                </span>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-500 rounded-lg font-semibold text-sm">
                  📅 Member since Jan 2026
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded-xl text-center">
                <Weight className="text-lime-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-white">{profileData.currentWeight}</p>
                <p className="text-gray-400 text-sm">Current</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl text-center">
                <Target className="text-orange-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-white">{profileData.goalWeight}</p>
                <p className="text-gray-400 text-sm">Goal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'text-lime-500 border-b-2 border-lime-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('fitness')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'fitness'
                ? 'text-lime-500 border-b-2 border-lime-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fitness Details
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'text-lime-500 border-b-2 border-lime-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'profile' && (
          <div className="bg-gray-800 p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={isEditing ? tempData.name : profileData.name}
                  onChange={(e) => setTempData({...tempData, name: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={isEditing ? tempData.email : profileData.email}
                  onChange={(e) => setTempData({...tempData, email: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </label>
                <input
                  type="tel"
                  value={isEditing ? tempData.phone : profileData.phone}
                  onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Age
                </label>
                <input
                  type="number"
                  value={isEditing ? tempData.age : profileData.age}
                  onChange={(e) => setTempData({...tempData, age: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Gender
                </label>
                <select
                  value={isEditing ? tempData.gender : profileData.gender}
                  onChange={(e) => setTempData({...tempData, gender: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fitness' && (
          <div className="bg-gray-800 p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Fitness Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Height */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Ruler size={16} />
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={isEditing ? tempData.height : profileData.height}
                  onChange={(e) => setTempData({...tempData, height: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Current Weight */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Weight size={16} />
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  value={isEditing ? tempData.currentWeight : profileData.currentWeight}
                  onChange={(e) => setTempData({...tempData, currentWeight: parseFloat(e.target.value)})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Goal Weight */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  value={isEditing ? tempData.goalWeight : profileData.goalWeight}
                  onChange={(e) => setTempData({...tempData, goalWeight: parseFloat(e.target.value)})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                />
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
                  <Activity size={16} />
                  Activity Level
                </label>
                <select
                  value={isEditing ? tempData.activityLevel : profileData.activityLevel}
                  onChange={(e) => setTempData({...tempData, activityLevel: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                >
                  <option>Sedentary</option>
                  <option>Light</option>
                  <option>Moderate</option>
                  <option>Active</option>
                  <option>Very Active</option>
                </select>
              </div>

              {/* Fitness Goal */}
              <div className="md:col-span-2">
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Fitness Goal
                </label>
                <select
                  value={isEditing ? tempData.fitnessGoal : profileData.fitnessGoal}
                  onChange={(e) => setTempData({...tempData, fitnessGoal: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full bg-gray-900 text-white px-4 py-3 rounded-lg border ${
                    isEditing ? 'border-lime-500' : 'border-gray-700'
                  } focus:outline-none transition-colors`}
                >
                  <option>Weight Loss</option>
                  <option>Muscle Gain</option>
                  <option>Maintain Weight</option>
                  <option>Improve Endurance</option>
                  <option>General Fitness</option>
                </select>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-gray-800 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">Workout Reminders</p>
                    <p className="text-gray-400 text-sm">Get notified about your workout schedule</p>
                  </div>
                  <button className="bg-lime-500 w-14 h-7 rounded-full relative">
                    <div className="bg-black w-5 h-5 rounded-full absolute right-1 top-1"></div>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">Progress Updates</p>
                    <p className="text-gray-400 text-sm">Weekly progress summaries</p>
                  </div>
                  <button className="bg-gray-600 w-14 h-7 rounded-full relative">
                    <div className="bg-white w-5 h-5 rounded-full absolute left-1 top-1"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-gray-800 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Privacy</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-700 rounded-lg text-white transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-700 rounded-lg text-white transition-colors">
                  Export Data
                </button>
                <button className="w-full text-left px-4 py-3 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage