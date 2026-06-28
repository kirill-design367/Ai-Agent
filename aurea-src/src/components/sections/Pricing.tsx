import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
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
      gsap.fromTo('.pricing-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.pricing-label', start: 'top 85%' } })
      gsap.fromTo('.pricing-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.pricing-title', start: 'top 82%' } })

      // Cards cascade
      gsap.fromTo('.pricing-card',
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.pricing-grid', start: 'top 75%' }
        }
      )

      // Recommended glow pulse
      gsap.to('.recommended-glow',
        { opacity: 0.8, duration: 2, yoyo: true, repeat: -1, ease: 'power2.inOut' }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="pricing" className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="orb absolute w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="pricing-label flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Стоимость</span>
          </div>
          <h2 className="pricing-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Прозрачные цены.<br />
            <span className="text-gradient-gold font-cormorant italic font-normal">Без скрытых платежей</span>
          </h2>
        </div>

        <div className="pricing-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card relative rounded-2xl p-6 flex flex-col transition-all duration-300 group hover:-translate-y-1.5 opacity-0 ${plan.recommended ? 'glow-gold' : ''}`}
              style={{
                background: plan.recommended ? 'var(--surface-hover)' : 'var(--surface)',
                border: plan.recommended ? '1px solid rgba(201,168,124,0.3)' : '1px solid var(--border)',
              }}
            >
              {plan.recommended && (
                <>
                  <div className="recommended-glow absolute inset-0 rounded-2xl pointer-events-none opacity-0" style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,124,0.08) 0%, transparent 70%)' }} />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-inter text-xs font-semibold px-3 py-1 rounded-full text-bg-primary bg-gold">
                      Популярный
                    </span>
                  </div>
                </>
              )}

              <div className="mb-5 pt-2">
                <div className="font-inter text-xs text-text-muted tracking-widest uppercase mb-2">{plan.name}</div>
                <div className="font-syne font-bold text-text-primary text-2xl mb-1">{plan.price} ₽</div>
                <div className="font-inter text-xs text-gold">{plan.time}</div>
              </div>

              <p className="font-inter text-text-muted text-xs leading-relaxed mb-5">{plan.desc}</p>

              <div className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: plan.recommended ? 'var(--gold)' : 'var(--text-muted)' }} />
                    <span className="font-inter text-text-muted text-xs">{f}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-xl text-sm font-inter font-medium transition-all duration-300 ${
                  plan.recommended
                    ? 'bg-gold text-bg-primary hover:bg-[#d9b88c]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
                style={{ border: plan.recommended ? 'none' : '1px solid var(--border)' }}
                onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Выбрать
              </button>
            </div>
          ))}
        </div>

        <p className="text-center font-inter text-text-muted text-sm mt-8">
          Финальная стоимость зависит от объёма задачи —{' '}
          <button
            className="text-gold hover:text-[#d9b88c] underline underline-offset-2 transition-colors duration-200"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            обсудим за 15 минут
          </button>
        </p>
      </div>
    </section>
  )
}
