import { motion } from 'framer-motion'
import MailClientMockup from './MailClientMockup'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
}

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-navy via-navy2 to-navy pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column - Text */}
          <motion.div variants={item} className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/30 w-fit"
            >
              <div className="w-2 h-2 rounded-full bg-brand-gold" />
              <span className="text-sm font-medium text-brand-gold">
                Blockchain-verified mail infrastructure
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={item}>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight">
                Enterprise mail,{' '}
                <span className="italic text-brand-blue">cryptographically</span>{' '}
                secured.
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p variants={item} className="text-lg text-gray-300 max-w-md leading-relaxed">
              Mailforge is a self-hosted, blockchain-verified mail server that combines military-grade encryption with cryptographic proof of email integrity. No vendor lock-in. No privacy compromises.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-navy rounded-lg font-semibold font-serif text-lg hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                Get Started →
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold font-serif text-lg hover:bg-white/10 transition-all duration-300 active:scale-95">
                Read Documentation
              </button>
            </motion.div>

            {/* Trust Line */}
            <motion.div variants={item} className="flex items-center gap-4 pt-8">
              <div className="flex -space-x-3">
                {['AS', 'MK', 'RP'].map((initials, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-full bg-brand-gold/20 border-2 border-navy2 flex items-center justify-center text-sm font-bold text-brand-gold"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Built on open standards · Fedora · Spring Boot 3
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Mockup */}
          <motion.div variants={item} className="relative">
            <MailClientMockup />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
