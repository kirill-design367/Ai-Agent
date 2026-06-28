import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, X } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const rows = [
  { param: 'Срок', me: '1–5 дней', studio: '1–3 месяца' },
  { param: 'Общение', me: 'Напрямую со мной', studio: 'Через менеджеров' },
  { param: 'Код', me: 'Чистый, уникальный', studio: 'Шаблон / конструктор' },
  { param: 'Правки', me: 'Быстро, без очереди', studio: 'Очередь 3–5 дней' },
  { param: 'Цена', me: 'Честная, без накруток', studio: '+30–50% за офис и штат' },
  { param: 'Гарантия', me: 'Пожизненная', studio: '1–12 месяцев' },
  { param: 'Дизайн', me: 'Уникальный с нуля', studio: 'Часто шаблонный' },
]

export default function Comparison() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.comp-eyebrow',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.comp-eyebrow', start: 'top 85%' } }
      )
      gsap.fromTo('.comp-head',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.comp-head', start: 'top 82%' } }
      )
      gsap.fromTo('.comp-col-header',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.comp-table', start: 'top 80%' } }
      )

      rows.forEach((_, i) => {
        gsap.fromTo(`.comp-row-${i}`,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.06,
            scrollTrigger: { trigger: `.comp-row-${i}`, start: 'top 88%', once: true },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-padding relative"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-20">
          <div className="comp-eyebrow flex items-center gap-3 mb-8">
            <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Сравнение</span>
          </div>
          <h2
            className="comp-head font-syne font-bold text-text-primary"
            style={{ fontSize: 'clamp(40px, 6vw, 82px)', lineHeight: 1.05 }}
          >
            Почему я,<br />а не студия?
          </h2>
        </div>

        <div className="comp-table">
          {/* Header row */}
          <div className="comp-col-header grid grid-cols-3 gap-0 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div />
            <div className="flex items-center gap-2.5 px-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--gold)' }}
              >
                <span className="font-syne font-bold text-bg-primary" style={{ fontSize: '10px' }}>A</span>
              </div>
              <span className="font-syne font-bold text-text-primary text-sm tracking-wider">AUREA</span>
            </div>
            <div className="px-4">
              <span className="font-inter text-text-muted text-sm">Веб-студия</span>
            </div>
          </div>

          {/* Data rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className={`comp-row-${i} grid grid-cols-3 gap-0 opacity-0`}
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingTop: '20px', paddingBottom: '20px' }}
            >
              <div>
                <span className="font-inter text-text-muted text-sm">{row.param}</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-1 rounded-lg" style={{ background: 'rgba(201,168,124,0.05)' }}>
                <Check size={14} className="text-gold flex-shrink-0" strokeWidth={2.5} />
                <span className="font-inter text-text-primary text-sm">{row.me}</span>
              </div>
              <div className="flex items-center gap-2.5 px-4">
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
