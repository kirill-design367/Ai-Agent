import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CheckCircle2, Send } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({ name: '', contact: '', task: '' })
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.cta-orb-1', { y: -40, duration: 5, yoyo: true, repeat: -1, ease: 'power2.inOut' })
      gsap.to('.cta-orb-2', { y: 30, x: -20, duration: 7, yoyo: true, repeat: -1, ease: 'power1.inOut' })

      gsap.fromTo('.cta-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.cta-eyebrow', start: 'top 85%' } })
      gsap.fromTo('.cta-line', { y: '110%' }, { y: '0%', duration: 1, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: '.cta-headline-wrap', start: 'top 82%' } })
      gsap.fromTo('.cta-sub', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.cta-sub', start: 'top 84%' } })
      gsap.fromTo('.cta-form-wrap', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-form-wrap', start: 'top 80%' } })
      gsap.fromTo('.cta-trust', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.cta-trust', start: 'top 88%' } })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.name || !values.contact) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)

    if (successRef.current) {
      gsap.fromTo(successRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.5)' }
      )
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden"
      style={{ background: '#04050A', paddingTop: 'clamp(100px, 14vw, 200px)', paddingBottom: 'clamp(100px, 14vw, 200px)' }}
    >
      {/* Atmospheric orbs */}
      <div className="cta-orb-1 absolute rounded-full pointer-events-none" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,168,124,0.07) 0%, transparent 70%)', top: '-10%', right: '-5%' }} />
      <div className="cta-orb-2 absolute rounded-full pointer-events-none" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(201,168,124,0.05) 0%, transparent 70%)', bottom: '-10%', left: '-8%' }} />

      <div className="max-w-4xl mx-auto px-6 relative z-10">

        {/* Eyebrow */}
        <div className="cta-eyebrow flex items-center gap-3 mb-12">
          <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Начать проект</span>
        </div>

        {/* Big headline */}
        <div className="cta-headline-wrap mb-8">
          {['Давайте создадим', 'что-то настоящее.'].map((line, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <div
                className="cta-line font-syne font-bold"
                style={{
                  fontSize: 'clamp(48px, 7.5vw, 114px)',
                  lineHeight: 1.02,
                  color: i === 1 ? 'var(--gold)' : 'var(--text-primary)',
                }}
              >
                {line}
              </div>
            </div>
          ))}
        </div>

        <p
          className="cta-sub font-cormorant italic mb-16"
          style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          Напишите — и уже сегодня обсудим вашу задачу.<br />
          Первый ответ в течение часа.
        </p>

        {/* Form */}
        <div className="cta-form-wrap">
          <div
            className="relative rounded-2xl p-8 md:p-12"
            style={{ background: 'rgba(19,24,34,0.7)', border: '1px solid rgba(201,168,124,0.12)', backdropFilter: 'blur(10px)' }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="font-inter text-text-muted text-xs tracking-wider uppercase">Ваше имя</label>
                    <input
                      type="text"
                      value={values.name}
                      onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
                      placeholder="Александр"
                      required
                      className="premium-input w-full rounded-xl px-4 py-3.5"
                      style={{ fontSize: '15px' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-inter text-text-muted text-xs tracking-wider uppercase">Telegram или WhatsApp</label>
                    <input
                      type="text"
                      value={values.contact}
                      onChange={e => setValues(v => ({ ...v, contact: e.target.value }))}
                      placeholder="@username или +7..."
                      required
                      className="premium-input w-full rounded-xl px-4 py-3.5"
                      style={{ fontSize: '15px' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-inter text-text-muted text-xs tracking-wider uppercase">
                    Расскажите о задаче <span className="normal-case opacity-50">(необязательно)</span>
                  </label>
                  <textarea
                    value={values.task}
                    onChange={e => setValues(v => ({ ...v, task: e.target.value }))}
                    placeholder="Нужен лендинг для запуска рекламы..."
                    rows={4}
                    className="premium-input w-full rounded-xl px-4 py-3.5 resize-none"
                    style={{ fontSize: '15px' }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative inline-flex items-center gap-3 rounded-xl font-inter font-semibold overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(201,168,124,0.4)]"
                    style={{ background: 'var(--gold)', color: '#07090D', padding: '16px 40px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}
                  >
                    <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }} />
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span>Отправляю...</span>
                      </>
                    ) : (
                      <>
                        <span>Обсудить проект</span>
                        <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="font-inter text-text-muted text-xs leading-relaxed">
                    Или напрямую:{' '}
                    <a href="https://t.me/Sk_Mac1" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-[#d9b88c] transition-colors">@Sk_Mac1</a>
                    {' · '}
                    <a href="https://wa.me/79185367424" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-[#d9b88c] transition-colors">WhatsApp</a>
                  </p>
                </div>
              </form>
            ) : (
              <div ref={successRef} className="py-12 flex flex-col items-center text-center gap-7">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,124,0.1)' }}>
                    <CheckCircle2 size={40} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'rgba(201,168,124,0.3)' }} />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-text-primary text-2xl mb-3">Заявка принята!</h3>
                  <p className="font-inter text-text-muted text-sm leading-relaxed max-w-sm mx-auto">
                    Отвечу в течение часа в Telegram или WhatsApp. Уже думаю над вашим проектом.
                  </p>
                </div>
                <div className="flex gap-4">
                  <a href="https://t.me/Sk_Mac1" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-inter text-sm font-medium transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(201,168,124,0.1)', border: '1px solid rgba(201,168,124,0.2)', color: 'var(--gold)' }}>
                    <Send size={14} />Telegram
                  </a>
                  <a href="https://wa.me/79185367424" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-inter text-sm font-medium transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(201,168,124,0.1)', border: '1px solid rgba(201,168,124,0.2)', color: 'var(--gold)' }}>
                    <Send size={14} />WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="cta-trust mt-12 flex flex-wrap items-center gap-8" style={{ opacity: 0 }}>
          {['Ответ за 1 час', 'Договор и чек', 'Бесплатная консультация', 'Пожизненная гарантия'].map((b, i) => (
            <div key={i} className="flex items-center gap-2 opacity-45">
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--gold)' }} />
              <span className="font-inter text-text-muted text-xs">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
