import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

export default function Deliverables() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left giant text parallax
      gsap.fromTo('.deliv-big',
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.deliv-big', start: 'top 80%' },
        }
      )

      // Items stagger from right
      gsap.fromTo('.deliv-row',
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: '.deliv-list', start: 'top 78%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)', paddingTop: 'clamp(80px, 10vw, 160px)', paddingBottom: 'clamp(80px, 10vw, 160px)' }}
    >
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-start">

          {/* Left: Giant text */}
          <div ref={leftRef} className="deliv-big lg:sticky lg:top-24 opacity-0">
            <div className="flex items-center gap-3 mb-10">
              <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
              <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Что вы получаете</span>
            </div>

            <h2
              className="font-syne font-bold leading-[0.88]"
              style={{ fontSize: 'clamp(72px, 10.5vw, 168px)', color: 'var(--text-primary)' }}
            >
              ВСЁ<br />
              <span style={{ color: 'var(--gold)' }}>ПОД</span><br />
              КЛЮЧ
            </h2>

            <p
              className="font-cormorant italic mt-10"
              style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: 'var(--text-muted)', lineHeight: 1.6 }}
            >
              Каждый проект — полный комплект.<br />
              Ничего лишнего, ничего не хватает.
            </p>

            <div className="mt-12 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
              <span className="font-inter text-xs tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                Включено в каждый проект
              </span>
            </div>
          </div>

          {/* Right: Items list */}
          <div className="deliv-list pt-0 lg:pt-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="deliv-row opacity-0 flex items-center justify-between gap-6 py-6"
                style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div className="flex items-center gap-5">
                  <span
                    className="font-syne font-bold flex-shrink-0 select-none"
                    style={{ fontSize: '13px', color: 'rgba(201,168,124,0.35)', letterSpacing: '0.05em' }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className="font-syne font-bold text-text-primary"
                    style={{ fontSize: 'clamp(16px, 1.8vw, 22px)' }}
                  >
                    {item.text}
                  </span>
                </div>
                <span
                  className="font-inter text-xs flex-shrink-0"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}
                >
                  {item.note}
                </span>
              </div>
            ))}

            {/* Guarantee callout */}
            <div className="mt-10 pt-10" style={{ borderTop: '1px solid rgba(201,168,124,0.2)' }}>
              <p className="font-cormorant italic" style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Сайт будет работать всегда. Технические проблемы —{' '}
                <span style={{ color: 'var(--gold)' }}>моя ответственность бесплатно, навсегда.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
