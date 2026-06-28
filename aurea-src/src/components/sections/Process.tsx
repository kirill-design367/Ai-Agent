import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MessageSquare, Lightbulb, Code2, Rocket } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: MessageSquare,
    num: '01',
    title: 'Вы рассказываете',
    desc: 'Пишите в свободной форме о бизнесе, задачах и пожеланиях. 15 минут разговора — и я понимаю всё что нужно.',
    time: '15 минут',
  },
  {
    icon: Lightbulb,
    num: '02',
    title: 'Я предлагаю концепцию',
    desc: 'Структура сайта, стиль и черновые тексты — готовы в течение 24 часов. Вы видите направление до старта.',
    time: '24 часа',
  },
  {
    icon: Code2,
    num: '03',
    title: 'Разработка',
    desc: 'Создаю сайт на чистом коде. Вы можете следить за процессом и вносить правки напрямую — без посредников.',
    time: '1–4 дня',
  },
  {
    icon: Rocket,
    num: '04',
    title: 'Сдача и запуск',
    desc: 'Размещение на хостинге, подключение домена, инструкция. Готов к работе — гарантия навсегда.',
    time: 'День 5',
  },
]

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.process-label',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.process-label', start: 'top 85%' } }
      )
      gsap.fromTo('.process-title',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.process-title', start: 'top 85%' } }
      )

      // Animate line drawing
      if (lineRef.current) {
        const len = lineRef.current.getTotalLength()
        gsap.set(lineRef.current, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(lineRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
          },
        })
      }

      // Steps animate in sequence
      steps.forEach((_, i) => {
        gsap.fromTo(`.process-step-${i}`,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40, scale: 0.95 },
          {
            opacity: 1, x: 0, scale: 1,
            duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: `.process-step-${i}`,
              start: 'top 80%',
              onEnter: () => {
                gsap.fromTo(`.step-icon-${i}`,
                  { scale: 0, rotate: -20 },
                  { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)', delay: 0.2 }
                )
              }
            }
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="process" className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="orb absolute w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)', bottom: '-10%', left: '-5%' }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <div className="process-label flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Как это работает</span>
          </div>
          <h2 className="process-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Просто. Быстро.<br />
            <span className="text-gradient-gold font-cormorant italic font-normal">Без лишних движений</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="process-timeline relative">
          {/* SVG connecting line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
            <svg width="2" height="100%" style={{ position: 'absolute', left: 0 }}>
              <path
                ref={lineRef}
                d="M 1 0 L 1 10000"
                stroke="rgba(201,168,124,0.3)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isRight = i % 2 !== 0

              return (
                <div
                  key={i}
                  className={`process-step-${i} ${isRight ? 'lg:col-start-2' : ''} opacity-0`}
                >
                  <div
                    className="relative p-7 rounded-2xl hover:border-[rgba(201,168,124,0.2)] transition-all duration-500 group"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    {/* Step number */}
                    <div className="absolute -top-4 left-7">
                      <span className="font-syne font-bold text-xs tracking-[0.2em] text-text-muted px-3 py-1 rounded-full" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        {step.num}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`step-icon-${i} flex items-center justify-center w-12 h-12 rounded-xl mb-5`} style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                      <Icon size={22} className="text-gold" strokeWidth={1.5} />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-syne font-bold text-text-primary text-lg mb-2 group-hover:text-white transition-colors duration-300">{step.title}</h3>
                        <p className="font-inter text-text-muted text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    {/* Time badge */}
                    <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="font-inter text-xs text-gold tracking-widest uppercase">{step.time}</span>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,124,0.03) 0%, transparent 70%)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
