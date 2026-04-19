import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 glass border-b border-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate ? onNavigate('home') : null}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="MailForge Logo" className="w-10 h-10 object-contain rounded-xl" />
          <span className={`text-xl font-bold font-serif ${isScrolled ? 'text-navy' : 'text-white'}`}>
            Mailforge
          </span>
        </button>

        {/* Center Links */}
        <div className={`hidden md:flex gap-8 ${isScrolled ? 'text-navy' : 'text-white'}`}>
          {['Features', 'Architecture', 'Security', 'Docs'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={`font-medium text-sm transition-all duration-300 hover:${isScrolled ? 'text-brand-blue' : 'text-brand-gold'}`}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('auth')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            isScrolled
              ? 'text-navy border-2 border-navy hover:bg-navy hover:text-white'
              : 'text-white border-2 border-white hover:bg-white hover:text-navy'
          }`}
          >
            Sign in
          </button>
          <button
            onClick={() => onNavigate('auth')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
            isScrolled
              ? 'bg-navy text-white hover:shadow-lg'
              : 'bg-navy text-white hover:shadow-lg'
          }`}
          >
            Get started <span>→</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
