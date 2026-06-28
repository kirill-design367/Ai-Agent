import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GoldenMark from '../GoldenMark'

gsap.registerPlugin(ScrollTrigger)

const reviews = [
  { name: 'Алексей Н.', role: 'Владелец, загородные домики', city: 'Краснодар', text: 'Кирилл сделал лендинг за 2 дня. Запустили рекламу — первая заявка через час после старта. За месяц окупили вложения в 8 раз. Рекомендую без оговорок.', stars: 5 },
  { name: 'Марина С.', role: 'Стилист-имиджмейкер', city: 'Москва', text: 'Долго искала исполнителя — все делали либо дёшево и некрасиво, либо брали 150к и месяц. Здесь за 3 дня получила сайт уровня западных специалистов. Клиенты сразу отметили качество.', stars: 5 },
  { name: 'Дмитрий К.', role: 'Директор, студия звукозаписи', city: 'Санкт-Петербург', text: 'Объяснил задачу голосом за 20 минут — на следующий день получил готовую концепцию. Никаких бесконечных согласований. Сайт выглядит дороже наших конкурентов.', stars: 5 },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.test-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.test-label', start: 'top 85%' } })
      gsap.fromTo('.test-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.test-title', start: 'top 82%' } })

      gsap.fromTo('.test-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.test-grid', start: 'top 78%' }
        }
      )

      // Quotes animation
      gsap.fromTo('.test-quote',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.15,
          scrollTrigger: { trigger: '.test-grid', start: 'top 78%' }
        }
      )

      // Parallax on cards
      gsap.utils.toArray('.test-card').forEach((card: any, i) => {
        gsap.to(card, {
          y: i % 2 === 0 ? -15 : 15,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <GoldenMark variant="spiral-tl" size={600} className="absolute -top-10 -left-10" />
      <GoldenMark variant="sunflower" size={420} className="absolute bottom-0 right-0 opacity-60" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="test-label flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Отзывы</span>
          </div>
          <h2 className="test-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Что говорят<br />клиенты
          </h2>
        </div>

        <div className="test-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="test-card relative rounded-2xl p-7 flex flex-col opacity-0"
              style={{ background: 'var(--surface)' }}
            >
              {/* Quote mark */}
              <div className="test-quote font-cormorant italic text-6xl leading-none mb-4 opacity-0" style={{ color: 'rgba(201,168,124,0.3)' }}>
                "
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <span key={j} className="text-gold text-sm">★</span>
                ))}
              </div>

              {/* Text */}
              <p className="font-inter text-text-secondary text-sm leading-relaxed flex-1 mb-6">
                {r.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-syne font-bold text-sm" style={{ background: 'rgba(201,168,124,0.12)', color: 'var(--gold)' }}>
                  {r.name[0]}
                </div>
                <div>
                  <div className="font-inter font-medium text-text-primary text-sm">{r.name}</div>
                  <div className="font-inter text-text-muted text-xs">{r.role} · {r.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
