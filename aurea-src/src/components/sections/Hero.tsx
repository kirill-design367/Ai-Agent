import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
import { ArrowRight, ChevronDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: '7+', label: 'лет опыта' },
  { value: '100+', label: 'проектов' },
  { value: '1–5', label: 'дней срок' },
  { value: '∞', label: 'гарантия' },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cursorLightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro timeline
      const tl = gsap.timeline({ delay: 0.3 })

      // Orbs float in
      tl.fromTo('.hero-orb-1', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }, 0)
      tl.fromTo('.hero-orb-2', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }, 0.2)

      // Title letters reveal
      const letters = headlineRef.current?.querySelectorAll('.hero-letter')
      if (letters) {
        tl.fromTo(letters,
          { y: 120, opacity: 0, rotateX: -40 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.06, ease: 'power3.out' },
          0.4
        )
      }

      // Tagline words
      tl.fromTo('.hero-tag-word',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
        1.0
      )

      // Subtitle
      tl.fromTo('.hero-subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        1.4
      )

      // CTAs
      tl.fromTo('.hero-cta-1', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.6)
      tl.fromTo('.hero-cta-2', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.75)

      // Stats cascade
      tl.fromTo('.hero-stat',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
        1.9
      )

      // Scroll indicator
      tl.fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 2.3)

      // Slow float for background elements
      gsap.to('.hero-orb-1', { y: -40, x: 20, duration: 20, ease: 'none', yoyo: true, repeat: -1 })
      gsap.to('.hero-orb-2', { y: 30, x: -25, duration: 15, ease: 'none', yoyo: true, repeat: -1 })
      gsap.to('.hero-orb-3', { y: -20, x: 15, duration: 25, ease: 'none', yoyo: true, repeat: -1 })

      // ScrollTrigger: hero exit
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(contentRef.current, { y: p * 80, opacity: 1 - p * 1.5 })
          gsap.set(layer1Ref.current, { y: p * -30 })
          gsap.set(layer2Ref.current, { y: p * -60 })
          gsap.set(layer3Ref.current, { y: p * -100 })
        },
      })
    }, sectionRef)

    // Cursor parallax
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 2
      const y = (clientY / innerHeight - 0.5) * 2

      if (cursorLightRef.current) {
        gsap.to(cursorLightRef.current, {
          x: clientX - 150,
          y: clientY - 150,
          duration: 1.2,
          ease: 'power2.out',
        })
      }

      gsap.to(layer1Ref.current, { x: x * 12, y: y * 8, duration: 1.5, ease: 'power2.out' })
      gsap.to(layer2Ref.current, { x: x * 22, y: y * 15, duration: 1.8, ease: 'power2.out' })
      gsap.to(layer3Ref.current, { x: x * 35, y: y * 22, duration: 2, ease: 'power2.out' })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      ctx.revert()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  const tagWords = ['Уникальный', 'дизайн.', 'Чистый', 'код.', 'За', '1–5', 'дней.']

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen overflow-hidden flex items-center" style={{ background: 'var(--bg-primary)' }}>

      {/* Background layers for parallax */}
      <div ref={layer3Ref} className="absolute inset-0 pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="hero-orb-3 orb w-[500px] h-[500px] opacity-0" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)', top: '60%', left: '70%' }} />
      </div>
      <div ref={layer2Ref} className="absolute inset-0 pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="hero-orb-2 orb w-[600px] h-[600px] opacity-0" style={{ background: 'radial-gradient(circle, rgba(100,120,180,0.06) 0%, transparent 70%)', top: '-10%', right: '-5%' }} />
      </div>
      <div ref={layer1Ref} className="absolute inset-0 pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="hero-orb-1 orb w-[700px] h-[700px] opacity-0" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.07) 0%, transparent 70%)', top: '20%', left: '-10%' }} />
      </div>

      {/* Cursor light */}
      <div
        ref={cursorLightRef}
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          willChange: 'transform',
        }}
      />

      {/* Grid lines decoration */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Main content */}
      <div ref={contentRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Tag above headline */}
        <div className="hero-subtitle flex items-center gap-3 mb-8 opacity-0">
          <span className="w-8 h-px bg-gold opacity-60" />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Веб-разработка под ключ</span>
        </div>

        {/* Giant headline AUREA */}
        <div ref={headlineRef} className="overflow-hidden mb-6" style={{ perspective: '800px' }}>
          <div className="flex items-end">
            {'AUREA'.split('').map((l, i) => (
              <span
                key={i}
                className="hero-letter font-syne font-bold text-text-primary leading-none select-none"
                style={{
                  fontSize: 'clamp(80px, 18vw, 240px)',
                  letterSpacing: '-0.04em',
                  display: 'inline-block',
                  opacity: 0,
                  willChange: 'transform',
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Tagline words */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-8 overflow-hidden">
          {tagWords.map((w, i) => (
            <span
              key={i}
              className="hero-tag-word font-cormorant italic text-text-secondary opacity-0"
              style={{ fontSize: 'clamp(22px, 3.5vw, 44px)', display: 'inline-block' }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <p className="hero-subtitle font-inter text-text-muted text-base max-w-md leading-relaxed mb-10 opacity-0">
          Создаю сайты которые работают на ваш бизнес — с безупречным дизайном, чистым кодом и пожизненной гарантией.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <MagneticButton>
            <button
              className="hero-cta-1 opacity-0 group flex items-center gap-3 bg-text-primary text-bg-primary font-syne font-semibold text-sm px-7 py-4 rounded-full hover:bg-white transition-all duration-300 hover:gap-5 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Обсудить проект
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </MagneticButton>

          <MagneticButton>
            <button
              className="hero-cta-2 opacity-0 group flex items-center gap-3 text-text-secondary font-inter text-sm px-7 py-4 rounded-full border border-border hover:border-text-muted hover:text-text-primary transition-all duration-300"
              onClick={() => document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Смотреть работы
            </button>
          </MagneticButton>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-8 sm:gap-12">
          {stats.map((s, i) => (
            <div key={i} className="hero-stat opacity-0">
              <div className="font-syne font-bold text-2xl sm:text-3xl text-text-primary mb-1">{s.value}</div>
              <div className="font-inter text-text-muted text-xs tracking-widest uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        className="hero-scroll opacity-0 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary transition-colors duration-200"
        onClick={scrollDown}
      >
        <span className="font-inter text-xs tracking-[0.2em] uppercase">Прокрутите</span>
        <ChevronDown size={16} className="animate-bounce" />
      </button>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }} />
    </section>
  )
}
