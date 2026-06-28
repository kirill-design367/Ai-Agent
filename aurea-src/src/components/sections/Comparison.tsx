import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, X } from 'lucide-react'
import GoldenMark from '../GoldenMark'

gsap.registerPlugin(ScrollTrigger)

const rows = [
  { param: 'Срок', me: '1–5 дней', studio: '1–3 месяца', win: 'me' },
  { param: 'Общение', me: 'Напрямую со мной', studio: 'Через менеджеров', win: 'me' },
  { param: 'Код', me: 'Чистый, уникальный', studio: 'Шаблон / конструктор', win: 'me' },
  { param: 'Правки', me: 'Быстро, без очереди', studio: 'Очередь 3–5 дней', win: 'me' },
  { param: 'Цена', me: 'Честная, без накруток', studio: '+30–50% за офис и штат', win: 'me' },
  { param: 'Гарантия', me: 'Пожизненная', studio: '1–12 месяцев', win: 'me' },
  { param: 'Дизайн', me: 'Уникальный с нуля', studio: 'Часто шаблонный', win: 'me' },
]

export default function Comparison() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.comp-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.comp-label', start: 'top 85%' } })
      gsap.fromTo('.comp-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.comp-title', start: 'top 82%' } })

      gsap.fromTo('.comp-header', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.comp-table', start: 'top 80%' } })

      rows.forEach((_, i) => {
        gsap.fromTo(`.comp-row-${i}`,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
            delay: i * 0.06,
            scrollTrigger: { trigger: `.comp-row-${i}`, start: 'top 88%', once: true }
          }
        )

        // Highlight me column
        gsap.fromTo(`.comp-me-${i}`,
          { backgroundColor: 'rgba(201,168,124,0)' },
          {
            duration: 0.4, delay: i * 0.06 + 0.3,
            scrollTrigger: { trigger: `.comp-row-${i}`, start: 'top 88%', once: true,
              onEnter: () => {
                gsap.to(`.comp-me-${i}`, {
                  backgroundColor: 'rgba(201,168,124,0.06)',
                  duration: 0.4,
                })
              }
            }
          }
        )
      })

      // Win glow
      gsap.to('.comp-win-glow', { opacity: 0.7, duration: 2.5, yoyo: true, repeat: -1, ease: 'power2.inOut' })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <GoldenMark variant="spiral-br" size={550} className="absolute -bottom-10 -right-10" />
      <GoldenMark variant="circles-bl" size={350} className="absolute -top-10 -left-10" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="comp-label flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Сравнение</span>
          </div>
          <h2 className="comp-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Почему я,<br />а не студия?
          </h2>
        </div>

        <div className="comp-table relative rounded-2xl overflow-hidden">
          {/* Win glow behind my column */}
          <div className="comp-win-glow absolute top-0 bottom-0 pointer-events-none opacity-0" style={{ left: '34%', right: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,124,0.06) 0%, transparent 70%)' }} />

          {/* Header */}
          <div className="comp-header grid grid-cols-3 gap-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="p-5 font-inter text-text-muted text-xs tracking-widest uppercase" />
            <div className="p-5 flex items-center gap-2" style={{ background: 'rgba(201,168,124,0.05)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <span className="text-bg-primary text-xs font-bold">A</span>
              </div>
              <span className="font-syne font-bold text-text-primary text-sm tracking-wider">AUREA</span>
            </div>
            <div className="p-5">
              <span className="font-inter text-text-muted text-sm">Веб-студия</span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className={`comp-row-${i} grid grid-cols-3 gap-0 opacity-0`}
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <div className="p-5">
                <span className="font-inter text-text-muted text-sm">{row.param}</span>
              </div>
              <div className={`comp-me-${i} p-5 flex items-center gap-2`} style={{ background: 'rgba(201,168,124,0.04)' }}>
                <Check size={14} className="text-gold flex-shrink-0" strokeWidth={2.5} />
                <span className="font-inter text-text-primary text-sm">{row.me}</span>
              </div>
              <div className="p-5 flex items-center gap-2">
                <X size={14} className="text-text-muted flex-shrink-0" strokeWidth={2} />
                <span className="font-inter text-text-muted text-sm">{row.studio}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
