import { motion } from 'framer-motion'

const stats = [
  { number: '256-bit', label: 'AES encryption at rest' },
  { number: '<10ms', label: 'hash generation per email' },
  { number: '100%', label: 'tamper detection rate' },
  { number: '~$0', label: 'blockchain tx cost (Polygon)' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
}

export default function StatsBar() {
  return (
    <section className="bg-navy py-20 border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-12"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={item} className="text-center md:text-left">
              <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                <span className="text-brand-gold">{stat.number}</span>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
