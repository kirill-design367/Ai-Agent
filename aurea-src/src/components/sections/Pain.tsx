import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pains = [
  {
    num: '01',
    headline: 'Месяц стал тремя',
    body: 'Студия говорит «2–4 недели». Потом согласования, правки, выходные. В итоге — 3 месяца. Бизнес стоит.',
  },
  {
    num: '02',
    headline: 'Шаблон за 100 тысяч',
    body: 'Вы платите за «уникальный дизайн». Получаете WordPress-тему за $49 с переставленными блоками.',
  },
  {
    num: '03',
    headline: 'Никто не берёт трубку',
    body: 'Менеджер ушёл в отпуск. Дизайнер занят другим. Правки — «в следующем спринте». Вы просто ждёте.',
  },
  {
    num: '04',
    headline: 'Сайт умер через год',
    body: 'Студия закрылась или подняла ценник на поддержку в 3 раза. Сайт висит и теряет клиентов каждый день.',
  },
]

export default function Pain() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pain-hook',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.pain-hook', start: 'top 80%' } }
      )

      pains.forEach((_, i) => {
        gsap.fromTo(`.pain-row-${i}`,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.75, ease: 'power3.out', delay: i * 0.07,
            scrollTrigger: { trigger: `.pain-row-${i}`, start: 'top 86%', once: true },
          }
        )
      })

      gsap.fromTo('.pain-resolution',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.pain-resolution', start: 'top 87%' } }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '500px', height: '500px', background: 'radial-gradient(circle at 80% 10%, rgba(201,168,124,0.05) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center gap-3 mb-16">
          <span className="w-6 h-px bg-gold opacity-60" />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Знакомая ситуация?</span>
        </div>

        <div className="pain-hook opacity-0 mb-20">
          <h2
            className="font-syne font-bold text-text-primary"
            style={{ fontSize: 'clamp(34px, 5vw, 68px)', lineHeight: 1.1, maxWidth: '700px' }}
          >
            Большинство клиентов<br />
            <span
              className="font-cormorant italic font-normal"
              style={{ color: 'var(--gold)', fontSize: '1.1em' }}
            >
              уже это пережили.
            </span>
          </h2>
        </div>

        <div className="mb-2 h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,124,0.35), transparent)' }} />

        {pains.map((p, i) => (
          <div
            key={i}
            className={`pain-row-${i} opacity-0`}
            style={{
              borderBottom: i < pains.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              paddingTop: '36px',
              paddingBottom: '36px',
            }}
          >
            <div className="grid grid-cols-[48px_1fr] lg:grid-cols-[88px_minmax(0,300px)_1fr] gap-4 lg:gap-12 items-start">
              <span
                className="font-syne font-bold leading-none select-none flex-shrink-0"
                style={{ fontSize: 'clamp(30px, 3.5vw, 52px)', color: 'var(--text-primary)', opacity: 0.1 }}
              >
                {p.num}
              </span>
              <h3
                className="font-syne font-bold text-text-primary"
                style={{ fontSize: 'clamp(20px, 2.2vw, 32px)', lineHeight: 1.2 }}
              >
                {p.headline}
              </h3>
              <p
                className="font-inter text-text-muted leading-relaxed col-start-2 lg:col-start-auto"
                style={{ fontSize: '15px', maxWidth: '440px' }}
              >
                {p.body}
              </p>
            </div>
          </div>
        ))}

        <div className="pain-resolution opacity-0 mt-20">
          <p
            className="font-cormorant italic"
            style={{ fontSize: 'clamp(22px, 2.8vw, 36px)', color: 'var(--text-muted)' }}
          >
            Я работаю иначе —{' '}
            <span style={{ color: 'var(--gold)' }}>напрямую с вами.</span>
          </p>
        </div>

      </div>
    </section>
  )
}
