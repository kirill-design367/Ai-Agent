import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const phrases = [
  { line1: 'Заплатили', line2: '150 000 ₽.', gold: false },
  { line1: 'Получили', line2: 'шаблон.', gold: false },
  { line1: 'Ждали', line2: '3 месяца.', gold: false },
  { line1: 'Так не должно', line2: 'быть.', gold: true },
]

export default function Pain() {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      if (!section) return
      const vh = window.innerHeight

      // Background darkens progressively
      gsap.to(overlayRef.current, {
        opacity: 0.65,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `top+=${phrases.length * vh} top`,
          scrub: 1,
        },
      })

      // Each phrase fades in, then fades out
      phrases.forEach((_, i) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: `top+=${i * vh} top`,
            end: `top+=${(i + 1) * vh} top`,
            scrub: 0.7,
          },
        })
          .fromTo(
            `.pain-phrase-${i}`,
            { opacity: 0, y: 80, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
          )
          .to(
            `.pain-phrase-${i}`,
            { opacity: 0, y: -60, scale: 1.02, duration: 0.3, ease: 'power2.in' },
            '+=0.3'
          )
      })

      // Resolution fades in after all phrases
      gsap.fromTo(
        '.pain-resolution',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: section,
            start: `top+=${phrases.length * vh} top`,
            end: `top+=${phrases.length * vh + 200} top`,
            scrub: 1,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ height: `${100 + phrases.length * 100 + 120}vh`, background: 'var(--bg-primary)' }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Progressive dark overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{ background: '#020305', opacity: 0 }}
        />

        {/* Eyebrow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          <span className="w-6 h-px opacity-35" style={{ background: 'var(--gold)' }} />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Знакомая ситуация?</span>
          <span className="w-6 h-px opacity-35" style={{ background: 'var(--gold)' }} />
        </div>

        {/* Phrases — each absolutely positioned, stacked */}
        {phrases.map((p, i) => (
          <div
            key={i}
            className={`pain-phrase-${i} absolute inset-0 flex items-center justify-center text-center px-6`}
            style={{ opacity: 0 }}
          >
            <h2
              className="font-syne font-bold"
              style={{
                fontSize: 'clamp(62px, 11vw, 156px)',
                lineHeight: 0.97,
                color: p.gold ? 'var(--gold)' : 'var(--text-primary)',
              }}
            >
              {p.line1}
              <br />
              {p.line2}
            </h2>
          </div>
        ))}

        {/* Resolution — appears after all phrases */}
        <div
          className="pain-resolution absolute bottom-14 left-0 right-0 text-center z-10"
          style={{ opacity: 0 }}
        >
          <p
            className="font-cormorant italic"
            style={{ fontSize: 'clamp(22px, 2.6vw, 36px)', color: 'var(--text-muted)' }}
          >
            Я работаю иначе —{' '}
            <span style={{ color: 'var(--gold)' }}>напрямую с вами.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
