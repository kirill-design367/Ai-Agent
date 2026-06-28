import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reviews = [
  {
    name: 'Алексей Н.',
    role: 'Владелец, загородные домики',
    city: 'Краснодар',
    text: 'Кирилл сделал лендинг за 2 дня. Запустили рекламу — первая заявка через час после старта. За месяц окупили вложения в 8 раз. Рекомендую без оговорок.',
    stars: 5,
  },
  {
    name: 'Марина С.',
    role: 'Стилист-имиджмейкер',
    city: 'Москва',
    text: 'Долго искала исполнителя — все делали либо дёшево и некрасиво, либо брали 150к и месяц. Здесь за 3 дня получила сайт уровня западных специалистов. Клиенты сразу отметили качество.',
    stars: 5,
  },
  {
    name: 'Дмитрий К.',
    role: 'Директор, студия звукозаписи',
    city: 'Санкт-Петербург',
    text: 'Объяснил задачу голосом за 20 минут — на следующий день получил готовую концепцию. Никаких бесконечных согласований. Сайт выглядит дороже наших конкурентов.',
    stars: 5,
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.test-eyebrow',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.test-eyebrow', start: 'top 85%' } }
      )
      gsap.fromTo('.test-head',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.test-head', start: 'top 82%' } }
      )

      reviews.forEach((_, i) => {
        gsap.fromTo(`.test-item-${i}`,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: `.test-item-${i}`, start: 'top 84%', once: true },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)', top: '20%', left: '-10%' }}
      />

      <div className="max-w-5xl mx-auto px-6">
        <div className="test-eyebrow flex items-center gap-3 mb-8">
          <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Отзывы</span>
        </div>
        <h2
          className="test-head font-syne font-bold text-text-primary mb-20 lg:mb-28"
          style={{ fontSize: 'clamp(40px, 6vw, 82px)', lineHeight: 1.05 }}
        >
          Что говорят<br />клиенты
        </h2>

        <div className="space-y-0">
          {reviews.map((r, i) => (
            <div
              key={i}
              className={`test-item-${i} opacity-0`}
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '48px', paddingBottom: '48px' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 lg:gap-16">

                {/* Author */}
                <div>
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <span key={j} style={{ color: 'var(--gold)', fontSize: '14px' }}>★</span>
                    ))}
                  </div>
                  <div className="font-syne font-bold text-text-primary text-lg mb-1">{r.name}</div>
                  <div className="font-inter text-text-muted text-sm">{r.role}</div>
                  <div className="font-inter text-text-muted text-sm opacity-60">{r.city}</div>
                </div>

                {/* Review text */}
                <div className="relative">
                  <div
                    className="font-cormorant italic leading-none mb-5 select-none"
                    style={{ fontSize: '80px', color: 'rgba(201,168,124,0.15)', lineHeight: 1 }}
                  >
                    "
                  </div>
                  <p
                    className="font-inter leading-relaxed"
                    style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: 'var(--text-secondary)', marginTop: '-20px' }}
                  >
                    {r.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </section>
  )
}
