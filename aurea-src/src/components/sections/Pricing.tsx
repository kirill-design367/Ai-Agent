import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: 'Визитка',
    price: 'от 20 000',
    time: '1 день',
    desc: 'Для быстрого онлайн-присутствия и первого впечатления',
    features: ['Уникальный дизайн', 'До 5 секций', 'Адаптив', 'Контактная форма', 'SEO-базовая'],
    recommended: false,
  },
  {
    name: 'Лендинг',
    price: 'от 30 000',
    time: '1–3 дня',
    desc: 'Продающая страница для рекламы, запуска и конверсии',
    features: ['Уникальный дизайн', 'До 12 секций', 'Адаптив', 'Анимации', 'SEO + Метрика', 'Правки 14 дней'],
    recommended: true,
  },
  {
    name: 'Корпоратив',
    price: 'от 60 000',
    time: '3–5 дней',
    desc: 'Многостраничный сайт с каталогом, блогом или личным кабинетом',
    features: ['Уникальный дизайн', 'Несколько страниц', 'Адаптив', 'Анимации', 'CMS / админка', 'SEO + Метрика'],
    recommended: false,
  },
  {
    name: 'Магазин',
    price: 'от 90 000',
    time: '5–7 дней',
    desc: 'Интернет-магазин с каталогом, корзиной и оплатой',
    features: ['Уникальный дизайн', 'Каталог + корзина', 'Оплата онлайн', 'Адаптив', 'Анимации', 'SEO + Метрика'],
    recommended: false,
  },
]

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pricing-eyebrow',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.pricing-eyebrow', start: 'top 85%' } }
      )
      gsap.fromTo('.pricing-head',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.pricing-head', start: 'top 82%' } }
      )

      gsap.fromTo('.pricing-row',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.pricing-rows', start: 'top 78%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', paddingTop: 'clamp(80px, 10vw, 160px)', paddingBottom: 'clamp(80px, 10vw, 160px)' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{ width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
      />

      <div className="max-w-5xl mx-auto px-6">
        <div className="pricing-eyebrow flex items-center gap-3 mb-8">
          <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Стоимость</span>
        </div>

        <h2
          className="pricing-head font-syne font-bold text-text-primary mb-20 lg:mb-28"
          style={{ fontSize: 'clamp(40px, 6vw, 82px)', lineHeight: 1.05 }}
        >
          Прозрачные цены.<br />
          <span className="font-cormorant italic font-normal text-gradient-gold">Без скрытых платежей</span>
        </h2>

        {/* Pricing as editorial rows */}
        <div className="pricing-rows">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="pricing-row opacity-0 group"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 'clamp(32px, 4vw, 56px)', paddingBottom: 'clamp(32px, 4vw, 56px)' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_auto] gap-6 lg:gap-12 items-start">

                {/* Plan name + time */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-inter text-xs tracking-[0.25em] uppercase" style={{ color: 'var(--text-muted)' }}>
                      {plan.name}
                    </span>
                    {plan.recommended && (
                      <span className="font-inter text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,124,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,124,0.25)' }}>
                        Популярный
                      </span>
                    )}
                  </div>
                  <div
                    className="font-syne font-bold"
                    style={{ fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.0, color: plan.recommended ? 'var(--gold)' : 'var(--text-primary)' }}
                  >
                    {plan.price} ₽
                  </div>
                  <div className="font-inter text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {plan.time}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="font-inter text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)', maxWidth: '340px' }}>
                    {plan.desc}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {plan.features.map((f, j) => (
                      <span key={j} className="font-inter text-sm" style={{ color: 'var(--text-secondary)' }}>
                        — {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-start lg:pt-1">
                  <button
                    className="group/btn inline-flex items-center gap-2 font-inter text-sm transition-all duration-300"
                    style={{
                      color: plan.recommended ? 'var(--gold)' : 'var(--text-muted)',
                      paddingBottom: '2px',
                      borderBottom: plan.recommended ? '1px solid rgba(201,168,124,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Выбрать
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
            <p className="font-inter text-text-muted text-sm">
              Финальная стоимость зависит от объёма задачи —{' '}
              <button
                className="text-gold hover:text-[#d9b88c] underline underline-offset-2 transition-colors duration-200"
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                обсудим за 15 минут
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
