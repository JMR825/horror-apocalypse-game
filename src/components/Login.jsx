import React, { useState } from 'react'
import { Skull, UserPlus, LogIn } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  
  const { login } = useAuthStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.username.trim()) {
      toast.error('Username is required!')
      return
    }

    if (!isLogin && !formData.email.trim()) {
      toast.error('Email is required for registration!')
      return
    }

    try {
      const user = login(formData.username, formData.email || `${formData.username}@horror-game.com`)
      toast.success(`Welcome to the apocalypse, ${user.username}!`)
    } catch (error) {
      toast.error('Authentication failed!')
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <div className="bg-black/80 p-8 rounded-lg border border-red-800 shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Skull className="w-12 h-12 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold horror-title text-red-500">
              HORROR APOCALYPSE
            </h1>
            <Skull className="w-12 h-12 text-red-500 ml-3" />
          </div>
          <p className="text-gray-300">
            Enter the nightmare... if you dare
          </p>
        </div>

        {/* Toggle */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              isLogin 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              !isLogin 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              👤 Survivor Name
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Enter your survivor name..."
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="your.email@example.com"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Enter your password..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            {isLogin ? '🚪 Enter the Apocalypse' : '🎮 Join the Nightmare'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p className="mb-2">⚠️ Warning: Extremely terrifying content ahead</p>
          <p>🎯 Survive the horror with AI-powered storytelling</p>
        </div>
      </div>
    </div>
  )
}

export default Login