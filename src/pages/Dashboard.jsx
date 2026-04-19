import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Lock,
  Bell,
  Settings,
  LogOut,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { userAPI } from '../services/api'

export default function Dashboard({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Loading...',
    email: user?.email || 'Loading...',
    bio: 'Security-conscious developer',
    phone: '+91 98765 43210',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    loginAlerts: true,
    securityUpdates: true,
    productUpdates: false,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    sessionTimeout: 60,
    loginNotifications: true,
  })

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await userAPI.getProfile()
        setProfileData({
          name: response.name || user?.name,
          email: response.email || user?.email,
          bio: response.bio || 'Security-conscious developer',
          phone: response.phone || '+91 98765 43210',
        })
        setLoading(false)
      } catch (error) {
        console.error('Failed to load profile:', error)
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await userAPI.updateProfile(profileData)
      setSuccessMessage('Profile updated successfully!')
      setEditMode(false)
      setLoading(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setSuccessMessage('')
      alert('Failed to update profile: ' + error.message)
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    try {
      setLoading(true)
      await userAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      setSuccessMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setLoading(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setSuccessMessage('')
      alert('Failed to change password: ' + error.message)
      setLoading(false)
    }
  }

  const toggleNotification = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy2 to-navy">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, {profileData.name}! 👋
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400"
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/50'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{tab.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4"
              >
                <h3 className="font-serif font-bold text-white text-lg">Account Status</h3>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Member Since</p>
                  <p className="text-white font-semibold">March 15, 2025</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Plan</p>
                  <p className="text-brand-gold font-semibold">Professional</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Status</p>
                  <p className="text-green-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-serif font-bold text-white">
                      Profile Information
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditMode(!editMode)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        editMode
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30'
                      }`}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Bio
                      </label>
                      <input
                        type="text"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  {editMode && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      className="mt-8 px-6 py-3 bg-brand-gold text-navy rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Change Password */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6">
                      Change Password
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-gold transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-gold transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-gold transition-colors"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleChangePassword}
                        className="mt-6 px-6 py-3 bg-brand-gold text-navy rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        Update Password
                      </motion.button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-white mb-2">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          securitySettings.twoFactor
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {securitySettings.twoFactor ? 'Enabled' : 'Disabled'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Login Notifications */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-white mb-2">
                          Login Notifications
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Get alerts when someone logs into your account
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            loginNotifications: !prev.loginNotifications,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          securitySettings.loginNotifications
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {securitySettings.loginNotifications ? 'On' : 'Off'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8"
                >
                  <h2 className="text-2xl font-serif font-bold text-white mb-8">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'emailNotifications',
                        title: 'Email Notifications',
                        description: 'Receive important updates and alerts via email',
                      },
                      {
                        key: 'loginAlerts',
                        title: 'Login Alerts',
                        description: 'Get notified of new login attempts',
                      },
                      {
                        key: 'securityUpdates',
                        title: 'Security Updates',
                        description: 'Receive security patches and vulnerability alerts',
                      },
                      {
                        key: 'productUpdates',
                        title: 'Product Updates',
                        description: 'Learn about new features and improvements',
                      },
                    ].map((notification) => (
                      <motion.button
                        key={notification.key}
                        whileHover={{ scale: 1.02, x: 4 }}
                        onClick={() => toggleNotification(notification.key)}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white group-hover:text-brand-gold transition-colors">
                              {notification.title}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              {notification.description}
                            </p>
                          </div>
                          <div
                            className={`w-12 h-6 rounded-full transition-all ${
                              notificationSettings[notification.key]
                                ? 'bg-brand-gold'
                                : 'bg-gray-500'
                            }`}
                          >
                            <motion.div
                              animate={{
                                x: notificationSettings[notification.key] ? 24 : 2,
                              }}
                              className="w-5 h-5 bg-white rounded-full mt-0.5 ml-0.5"
                            />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Email Preferences */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <h3 className="text-xl font-serif font-bold text-white mb-6">
                      Email Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">Email Domain</p>
                          <p className="text-gray-400 text-sm">mailforge.com</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-lg hover:bg-brand-gold/30 transition-colors"
                        >
                          Configure
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <h3 className="text-xl font-serif font-bold text-white mb-6">
                      Storage Usage
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <p className="text-gray-400">Emails</p>
                          <p className="text-white font-semibold">2.4 GB / 50 GB</p>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            animate={{ width: '4.8%' }}
                            transition={{ duration: 1 }}
                            className="bg-gradient-to-r from-brand-gold to-brand-blue h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
                    <h3 className="text-xl font-serif font-bold text-red-400 mb-4">
                      Danger Zone
                    </h3>
                    <p className="text-red-300/70 mb-6">
                      Permanent actions that cannot be undone
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-semibold hover:bg-red-500/30 transition-colors"
                    >
                      Delete Account
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
