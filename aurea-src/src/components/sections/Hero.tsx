import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import GoldenMark from '../GoldenMark'

gsap.registerPlugin(ScrollTrigger)

const BASE = import.meta.env.BASE_URL

// Portfolio slides shown inside MacBook screen
const slides = [
  {
    img: `${BASE}images/portfolio/p1.jpg`,
    fallback: 'linear-gradient(135deg, #0d1829 0%, #1a2f5a 50%, #2a4580 100%)',
  },
  {
    img: `${BASE}images/portfolio/p2.jpg`,
    fallback: 'linear-gradient(135deg, #f0ebe0 0%, #d9cbb0 50%, #b8a080 100%)',
  },
]

// Adjust these % values if the overlay doesn't align with the screen
const SCREEN = { top: '7%', left: '11.5%', width: '77%', height: '64%' }

const stats = [
  { val: '7+', lbl: 'лет опыта' },
  { val: '100+', lbl: 'проектов' },
  { val: '1–5', lbl: 'дней' },
  { val: '∞', lbl: 'гарантия' },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const macRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide(s => (s + 1) % slides.length), 3500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance — delayed until after preloader
      const tl = gsap.timeline({ delay: 2.5 })

      tl.fromTo('.hero-eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
        .fromTo('.hero-line', { y: '110%' }, { y: '0%', duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.2')
        .fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.55')
        .fromTo('.hero-cta-wrap', { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, '-=0.45')
        .fromTo('.hero-stats', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.35')
        .fromTo(macRef.current, { opacity: 0, y: 55, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.15, ease: 'power4.out' }, '<-=0.85')

      // Scroll parallax — left text exits faster, MacBook slower
      gsap.to(leftRef.current, {
        y: -90,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '50% top', scrub: 1.2 },
      })

      gsap.to(macRef.current, {
        y: -45,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden flex items-center"
      style={{ background: '#07090D' }}
    >
      {/* Background: atmospheric golden smoke */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${BASE}images/hero-bg.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '10% 50%', opacity: 0.6 }}
        />
        {/* Gradient: let smoke breathe on left, fade to dark on right */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(108deg, rgba(7,9,13,0.15) 0%, rgba(7,9,13,0.45) 30%, rgba(7,9,13,0.82) 58%, rgba(7,9,13,0.98) 100%)' }}
        />
      </div>

      {/* Noise */}
      <div className="noise-section z-[1]" />
      {/* Golden ratio geometry */}
      <GoldenMark variant="spiral-tl" size={700} className="absolute z-[2] -top-20 -left-20" />
      <GoldenMark variant="circles-tr" size={500} className="absolute z-[2] top-0 right-0" />

      {/* Layout */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_56%] items-center min-h-screen gap-10 lg:gap-0 py-28">

          {/* LEFT: Copy */}
          <div ref={leftRef} className="flex flex-col justify-center">

            {/* Eyebrow */}
            <div className="hero-eyebrow inline-flex items-center gap-2.5 mb-10 opacity-0">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
              <span className="font-inter text-xs tracking-[0.22em] uppercase" style={{ color: 'var(--text-muted)' }}>
                Студия веб-дизайна
              </span>
            </div>

            {/* Headline — each word is clipped for reveal */}
            <h1 className="mb-10" style={{ lineHeight: 1.04 }}>
              {[
                { text: 'Сайты,', gold: false },
                { text: 'которые', gold: false },
                { text: 'продают.', gold: true },
              ].map(({ text, gold }, i) => (
                <div key={i} style={{ overflow: 'hidden' }}>
                  <div
                    className="hero-line font-syne font-bold"
                    style={{
                      fontSize: 'clamp(52px, 8.5vw, 128px)',
                      color: gold ? 'var(--gold)' : 'var(--text-primary)',
                      lineHeight: 1.04,
                      display: 'block',
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </h1>

            {/* Tagline */}
            <p
              className="hero-sub font-cormorant italic mb-12 opacity-0"
              style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', color: 'var(--text-secondary)', lineHeight: 1.65 }}
            >
              Уникальный дизайн. Чистый код.<br />
              Пожизненная гарантия.
            </p>

            {/* CTA */}
            <div className="hero-cta-wrap opacity-0 mb-16">
              <button
                className="group relative inline-flex items-center gap-3 rounded-xl font-inter font-semibold overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(201,168,124,0.4)]"
                style={{ background: 'var(--gold)', color: '#07090D', padding: '15px 34px', fontSize: '15px' }}
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Обсудить проект
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                {/* Shimmer sweep */}
                <span
                  className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 z-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
                />
              </button>
            </div>

            {/* Stats */}
            <div className="hero-stats opacity-0 flex items-center gap-8 flex-wrap">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-syne font-bold text-text-primary" style={{ fontSize: '22px', lineHeight: 1.2 }}>
                    {s.val}
                  </span>
                  <span className="font-inter text-text-muted" style={{ fontSize: '11px', marginTop: '3px' }}>
                    {s.lbl}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: MacBook with screen carousel */}
          <div ref={macRef} className="relative opacity-0 lg:-mr-8 xl:-mr-16">
            <div className="relative w-full">

              {/* MacBook frame — z-index 1 (behind carousel) */}
              <img
                src={`${BASE}images/macbook.jpg`}
                alt="MacBook Pro"
                className="relative w-full select-none pointer-events-none"
                style={{ zIndex: 1, filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.75))' }}
              />

              {/* Screen carousel — z-index 10 (on top of MacBook, only in screen area) */}
              <div
                className="absolute overflow-hidden"
                style={{ zIndex: 10, top: SCREEN.top, left: SCREEN.left, width: SCREEN.width, height: SCREEN.height }}
              >
                {slides.map((s, i) => (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      opacity: i === activeSlide ? 1 : 0,
                      transition: 'opacity 0.85s cubic-bezier(0.4,0,0.2,1)',
                      backgroundImage: `url(${s.img}), ${s.fallback}`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center top',
                    }}
                  />
                ))}

                {/* Screen glare */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 45%, rgba(0,0,0,0.08) 100%)',
                    zIndex: 2,
                  }}
                />
              </div>

              {/* Slide dot indicators — z-index 20 (above carousel) */}
              <div
                className="absolute flex items-center justify-center gap-1.5"
                style={{ zIndex: 20, bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}
              >
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Слайд ${i + 1}`}
                    onClick={() => setActiveSlide(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === activeSlide ? 20 : 6,
                      height: 6,
                      background: i === activeSlide ? 'var(--gold)' : 'rgba(255,255,255,0.18)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Ambient glow beneath MacBook */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ width: '65%', height: '50px', background: 'radial-gradient(ellipse, rgba(201,168,124,0.22) 0%, transparent 70%)', filter: 'blur(18px)' }}
            />
          </div>

        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-10 hidden lg:flex flex-col items-center gap-2.5" style={{ opacity: 0.35 }}>
        <div className="relative overflow-hidden" style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="absolute top-0 left-0 w-full"
            style={{ height: '40%', background: 'var(--gold)', animation: 'scrollLine 1.8s ease-in-out infinite' }}
          />
        </div>
        <span
          className="font-inter text-text-muted"
          style={{ fontSize: '9px', letterSpacing: '0.2em', writingMode: 'vertical-rl', textTransform: 'uppercase' }}
        >
          Scroll
        </span>
      </div>
    </section>
  )
}
