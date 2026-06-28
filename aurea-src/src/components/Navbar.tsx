import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import MagneticButton from './ui/MagneticButton'
import { Menu, X } from 'lucide-react'

const links = ['Услуги', 'Портфолио', 'Процесс', 'Цены', 'Контакты']

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 2.2, ease: 'power3.out' })

    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const map: Record<string, string> = {
      'Услуги': '#services',
      'Портфолио': '#portfolio',
      'Процесс': '#process',
      'Цены': '#pricing',
      'Контакты': '#contact',
    }
    const el = document.querySelector(map[id] || '#root')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="font-syne font-bold text-xl tracking-[0.15em] text-text-primary hover:text-gold transition-colors duration-300">
            AUREA
          </a>

          {/* Desktop nav */}
          <div className={`hidden md:flex items-center gap-1 glass rounded-full px-3 py-2 transition-all duration-500 ${scrolled ? 'opacity-100' : 'opacity-90'}`}>
            {links.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-text-muted hover:text-text-primary text-sm font-inter px-4 py-1.5 rounded-full hover:bg-surface transition-all duration-200 tracking-wide"
              >
                {link}
              </button>
            ))}
          </div>

          {/* CTA */}
          <MagneticButton>
            <button
              onClick={() => scrollTo('Контакты')}
              className="hidden md:flex items-center gap-2 bg-text-primary text-bg-primary text-sm font-semibold font-inter px-5 py-2.5 rounded-full hover:bg-white transition-all duration-200"
            >
              Обсудить проект
            </button>
          </MagneticButton>

          {/* Mobile burger */}
          <button
            className="md:hidden text-text-primary p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 glass flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {links.map((link) => (
          <button
            key={link}
            onClick={() => scrollTo(link)}
            className="font-syne font-bold text-4xl text-text-primary hover:text-gold transition-colors duration-200"
          >
            {link}
          </button>
        ))}
        <button
          onClick={() => scrollTo('Контакты')}
          className="mt-4 bg-text-primary text-bg-primary font-semibold px-8 py-3 rounded-full text-lg"
        >
          Обсудить проект
        </button>
      </div>
    </>
  )
}
