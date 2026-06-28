import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GoldenMark from '../GoldenMark'

gsap.registerPlugin(ScrollTrigger)

const items = [
  { text: 'Уникальный дизайн с нуля', note: 'Не шаблон' },
  { text: 'Скорость загрузки < 1 сек', note: 'PageSpeed 90+' },
  { text: 'Адаптив: телефон, планшет, ПК', note: 'Все устройства' },
  { text: 'SEO-оптимизация', note: 'Google & Яндекс' },
  { text: 'Яндекс.Метрика + цели', note: 'Аналитика' },
  { text: 'Размещение на хостинге', note: 'Готов к запуску' },
  { text: 'Видеоинструкция по сайту', note: 'Обучение' },
  { text: 'Бесплатные правки 14 дней', note: 'После сдачи' },
  { text: 'Пожизненная гарантия работы', note: 'Навсегда' },
]

function CheckIcon({ index }: { index: number }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const path = svgRef.current?.querySelector('path')
    if (!path) return
    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 0.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: svgRef.current,
        start: 'top 85%',
        once: true,
      },
      delay: index * 0.07,
    })
  }, [index])

  return (
    <svg ref={svgRef} width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9l4 4 8-8" stroke="#C9A87C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Deliverables() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.deliv-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.deliv-label', start: 'top 85%' } })
      gsap.fromTo('.deliv-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.deliv-title', start: 'top 82%' } })

      gsap.fromTo('.deliv-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.6,
          stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: '.deliv-grid', start: 'top 80%' }
        }
      )

      gsap.fromTo('.deliv-card-right',
        { opacity: 0, x: 40, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.deliv-card-right', start: 'top 80%' } }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="services" className="section-padding relative" style={{ background: 'var(--bg-secondary)' }}>
      <GoldenMark variant="circles-tr" size={560} className="absolute -top-16 -right-16" />
      <GoldenMark variant="spiral-br" size={400} className="absolute bottom-0 right-1/3" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="deliv-label flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Что вы получаете</span>
          </div>
          <h2 className="deliv-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Каждый сайт —<br />полный комплект
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Checklist */}
          <div className="deliv-grid lg:col-span-3 space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="deliv-item group flex items-center justify-between p-5 rounded-xl transition-all duration-300 cursor-default"
                style={{ background: 'var(--surface)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full" style={{ background: 'rgba(201,168,124,0.08)' }}>
                    <CheckIcon index={i} />
                  </div>
                  <span className="font-inter text-text-secondary text-sm group-hover:text-text-primary transition-colors duration-200">{item.text}</span>
                </div>
                <span className="hidden sm:block font-inter text-xs text-text-muted px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'var(--surface-hover)' }}>
                  {item.note}
                </span>
              </div>
            ))}
          </div>

          {/* Highlight card */}
          <div className="deliv-card-right lg:col-span-2 opacity-0">
            <div className="h-full rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(201,168,124,0.08) 0%, transparent 60%)' }} />

              <div className="relative z-10">
                <div className="text-4xl mb-6">✦</div>
                <h3 className="font-syne font-bold text-text-primary text-2xl mb-4 leading-tight">
                  Пожизненная<br />гарантия
                </h3>
                <p className="font-inter text-text-muted text-sm leading-relaxed">
                  Сайт будет работать всегда. Технические проблемы — моя ответственность бесплатно, навсегда.
                </p>
              </div>

              <div className="relative z-10 mt-8 pt-6" style={{ borderTop: '1px solid rgba(201,168,124,0.1)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="font-inter text-gold text-xs tracking-widest uppercase">Включено в каждый проект</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px shimmer-line" style={{ opacity: 0.4 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
