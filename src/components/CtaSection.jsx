import { motion } from 'framer-motion'

export default function CtaSection({ onGetStarted }) {
  return (
    <section className="py-20 bg-gradient-to-br from-navy to-navy2 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-6 text-center relative z-10"
      >
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
          Ready to secure your{' '}
          <span className="italic text-brand-gold">enterprise</span> mail?
        </h2>

        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of security-conscious organizations using Mailforge to protect their communication infrastructure.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-8 py-4 bg-brand-gold text-navy rounded-lg font-semibold font-serif text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            Get Started →
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold font-serif text-lg hover:bg-white/10 transition-all duration-300"
          >
            Read the Docs
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm text-gray-400 mt-8"
        >
          No credit card required · Self-hosted · 100% open standards
        </motion.p>
      </motion.div>
    </section>
  )
}
