import { motion } from 'framer-motion'

const threats = [
  {
    title: 'Transit Interception',
    solution: 'All connections TLS 1.3 enforced. STARTTLS on SMTP.',
    icon: '🔗',
  },
  {
    title: 'Server Compromise',
    solution: 'AES-256 at-rest encryption. Keys never touch disk unencrypted.',
    icon: '🏦',
  },
  {
    title: 'Email Tampering',
    solution: 'SHA-256 hash on blockchain. Immutable audit trail.',
    icon: '🚨',
  },
  {
    title: 'Identity Spoofing',
    solution: 'SPF/DKIM/DMARC validation. Sender verification mandatory.',
    icon: '✅',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-brand-gold font-semibold mb-2">SECURITY FIRST</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-4">
            Defense against modern threats
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Multi-layered security architecture. Zero trust assumptions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Threat Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {threats.map((threat, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="p-6 rounded-lg border border-gray-200 bg-gray-50 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{threat.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-navy mb-2">{threat.title}</h3>
                    <p className="text-gray-600 text-sm">{threat.solution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right - Security Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-8 rounded-lg bg-navy text-white border border-gray-700"
          >
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-green-500"
                />
                <span className="font-semibold">System Status: Online</span>
              </div>

              {/* Hash Display */}
              <div>
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Last Email Hash
                </div>
                <div className="font-mono text-xs text-brand-gold break-all">
                  0x7a3d2f8c9e1b4a6f5d2c8e3a7f9b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
                </div>
              </div>

              {/* Merkle Root */}
              <div>
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Merkle Root
                </div>
                <div className="font-mono text-xs text-brand-gold break-all">
                  0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f
                </div>
              </div>

              {/* Polygon Tx */}
              <div>
                <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Polygon Transaction
                </div>
                <div className="font-mono text-xs text-brand-gold break-all">
                  0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a
                </div>
              </div>

              {/* Block Info */}
              <div className="flex items-center gap-2 text-sm pt-4 border-t border-gray-600">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span>Anchored to Polygon · block #48,291,042</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
