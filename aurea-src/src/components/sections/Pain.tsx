import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pains = [
  {
    emoji: '⏳',
    title: 'Ждёте месяцами',
    desc: 'Студия обещает 2 недели — сдаёт через 3 месяца. Сроки постоянно сдвигаются без объяснений.',
    tag: 'Время'
  },
  {
    emoji: '💸',
    title: 'Платите за шаблон',
    desc: 'За 80 000 ₽ получаете стандартный WordPress с чужими фото. Ничего уникального.',
    tag: 'Качество'
  },
  {
    emoji: '📞',
    title: 'Три менеджера',
    desc: 'Общаетесь с менеджером, который передаёт дизайнеру, который говорит с разработчиком. Результат теряется.',
    tag: 'Коммуникация'
  },
  {
    emoji: '🔧',
    title: 'Сделали и пропали',
    desc: 'После сдачи — тишина. Любая правка стоит денег. Технические проблемы висят неделями.',
    tag: 'Поддержка'
  },
]

export default function Pain() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label and title
      gsap.fromTo('.pain-label',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.pain-label', start: 'top 85%' } }
      )

      gsap.fromTo('.pain-title span',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'power3.out',
          scrollTrigger: { trigger: '.pain-title', start: 'top 80%' } }
      )

      // Cards — each with unique animation
      gsap.fromTo('.pain-card-0',
        { opacity: 0, y: 60, rotateY: -8 },
        { opacity: 1, y: 0, rotateY: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.pain-card-0', start: 'top 85%' } }
      )
      gsap.fromTo('.pain-card-1',
        { opacity: 0, y: 80, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.1,
          scrollTrigger: { trigger: '.pain-card-1', start: 'top 85%' } }
      )
      gsap.fromTo('.pain-card-2',
        { opacity: 0, y: 60, rotateY: 8 },
        { opacity: 1, y: 0, rotateY: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
          scrollTrigger: { trigger: '.pain-card-2', start: 'top 85%' } }
      )
      gsap.fromTo('.pain-card-3',
        { opacity: 0, x: 40, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.2,
          scrollTrigger: { trigger: '.pain-card-3', start: 'top 85%' } }
      )

      // "Solution" reveal
      gsap.fromTo('.pain-solution',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.pain-solution', start: 'top 85%' } }
      )
    }, sectionRef)

    // 3D tilt on cards
    const cards = sectionRef.current?.querySelectorAll('.pain-tilt-card')
    cards?.forEach((card) => {
      const el = card as HTMLElement
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        gsap.to(el, {
          rotateX: -y * 8,
          rotateY: x * 8,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        })
        const glow = el.querySelector('.card-glow') as HTMLElement
        if (glow) {
          gsap.to(glow, {
            opacity: 1,
            x: x * 60,
            y: y * 60,
            duration: 0.3,
          })
        }
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
        const glow = el.querySelector('.card-glow') as HTMLElement
        if (glow) gsap.to(glow, { opacity: 0, duration: 0.3 })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding relative" id="pain" style={{ background: 'var(--bg-secondary)' }}>
      {/* Ambient orb */}
      <div className="orb absolute w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(80,100,160,0.04) 0%, transparent 70%)', top: '20%', right: '-10%' }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="pain-label flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Узнаёте себя?</span>
          </div>
          <h2 className="pain-title font-syne font-bold text-text-primary leading-tight overflow-hidden" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            {'Проблемы,'.split('').map((c, i) => <span key={i} style={{ display: 'inline-block' }}>{c === ' ' ? ' ' : c}</span>)}<br />
            {'которые вам знакомы'.split('').map((c, i) => <span key={i + 100} style={{ display: 'inline-block' }}>{c === ' ' ? ' ' : c}</span>)}
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {pains.map((pain, i) => (
            <div
              key={i}
              className={`pain-card-${i} pain-tilt-card relative overflow-hidden rounded-2xl p-7 cursor-default`}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Hover glow */}
              <div className="card-glow absolute w-32 h-32 rounded-full pointer-events-none opacity-0" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.08) 0%, transparent 70%)', top: '20%', left: '20%', filter: 'blur(20px)' }} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{pain.emoji}</span>
                  <span className="font-inter text-xs text-text-muted px-2.5 py-1 rounded-full" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                    {pain.tag}
                  </span>
                </div>
                <h3 className="font-syne font-bold text-text-primary text-xl mb-3">{pain.title}</h3>
                <p className="font-inter text-text-muted text-sm leading-relaxed">{pain.desc}</p>
              </div>

              {/* Shimmer line on bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-px shimmer-line opacity-50" />
            </div>
          ))}
        </div>

        {/* Solution connector */}
        <div className="pain-solution flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border))' }} />
          <div className="glass rounded-full px-6 py-3 flex items-center gap-3">
            <span className="font-inter text-text-secondary text-sm">Я работаю иначе</span>
            <span className="text-gold font-syne font-bold text-sm">↓</span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--border))' }} />
        </div>
      </div>
    </section>
  )
}
