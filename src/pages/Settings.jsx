import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Lock,
  Globe,
  Database,
  Copy,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Mail,
  Shield,
  PenTool
} from 'lucide-react'
import { userAPI } from '../services/api'

export default function SettingsPage({ user, onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('mail')
  const [theme, setTheme] = useState('dark')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Real Mail Settings state
  const [mailSettings, setMailSettings] = useState({
    autoArchive: false,
    autoReply: false,
    autoReplyMessage: '',
    encryptionEnabled: true,
    signatureEnabled: false,
    signature: ''
  })

  // Mock API Keys for UI completeness
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production Key',
      key: 'mf_live_xxxxxxxxxxxxxxxx',
      created: '2025-03-01',
      lastUsed: '2025-03-17',
    },
  ])
  const [apiKeyName, setApiKeyName] = useState('')

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Fetch Mail Settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      try {
        setLoading(true)
        const response = await userAPI.getSettings(user.id)
        const data = response.data || response
        if (data) {
          setMailSettings({
            autoArchive: data.autoArchive || false,
            autoReply: data.autoReply || false,
            autoReplyMessage: data.autoReplyMessage || '',
            encryptionEnabled: data.encryptionEnabled || false,
            signatureEnabled: data.signatureEnabled || false,
            signature: data.signature || ''
          })
        }
      } catch (err) {
        console.error('Failed to load settings', err)
        setError('Failed to load your mail configuration.')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [user])

  // Save Mail Settings
  const handleSaveMailSettings = async () => {
    if (!user?.id) return;
    try {
      setLoading(true)
      setError('')
      await userAPI.updateSettings(user.id, mailSettings)
      showSuccess('Mail configuration saved successfully!')
    } catch (err) {
      console.error('Failed to save settings', err)
      setError(err.message || 'Failed to save mail configuration.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Mail Settings Toggle
  const handleToggleMailSetting = (key) => {
    setMailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleGenerateApiKey = () => {
    if (!apiKeyName.trim()) {
      alert('Please enter a name for the API key')
      return
    }

    const newKey = {
      id: Date.now(),
      name: apiKeyName,
      key: 'mf_live_' + Math.random().toString(36).substr(2, 18),
      created: new Date().toISOString().split('T')[0],
      lastUsed: '-',
    }

    setApiKeys((prev) => [...prev, newKey])
    setApiKeyName('')
    showSuccess(`API key "${apiKeyName}" generated successfully!`)
  }

  const handleDeleteApiKey = (id) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== id))
    showSuccess('API key deleted')
  }

  const handleCopyApiKey = (key) => {
    navigator.clipboard.writeText(key)
    showSuccess('API key copied to clipboard!')
  }

  const tabs = [
    { id: 'mail', label: 'Mail Config', icon: Mail },
    { id: 'api', label: 'API Keys', icon: Lock },
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
              <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                <SettingsIcon className="w-8 h-8" />
                Settings
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage your Mailforge account preferences
              </p>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
               >
                 Back to Dashboard
               </button>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-6 mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-6 mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tab Navigation */}
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
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              {/* Mail Settings */}
              {activeTab === 'mail' && (
                <motion.div
                  key="mail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6">
                      Mail Configuration
                    </h2>

                    <div className="space-y-6">
                      {/* Toggles */}
                      <div className="space-y-4">
                        {[
                          {
                            key: 'autoArchive',
                            title: 'Auto Archive',
                            description: 'Automatically archive old emails to save space',
                            icon: Archive
                          },
                          {
                            key: 'encryptionEnabled',
                            title: 'End-to-End Encryption',
                            description: 'Encrypt outgoing emails by default',
                            icon: Shield
                          },
                          {
                            key: 'autoReply',
                            title: 'Auto Reply',
                            description: 'Send automatic responses when away',
                            icon: RefreshCw
                          },
                          {
                            key: 'signatureEnabled',
                            title: 'Email Signature',
                            description: 'Append signature to outgoing emails',
                            icon: PenTool
                          }
                        ].map((setting) => (
                          <motion.button
                            key={setting.key}
                            whileHover={{ scale: 1.01, x: 4 }}
                            onClick={() => handleToggleMailSetting(setting.key)}
                            className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-start gap-4">
                                <div className="mt-1 text-gray-400 group-hover:text-brand-gold transition-colors">
                                  <setting.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-white group-hover:text-brand-gold transition-colors">
                                    {setting.title}
                                  </p>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {setting.description}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${
                                  mailSettings[setting.key]
                                    ? 'bg-brand-gold'
                                    : 'bg-gray-500'
                                }`}
                              >
                                <motion.div
                                  animate={{
                                    x: mailSettings[setting.key] ? 24 : 2,
                                  }}
                                  className="w-5 h-5 bg-white rounded-full mt-0.5 ml-0.5"
                                />
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Auto Reply Message Input */}
                      {mailSettings.autoReply && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-4"
                        >
                          <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Auto Reply Message
                          </label>
                          <textarea
                            value={mailSettings.autoReplyMessage}
                            onChange={(e) => setMailSettings(prev => ({ ...prev, autoReplyMessage: e.target.value }))}
                            placeholder="I'm out of the office right now..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-gold transition-colors resize-none h-24"
                            maxLength={1000}
                          />
                        </motion.div>
                      )}

                      {/* Signature Input */}
                      {mailSettings.signatureEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-4"
                        >
                          <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Your Signature
                          </label>
                          <textarea
                            value={mailSettings.signature}
                            onChange={(e) => setMailSettings(prev => ({ ...prev, signature: e.target.value }))}
                            placeholder="Best regards,..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-gold transition-colors resize-none h-24"
                            maxLength={500}
                          />
                        </motion.div>
                      )}

                      <div className="pt-6 border-t border-white/10 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveMailSettings}
                          disabled={loading}
                          className="px-6 py-2 bg-brand-gold text-navy font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          {loading ? (
                             <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                          ) : 'Save Changes'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* API Keys */}
              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Generate New Key */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6">
                      Generate New API Key
                    </h2>

                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Enter API key name (e.g., Production, Staging)"
                        value={apiKeyName}
                        onChange={(e) => setApiKeyName(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerateApiKey}
                        className="px-6 py-3 bg-brand-gold text-navy rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        Generate
                      </motion.button>
                    </div>

                    <p className="text-gray-400 text-sm mt-4">
                      💡 Keep your API keys secret! Never share them publicly or commit them to version control.
                    </p>
                  </div>

                  {/* Active API Keys */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6">
                      Active API Keys
                    </h2>

                    {apiKeys.length === 0 ? (
                      <div className="text-center py-12">
                        <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No API keys generated yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <motion.div
                            key={key.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white/5 border border-white/10 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="font-semibold text-white">
                                  {key.name}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                  Created: {key.created} · Last used: {key.lastUsed}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleDeleteApiKey(key.id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-navy/50 rounded-lg">
                              <code className="flex-1 text-yellow-300 font-mono text-sm">
                                {key.key}
                              </code>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCopyApiKey(key.key)}
                                className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                              >
                                <Copy className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
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
