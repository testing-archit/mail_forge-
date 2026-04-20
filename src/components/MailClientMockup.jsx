import { motion } from 'framer-motion'

export default function MailClientMockup() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="w-full"
    >
      {/* Browser Window */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Chrome */}
        <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="ml-4 text-xs text-gray-400">architgupta@mailforge.com</div>
        </div>

        {/* Content */}
        <div className="bg-white flex h-96">
          {/* Sidebar */}
          <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-3">
              {[
                { label: 'Inbox', badge: 3 },
                { label: 'Sent', badge: 0 },
                { label: 'Drafts', badge: 0 },
                { label: 'Verified', badge: 0 },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`px-3 py-2 rounded text-sm font-medium flex items-center justify-between ${item.label === 'Inbox'
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Email List */}
          <div className="w-1/3 bg-white border-r border-gray-200 divide-y">
            {[
              { from: 'Alice Chen', subject: 'Q1 Report', preview: 'New quarterly insights...' },
              { from: 'Bob Markus', subject: 'API Integration', preview: 'Ready for deployment...' },
              { from: 'Carol Davis', subject: 'Security Audit', preview: 'Compliance check passed...' },
            ].map((email, idx) => (
              <div
                key={idx}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${idx === 0 ? 'bg-blue-50 border-l-4 border-brand-blue' : ''
                  }`}
              >
                <div className="font-semibold text-sm text-gray-900">{email.from}</div>
                <div className="text-sm text-gray-600 truncate">{email.subject}</div>
                <div className="text-xs text-gray-500 truncate">{email.preview}</div>
              </div>
            ))}
          </div>

          {/* Reading Pane */}
          <div className="w-2/5 bg-white p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-600">Blockchain verified ✓</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-2 text-sm">Q1 Report</div>
              <div className="text-xs text-gray-600 mb-3">
                <div>From: alice@mailforge.io</div>
                <div>To: team@mailforge.io</div>
                <div className="font-mono text-gray-500 mt-1">
                  Hash: 0x7a3d...9f2c
                </div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed text-xs">
                Quarterly performance metrics show 156% growth in security infrastructure...
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
