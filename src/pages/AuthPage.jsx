import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, KeyRound } from 'lucide-react'
import { authAPI } from '../services/api'

export default function AuthPage({ onLogin, onNavigate }) {
  const [mode, setMode] = useState('login') // 'login', 'register', or 'verify'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })

  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePassword = (password) => password.length >= 8

  const validateForm = () => {
    const newErrors = {}

    if (mode === 'verify') {
      if (!formData.otp.trim() || formData.otp.length < 6) {
        newErrors.otp = 'Please enter a valid 6-digit OTP'
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
    } else if (mode === 'login') {
      // Login mode
      if (!formData.username.trim()) {
        newErrors.username = 'Username or email is required'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleLoginSuccess = (loginResponse) => {
    const loginData = loginResponse.data || loginResponse
    if (loginData && loginData.token) {
      onLogin({
        token: loginData.token,
        user: loginData.user || loginData.responseDto, // Support both formats
        username: formData.username || formData.email,
      })
    } else {
      throw new Error('Invalid login response: no token received')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')

    if (!validateForm()) return

    setLoading(true)

    try {
      if (mode === 'verify') {
        await authAPI.verify(formData.username, formData.otp)
        // Auto login after verification
        const response = await authAPI.login(formData.username, formData.password)
        handleLoginSuccess(response)
      } else if (mode === 'login') {
        const response = await authAPI.login(formData.username || formData.email, formData.password)
        handleLoginSuccess(response)
      } else {
        // Register
        await authAPI.register(
          formData.username,
          formData.email,
          formData.password
        )
        // Transition to verify mode instead of auto-login
        setMode('verify')
        setSuccessMsg('Registration successful! Please check your email for the OTP.')
      }
      setLoading(false)
    } catch (error) {
      let errorMessage = error.message

      // Handle 403 specifically
      if (error.status === 403 || error.message.includes('Account not verified')) {
        setMode('verify')
        setSuccessMsg('Your account is not verified. Please check your email for the OTP.')
        setLoading(false)
        return
      }

      // Better error messages
      if (error.message.includes('503')) {
        errorMessage = 'Backend services unavailable. Make sure all services are running.'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot reach API Gateway. Is it running on http://localhost:8080?'
      } else if (error.status === 409 || error.message.includes('already exists')) {
        errorMessage = 'Username or email already registered'
      } else if (error.status === 401 || error.message.includes('credentials')) {
        errorMessage = 'Invalid username or password'
      } else if (error.message.includes('Invalid OTP')) {
        errorMessage = 'The OTP entered is invalid. Please try again.'
      }

      setErrors({ submit: errorMessage })
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setErrors({})
    try {
      await authAPI.resendOtp(formData.username)
      setSuccessMsg('A new OTP has been sent to your email.')
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to resend OTP' })
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setErrors({})
    setSuccessMsg('')
    setFormData({ username: '', email: '', password: '', confirmPassword: '', otp: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy2 to-navy flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-serif font-bold text-white mb-2"
          >
            Mailforge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm"
          >
            Enterprise Email Security Platform
          </motion.p>
        </div>

        {/* Auth Card */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          {/* Mode Tabs */}
          {mode !== 'verify' && (
            <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => mode !== 'login' && toggleMode()}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${mode === 'login'
                  ? 'bg-brand-gold text-navy shadow-lg'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => mode !== 'register' && toggleMode()}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${mode === 'register'
                  ? 'bg-brand-gold text-navy shadow-lg'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === 'verify' && (
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">Verify Account</h2>
              <p className="text-sm text-gray-300">
                Enter the OTP sent to your email to verify your account.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'verify' ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  One-Time Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors text-center tracking-[0.5em] font-mono text-lg ${errors.otp ? 'border-red-500/50' : ''
                      }`}
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-400 text-xs mt-2 text-center">{errors.otp}</p>
                )}
              </motion.div>
            ) : (
              <>
                {/* Username/Email Field - Email for Register, Username for Login */}
                {mode === 'register' ? (
                  <>
                    {/* Username for Register */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Choose your MailForge ID
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="username"
                          className={`w-full pl-10 pr-[140px] py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors ${errors.username ? 'border-red-500/50' : ''
                            }`}
                        />
                        <span className="absolute right-4 text-gray-400 font-medium pointer-events-none">
                          @mailforge.com
                        </span>
                      </div>
                      {errors.username && (
                        <p className="text-red-400 text-xs mt-2">{errors.username}</p>
                      )}
                    </motion.div>

                    {/* Email Field - Register Only */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Recovery Email Address (For OTP)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={`w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors ${errors.email ? 'border-red-500/50' : ''
                            }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-2">{errors.email}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Username for Login */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Enter username"
                          className={`w-full pl-10 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors ${errors.username ? 'border-red-500/50' : ''
                            }`}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-red-400 text-xs mt-2">{errors.username}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors ${errors.password ? 'border-red-500/50' : ''
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-2">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password - Register Only */}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-12 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors ${errors.confirmPassword ? 'border-red-500/50' : ''
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-2">{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}
              </>
            )}

            {/* Submit Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
              >
                <p className="text-red-400 text-sm text-center">{errors.submit}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg"
              >
                <p className="text-green-400 text-sm text-center">{successMsg}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-gold to-brand-gold/90 text-navy rounded-lg font-semibold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              )}
              {loading
                ? 'Processing...'
                : mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                    ? 'Create Account'
                    : 'Verify Account'}
            </motion.button>
          </form>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-gray-400 text-sm mt-6"
          >
            {mode === 'verify' ? (
              <>
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOtp}
                  className="text-brand-gold font-semibold hover:text-brand-gold/80 transition-colors"
                >
                  Resend OTP
                </button>
              </>
            ) : mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="text-brand-gold font-semibold hover:text-brand-gold/80 transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  className="text-brand-gold font-semibold hover:text-brand-gold/80 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
            
            {mode === 'verify' && (
              <div className="mt-4">
                <button
                  onClick={() => setMode('login')}
                  className="text-gray-500 hover:text-white transition-colors text-xs"
                >
                  Return to Login
                </button>
              </div>
            )}
          </motion.p>
        </motion.div>

        {/* Security Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-500 mt-8"
        >
          🔒 Your credentials are protected by 256-bit AES encryption
        </motion.p>
      </motion.div>
    </div>
  )
}
