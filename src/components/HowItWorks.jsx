import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Postfix Intake',
    description: 'Incoming SMTP connection hits Postfix. TLS 1.3 enforced. SPF/DKIM check begins.',
    tech: ['Postfix', 'OpenSSL'],
  },
  {
    number: '02',
    title: 'Auth Service',
    description: 'User verified against PostgreSQL. JWT issued. Session cached in Redis.',
    tech: ['Spring Boot', 'PostgreSQL'],
  },
  {
    number: '03',
    title: 'Kafka Pipeline',
    description: 'Email event published. Broker ensures at-least-once delivery.',
    tech: ['Apache Kafka', 'Spring Cloud'],
  },
  {
    number: '04',
    title: 'Processing & Encryption',
    description: 'Mail Service consumes, encrypts body, generates SHA-256 hash.',
    tech: ['Spring Boot', 'TweetNaCl'],
  },
  {
    number: '05',
    title: 'Blockchain Anchor',
    description: 'Hash submitted to Polygon. Merkle root stored permanently.',
    tech: ['Polygon', 'Web3.js'],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0 },
}

export default function HowItWorks() {
  return (
    <section id="architecture" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-brand-gold font-semibold mb-2">HOW IT WORKS</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-4">
            The email pipeline
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From SMTP intake to blockchain verification—every step is cryptographically sound.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Steps */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={item}
                whileHover={{ x: 8 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-navy text-white flex items-center justify-center font-serif font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-navy mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 bg-brand-blue/10 text-brand-blue rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right - Pipeline Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {[
              { label: 'Postfix', color: 'bg-red-100 text-red-700' },
              { label: 'Auth Service', color: 'bg-blue-100 text-blue-700' },
              { label: 'Kafka', color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Mail Processing', color: 'bg-purple-100 text-purple-700' },
              { label: 'Polygon', color: 'bg-green-100 text-green-700' },
            ].map((box, idx) => (
              <div key={idx}>
                <div className={`p-4 rounded-lg font-semibold text-center ${box.color}`}>
                  {box.label}
                </div>
                {idx < 4 && (
                  <div className="text-center text-gray-400 py-2 font-serif">↓</div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
