import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: '01',
    title: 'Вы рассказываете',
    desc: 'Пишите в свободной форме о бизнесе, задачах и пожеланиях. 15 минут разговора — и я понимаю всё, что нужно.',
    time: '15 минут',
  },
  {
    num: '02',
    title: 'Я предлагаю концепцию',
    desc: 'Структура сайта, стиль и черновые тексты — готовы в течение 24 часов. Вы видите направление до старта работ.',
    time: '24 часа',
  },
  {
    num: '03',
    title: 'Разработка',
    desc: 'Создаю сайт на чистом коде. Вы можете следить за процессом и вносить правки напрямую — без посредников.',
    time: '1–4 дня',
  },
  {
    num: '04',
    title: 'Сдача и запуск',
    desc: 'Размещение на хостинге, подключение домена, видеоинструкция. Готов к работе — гарантия навсегда.',
    time: 'День 5',
  },
]

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.process-eyebrow',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.process-eyebrow', start: 'top 85%' } }
      )
      gsap.fromTo('.process-head',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.process-head', start: 'top 85%' } }
      )

      // Line draws downward on scroll
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1, ease: 'none',
            scrollTrigger: {
              trigger: '.process-timeline',
              start: 'top 75%',
              end: 'bottom 50%',
              scrub: 1,
            },
          }
        )
      }

      // Steps stagger in
      steps.forEach((_, i) => {
        gsap.fromTo(`.proc-step-${i}`,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.08,
            scrollTrigger: { trigger: `.proc-step-${i}`, start: 'top 84%', once: true },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="process"
      className="section-padding relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,168,124,0.04) 0%, transparent 70%)', bottom: '-5%', left: '-5%' }}
      />

      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-20 lg:mb-28">
          <div className="process-eyebrow flex items-center gap-3 mb-8">
            <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Как это работает</span>
          </div>
          <h2
            className="process-head font-syne font-bold text-text-primary"
            style={{ fontSize: 'clamp(40px, 6vw, 82px)', lineHeight: 1.05 }}
          >
            Просто. Быстро.<br />
            <span className="font-cormorant italic font-normal text-gradient-gold">Без лишних движений</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="process-timeline relative pl-10 lg:pl-20">
          {/* Vertical line */}
          <div
            ref={lineRef}
            className="absolute top-0 bottom-0"
            style={{ left: '0', width: '1px', background: 'linear-gradient(to bottom, rgba(201,168,124,0.5), rgba(201,168,124,0.15), transparent)' }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`proc-step-${i} relative opacity-0`}
              style={{ paddingBottom: i < steps.length - 1 ? 'clamp(56px, 8vw, 100px)' : '0' }}
            >
              {/* Dot */}
              <div
                className="absolute -left-10 lg:-left-20 w-2.5 h-2.5 rounded-full"
                style={{
                  top: '10px',
                  left: '-5px',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(201,168,124,0.6)',
                  boxShadow: '0 0 12px rgba(201,168,124,0.25)',
                }}
              />

              {/* Step meta */}
              <div className="flex items-center gap-4 mb-4">
                <span
                  className="font-inter text-xs tracking-[0.3em] uppercase"
                  style={{ color: 'rgba(201,168,124,0.5)' }}
                >
                  {step.num}
                </span>
                <span className="w-8 h-px" style={{ background: 'rgba(201,168,124,0.2)' }} />
                <span
                  className="font-inter text-xs tracking-[0.2em] uppercase"
                  style={{ color: 'var(--gold)' }}
                >
                  {step.time}
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-syne font-bold text-text-primary mb-4"
                style={{ fontSize: 'clamp(26px, 3.2vw, 44px)', lineHeight: 1.1 }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="font-inter text-text-muted leading-relaxed"
                style={{ fontSize: '16px', maxWidth: '480px' }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
