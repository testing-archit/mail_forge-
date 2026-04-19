import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CryptoJS from 'crypto-js'
import {
  Send,
  Plus,
  Search,
  Archive,
  Trash2,
  Star,
  ArrowLeft,
  Paperclip,
  Reply,
  Download,
  Clock,
  Mail,
  RefreshCcw,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Key
} from 'lucide-react'
import { emailAPI } from '../services/api'

const ENCRYPTION_MARKER_START = '-----BEGIN MAILFORGE ENCRYPTED MESSAGE-----'
const ENCRYPTION_MARKER_END = '-----END MAILFORGE ENCRYPTED MESSAGE-----'

export default function EmailClient({ user, onNavigate }) {
  const [currentView, setCurrentView] = useState('inbox') // 'inbox', 'detail', 'compose'
  const [activeFolder, setActiveFolder] = useState('inbox') // 'inbox', 'sent'
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState([])
  
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
  })

  // Security & Encryption States
  const [encryptEmail, setEncryptEmail] = useState(false)
  const [encryptionPassword, setEncryptionPassword] = useState('')
  
  // Decryption States
  const [decryptPassword, setDecryptPassword] = useState('')
  const [decryptedBody, setDecryptedBody] = useState(null)
  const [decryptionError, setDecryptionError] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [integrityStatus, setIntegrityStatus] = useState('loading') // loading, verified, failed

  // Derived Mail ID
  const userMailId = user?.username ? `${user.username}@mailforge.com` : user?.email

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Generate avatar letters
  const getAvatar = (email) => {
    if (!email) return '?'
    return email.substring(0, 2).toUpperCase()
  }

  const loadEmails = async (folder = activeFolder) => {
    if (!user || !user.id) return

    try {
      setLoading(true)
      let response
      if (folder === 'sent') {
        response = await emailAPI.getSentItems(user.id)
      } else {
        response = await emailAPI.getInbox(user.id)
      }
      
      const responseData = response.data || []
      const emailList = Array.isArray(responseData) ? responseData : responseData.content || []
      setEmails(emailList)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load emails:', error)
      setLoading(false)
    }
  }

  // Load emails on mount and when folder changes
  useEffect(() => {
    loadEmails(activeFolder)
  }, [activeFolder, user])

  // Listen for new mail SSE events
  useEffect(() => {
    const handleNewMail = () => {
      // Refresh the inbox silently when we get a new mail notification
      if (activeFolder === 'inbox') {
         loadEmails('inbox')
      }
    }
    window.addEventListener('mailforge:new_mail', handleNewMail)
    return () => window.removeEventListener('mailforge:new_mail', handleNewMail)
  }, [activeFolder, user])

  const handleSelectEmail = async (email) => {
    // Reset decryption and security states
    setDecryptedBody(null)
    setDecryptPassword('')
    setDecryptionError(false)
    setIsEncrypted(false)
    setIntegrityStatus('loading')

    // If not read, mark it as read
    if (!email.isRead && activeFolder === 'inbox') {
      try {
        await emailAPI.markAsRead(email.id)
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
        )
      } catch (err) {
        console.error('Failed to mark as read', err)
      }
    }
    
    try {
      setLoading(true)
      const fullEmailData = await emailAPI.getEmail(email.id)
      const data = fullEmailData.data || fullEmailData
      setSelectedEmail(data)
      setCurrentView('detail')

      // Check for encryption marker
      const bodyContent = data.body || data.content || ''
      if (bodyContent.includes(ENCRYPTION_MARKER_START)) {
        setIsEncrypted(true)
      }

      // Verify Integrity
      try {
        const verifyRes = await emailAPI.verifyIntegrity(email.id)
        const vData = verifyRes.data || verifyRes
        if (vData.isVerified) {
          setIntegrityStatus('verified')
        } else {
          setIntegrityStatus('failed')
        }
      } catch (verifyErr) {
        console.error('Integrity check failed', verifyErr)
        setIntegrityStatus('failed')
      }

    } catch (err) {
      console.error('Failed to load full email details', err)
      // Fallback to list item data
      setSelectedEmail(email)
      setCurrentView('detail')
      setIntegrityStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrypt = () => {
    if (!decryptPassword) return
    const bodyContent = selectedEmail.body || selectedEmail.content || ''
    
    try {
      // Extract cipher text
      const cipherMatch = bodyContent.match(new RegExp(`${ENCRYPTION_MARKER_START}\\n([\\s\\S]*?)\\n${ENCRYPTION_MARKER_END}`))
      if (cipherMatch && cipherMatch[1]) {
        const cipherText = cipherMatch[1]
        const bytes = CryptoJS.AES.decrypt(cipherText, decryptPassword)
        const originalText = bytes.toString(CryptoJS.enc.Utf8)
        
        if (originalText) {
          setDecryptedBody(originalText)
          setDecryptionError(false)
        } else {
          setDecryptionError(true) // Decryption failed (wrong password)
        }
      } else {
         setDecryptionError(true)
      }
    } catch (err) {
      console.error('Decryption failed', err)
      setDecryptionError(true)
    }
  }

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body) {
      alert('Please fill in all fields')
      return
    }

    if (encryptEmail && !encryptionPassword) {
      alert('Please enter an encryption passphrase, or disable encryption.')
      return
    }

    let payloadBody = composeData.body

    if (encryptEmail) {
      try {
        const cipherText = CryptoJS.AES.encrypt(composeData.body, encryptionPassword).toString()
        payloadBody = `${ENCRYPTION_MARKER_START}\n${cipherText}\n${ENCRYPTION_MARKER_END}`
      } catch (err) {
        alert('Failed to encrypt message: ' + err.message)
        return
      }
    }

    try {
      setLoading(true)
      await emailAPI.sendEmail(
        userMailId,
        composeData.to,
        composeData.subject,
        payloadBody,
        false
      )
      
      setComposeData({ to: '', subject: '', body: '' })
      setEncryptEmail(false)
      setEncryptionPassword('')
      setCurrentView('inbox')
      setActiveFolder('sent') // Switch to sent folder
    } catch (error) {
      alert('Failed to send email: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmail = async (id) => {
    try {
      setLoading(true)
      await emailAPI.deleteEmail(id)
      setEmails((prev) => prev.filter((e) => e.id !== id))
      setSelectedEmail(null)
      setCurrentView('inbox')
    } catch (error) {
      alert('Failed to delete email: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Search filtering
  const filteredEmails = emails.filter(e => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (e.subject && e.subject.toLowerCase().includes(searchLower)) ||
      (e.fromAddress && e.fromAddress.toLowerCase().includes(searchLower)) ||
      (e.toAddress && e.toAddress.toLowerCase().includes(searchLower))
    )
  })

  const unreadCount = emails.filter((e) => !e.isRead).length

  return (
    <div className="h-screen bg-gradient-to-br from-navy via-navy2 to-navy flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center z-20 relative"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2">
            <Mail className="w-8 h-8 text-brand-gold" />
            Mailforge Mail
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setCurrentView('compose')
            setSelectedEmail(null)
            setEncryptEmail(false)
            setEncryptionPassword('')
          }}
          className="px-6 py-2 bg-brand-gold text-navy rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Compose
        </motion.button>
      </motion.div>

      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Sidebar */}
        {currentView !== 'compose' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 overflow-y-auto flex flex-col"
          >
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors text-sm"
                />
              </div>
            </div>

            {/* Folders */}
            <div className="p-4 space-y-2 flex-1">
              {[
                { id: 'inbox', label: 'Inbox', count: activeFolder === 'inbox' ? unreadCount : 0, icon: Mail },
                { id: 'starred', label: 'Starred', count: 0, icon: Star },
                { id: 'sent', label: 'Sent', count: 0, icon: Send },
                { id: 'archive', label: 'Archive', count: 0, icon: Archive },
                { id: 'trash', label: 'Trash', count: 0, icon: Trash2 },
              ].map((folder) => (
                <motion.button
                  key={folder.id}
                  onClick={() => {
                    if (folder.id === 'inbox' || folder.id === 'sent') {
                      setActiveFolder(folder.id)
                      setCurrentView('inbox')
                    } else {
                      alert('Folder not yet implemented')
                    }
                  }}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeFolder === folder.id
                      ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/50'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <folder.icon className="w-5 h-5" />
                  <span className="flex-1 text-left font-semibold">{folder.label}</span>
                  {folder.count > 0 && (
                    <span className="bg-brand-gold/30 text-brand-gold text-xs font-bold px-2 py-1 rounded-full">
                      {folder.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Account Info */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <p className="text-xs text-brand-gold mb-1 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure Mail ID
              </p>
              <p className="text-sm font-bold text-white truncate">{userMailId}</p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
            </div>
          )}

          {currentView === 'inbox' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-semibold text-white capitalize">{activeFolder}</h2>
                <button 
                  onClick={() => loadEmails()} 
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Refresh"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
                {filteredEmails.length === 0 && !loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No emails found</p>
                    </div>
                  </div>
                ) : (
                  <motion.div layout>
                    {filteredEmails.map((email, index) => (
                      <motion.button
                        key={email.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        whileHover={{ x: 4 }}
                        onClick={() => handleSelectEmail(email)}
                        className={`w-full px-6 py-4 border-b border-white/10 text-left transition-all hover:bg-white/5 ${
                          !email.isRead && activeFolder === 'inbox' ? 'bg-white/5 border-l-4 border-l-brand-gold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-brand-blue/20 text-brand-blue`}
                          >
                            {getAvatar(activeFolder === 'inbox' ? email.fromAddress : email.toAddress)}
                          </div>

                          {/* Email Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`font-semibold truncate ${
                                  !email.isRead && activeFolder === 'inbox' ? 'text-white' : 'text-gray-300'
                                }`}
                              >
                                {activeFolder === 'inbox' ? email.fromAddress : `To: ${email.toAddress}`}
                              </p>
                              {email.attachments?.length > 0 && (
                                <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              )}
                            </div>
                            <p
                              className={`text-sm truncate mb-1 flex items-center gap-2 ${
                                !email.isRead && activeFolder === 'inbox'
                                  ? 'font-semibold text-gray-200'
                                  : 'text-gray-500'
                              }`}
                            >
                              {email.subject || '(No Subject)'}
                            </p>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <span className="text-xs text-gray-500 min-w-fit">
                              {formatDate(email.receivedAt)}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'detail' && selectedEmail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col bg-white/5 overflow-y-auto"
            >
              {/* Detail Header */}
              <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 backdrop-blur-xl z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentView('inbox')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </motion.button>

                <div className="flex items-center gap-4">
                  {/* Integrity Badge */}
                  {integrityStatus === 'verified' && (
                    <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-bold border border-green-400/20">
                      <ShieldCheck className="w-4 h-4" />
                      Integrity Verified
                    </div>
                  )}
                  {integrityStatus === 'failed' && (
                    <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-bold border border-red-400/20">
                      <ShieldAlert className="w-4 h-4" />
                      Verification Failed
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDeleteEmail(selectedEmail.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </motion.button>
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
                {/* From & Subject */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center font-bold text-xl text-brand-blue">
                      {getAvatar(selectedEmail.fromAddress)}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {selectedEmail.fromAddress}
                      </p>
                      <p className="text-gray-400 text-sm">
                        to {selectedEmail.toAddress}
                      </p>
                      <p className="text-gray-500 text-xs flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(selectedEmail.receivedAt)}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-3xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                    {isEncrypted && <Lock className="w-6 h-6 text-brand-gold" />}
                    {selectedEmail.subject || '(No Subject)'}
                  </h2>
                </div>

                {/* Email Body */}
                <div className={`border rounded-xl p-6 ${isEncrypted && !decryptedBody ? 'bg-black/30 border-brand-gold/30' : 'bg-white/5 border-white/10'}`}>
                  {isEncrypted && !decryptedBody ? (
                    <div className="text-center py-8">
                      <Lock className="w-16 h-16 text-brand-gold mx-auto mb-4 opacity-80" />
                      <h3 className="text-xl font-bold text-white mb-2">End-to-End Encrypted Message</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        This message is secured with AES encryption. Please enter the passphrase to decrypt and read the contents.
                      </p>
                      <div className="max-w-sm mx-auto flex flex-col gap-3">
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input 
                            type="password"
                            placeholder="Decryption Passphrase"
                            value={decryptPassword}
                            onChange={(e) => setDecryptPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors text-center"
                          />
                        </div>
                        {decryptionError && (
                          <p className="text-red-400 text-sm font-semibold">Incorrect passphrase or corrupted data.</p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDecrypt}
                          className="w-full py-3 bg-brand-gold text-navy font-bold rounded-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all flex justify-center items-center gap-2"
                        >
                          <Unlock className="w-5 h-5" /> Decrypt Message
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed overflow-x-auto">
                      {decryptedBody || selectedEmail.body || selectedEmail.content || 'No content.'}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Download className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300 font-semibold flex-1 text-left truncate">
                            {attachment.name || attachment}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setComposeData({
                      to: selectedEmail.fromAddress,
                      subject: `Re: ${selectedEmail.subject}`,
                      body: `\n\n--- Original Message ---\nFrom: ${selectedEmail.fromAddress}\nDate: ${selectedEmail.receivedAt}\n\n${decryptedBody || selectedEmail.body || selectedEmail.content || ''}`
                    })
                    setCurrentView('compose')
                  }}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-all mt-4"
                >
                  <Reply className="w-5 h-5" />
                  Reply
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentView === 'compose' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col bg-white/5 overflow-y-auto"
            >
              {/* Compose Header */}
              <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                  New Message
                  {encryptEmail && (
                    <span className="bg-brand-gold/20 text-brand-gold text-xs px-2 py-1 rounded-full border border-brand-gold/30 flex items-center gap-1 uppercase tracking-wider font-bold">
                      <Lock className="w-3 h-3" /> E2E Encrypted
                    </span>
                  )}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentView('inbox')}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  ✕
                </motion.button>
              </div>

              {/* Compose Form */}
              <div className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col">
                {/* Security Toggle */}
                <div className="mb-6 p-4 bg-black/20 border border-white/10 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${encryptEmail ? 'bg-brand-gold text-navy' : 'bg-white/10 text-gray-400'}`}>
                        {encryptEmail ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                     </div>
                     <div>
                       <h3 className="text-white font-bold">End-to-End Encryption</h3>
                       <p className="text-gray-400 text-sm">Secure your message with AES encryption</p>
                     </div>
                   </div>
                   
                   {/* Toggle Switch */}
                   <button
                    onClick={() => {
                      setEncryptEmail(!encryptEmail)
                      if (encryptEmail) setEncryptionPassword('')
                    }}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${
                      encryptEmail ? 'bg-brand-gold' : 'bg-gray-500'
                    }`}
                   >
                     <motion.div
                      animate={{ x: encryptEmail ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full mt-0.5 absolute top-0 left-0 shadow-sm"
                     />
                   </button>
                </div>

                {/* Password Input for Encryption */}
                {encryptEmail && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-semibold text-brand-gold mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4" /> Encryption Passphrase
                    </label>
                    <input
                      type="password"
                      placeholder="Enter a secret passphrase (share out of band)"
                      value={encryptionPassword}
                      onChange={(e) => setEncryptionPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-gold/5 border border-brand-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      The recipient MUST have this exact passphrase to read the email. Do not forget it.
                    </p>
                  </motion.div>
                )}

                <div className="space-y-4 flex-1">
                  <div>
                    <input
                      type="email"
                      placeholder="To (comma separated for multiple)"
                      value={composeData.to}
                      onChange={(e) =>
                        setComposeData((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors text-lg"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={composeData.subject}
                      onChange={(e) =>
                        setComposeData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <textarea
                    placeholder={encryptEmail ? "Write your secret message..." : "Write your message..."}
                    value={composeData.body}
                    onChange={(e) =>
                      setComposeData((prev) => ({
                        ...prev,
                        body: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none flex-1 min-h-[300px]"
                  />
                </div>

                {/* Compose Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 pb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-2 text-gray-400 hover:text-gray-300 transition-colors cursor-not-allowed opacity-50"
                    title="Attachments coming soon"
                  >
                    <Paperclip className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendEmail}
                    disabled={loading}
                    className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 ${
                      encryptEmail 
                        ? 'bg-brand-gold text-navy shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
                        : 'bg-white text-navy'
                    }`}
                  >
                    {encryptEmail ? <Lock className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                    {loading ? 'Sending...' : (encryptEmail ? 'Encrypt & Send' : 'Send')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
