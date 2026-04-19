import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-navy2 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-12 mb-12"
        >
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-navy" />
              <span className="text-xl font-bold font-serif text-white">Mailforge</span>
            </div>
            <p className="text-sm text-gray-400">
              Enterprise mail, cryptographically secured.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-serif font-bold text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Features', 'Pricing', 'Security', 'Enterprise'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="font-serif font-bold text-white mb-4">Developers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Documentation', 'API Docs', 'GitHub', 'Community'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-serif font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {['About', 'Blog', 'Contact', 'Status'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="pt-12 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400"
        >
          <p>© 2025 Mailforge · akshatrastogi.co.in</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
