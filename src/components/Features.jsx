import { motion } from 'framer-motion'

const features = [
  {
    title: 'End-to-End Encryption',
    description: 'All emails encrypted at rest with AES-256-GCM. Only recipients hold decryption keys.',
    tech: 'TweetNaCl.js',
    icon: '🔐',
  },
  {
    title: 'Blockchain Integrity',
    description: 'Every email hashed and anchored to Polygon. Tamper-proof audit trail forever.',
    tech: 'Polygon',
    icon: '⛓️',
  },
  {
    title: 'Email Authentication',
    description: 'Full SPF/DKIM/DMARC validation. Prevents spoofing at every layer.',
    tech: 'Postfix',
    icon: '✓',
  },
  {
    title: 'Microservice Architecture',
    description: 'Horizontal scaling. Auth, Mail, and User services independently deployed.',
    tech: 'Spring Boot 3',
    icon: '🏗️',
  },
  {
    title: 'Rate Limiting & DDoS Protection',
    description: 'Intelligent throttling prevents abuse. Redis-backed session management.',
    tech: 'Redis',
    icon: '🛡️',
  },
  {
    title: 'Maildir + PostgreSQL',
    description: 'Standard-compliant storage. Drop-in compatible with any IMAP client.',
    tech: 'PostgreSQL',
    icon: '📦',
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

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-brand-gold font-semibold mb-2">POWERFUL FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-4">
            Enterprise-grade infrastructure
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mailforge combines cutting-edge cryptography with proven enterprise patterns.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={item}
              whileHover={{ y: -8 }}
              className="p-8 rounded-xl border border-gray-200 bg-white hover:border-brand-blue/40 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              
              <h3 className="text-xl font-serif font-bold text-navy mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="inline-block px-3 py-1 bg-navy/10 text-navy text-xs font-semibold rounded-full">
                {feature.tech}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
