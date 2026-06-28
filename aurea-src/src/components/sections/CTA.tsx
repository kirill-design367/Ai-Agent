import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CheckCircle2, Send } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({ name: '', contact: '', task: '' })
  const orbRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating orbs
      gsap.to('.cta-orb-1', { y: -30, duration: 4, yoyo: true, repeat: -1, ease: 'power2.inOut' })
      gsap.to('.cta-orb-2', { y: 20, x: -15, duration: 5.5, yoyo: true, repeat: -1, ease: 'power1.inOut' })
      gsap.to('.cta-orb-3', { y: -20, x: 20, duration: 3.5, yoyo: true, repeat: -1, ease: 'power2.inOut' })

      // Title entrance
      gsap.fromTo('.cta-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.cta-eyebrow', start: 'top 85%' } })
      gsap.fromTo('.cta-headline', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.cta-headline', start: 'top 82%' } })
      gsap.fromTo('.cta-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.cta-sub', start: 'top 82%' } })

      // Form entrance
      gsap.fromTo('.cta-form-wrap', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-form-wrap', start: 'top 80%' } })

      // Shimmer on border
      gsap.to('.cta-shimmer', { backgroundPosition: '200% center', duration: 3, repeat: -1, ease: 'none' })
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
    <section ref={sectionRef} id="contact" className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Decorative orbs */}
      <div className="cta-orb-1 absolute w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.07) 0%, transparent 70%)', top: '-10%', right: '-5%' }} />
      <div className="cta-orb-2 absolute w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.05) 0%, transparent 70%)', bottom: '-5%', left: '-10%' }} />
      <div className="cta-orb-3 absolute w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,158,199,0.04) 0%, transparent 70%)', top: '40%', left: '20%' }} />

      {/* Noise overlay */}
      <div className="noise-layer absolute inset-0 pointer-events-none opacity-30" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="cta-eyebrow flex items-center justify-center gap-3 mb-8">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Начать проект</span>
            <span className="w-6 h-px bg-gold opacity-60" />
          </div>

          <h2 className="cta-headline font-syne font-bold text-text-primary mb-6" style={{ fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1.05 }}>
            Готовы запустить<br />
            <span className="text-gradient-gold font-cormorant italic font-normal" style={{ fontSize: 'clamp(44px, 7vw, 88px)' }}>
              сайт вашей мечты?
            </span>
          </h2>

          <p className="cta-sub font-inter text-text-muted text-base leading-relaxed max-w-lg mx-auto">
            Напишите — и уже сегодня обсудим вашу задачу. Первый ответ в течение часа.
          </p>
        </div>

        {/* Form card */}
        <div className="cta-form-wrap relative">
          {/* Shimmer border */}
          <div className="cta-shimmer absolute -inset-px rounded-2xl pointer-events-none opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,124,0.4) 50%, transparent 100%)',
              backgroundSize: '200% auto',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1px',
            }}
          />

          <div className="relative rounded-2xl p-10 md:p-14" style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,124,0.15)' }}>
            {!submitted ? (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="font-inter text-text-muted text-xs tracking-wider uppercase">Ваше имя</label>
                    <input
                      type="text"
                      value={values.name}
                      onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
                      placeholder="Александр"
                      required
                      className="premium-input"
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
                      className="premium-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-inter text-text-muted text-xs tracking-wider uppercase">Расскажите о задаче <span className="normal-case opacity-50">(необязательно)</span></label>
                  <textarea
                    value={values.task}
                    onChange={e => setValues(v => ({ ...v, task: e.target.value }))}
                    placeholder="Нужен лендинг для запуска рекламы..."
                    rows={4}
                    className="premium-input resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-inter font-semibold text-bg-primary transition-all duration-300 overflow-hidden"
                    style={{ background: loading ? 'rgba(201,168,124,0.7)' : 'var(--gold)', minWidth: '220px' }}
                  >
                    {/* Hover shimmer */}
                    <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />

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
                        <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="font-inter text-text-muted text-xs text-center sm:text-left">
                    Или напишите напрямую:<br />
                    <a href="https://t.me/Sk_Mac1" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-[#d9b88c] transition-colors">@Sk_Mac1</a>
                    {' · '}
                    <a href="https://wa.me/79185367424" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-[#d9b88c] transition-colors">WhatsApp</a>
                  </p>
                </div>
              </form>
            ) : (
              <div ref={successRef} className="py-10 flex flex-col items-center text-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,124,0.12)' }}>
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(201,168,124,0.1)', border: '1px solid rgba(201,168,124,0.2)', color: 'var(--gold)' }}>
                    <Send size={14} />
                    Telegram
                  </a>
                  <a href="https://wa.me/79185367424" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(201,168,124,0.1)', border: '1px solid rgba(201,168,124,0.2)', color: 'var(--gold)' }}>
                    <Send size={14} />
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {[
            { label: 'Ответ за 1 час' },
            { label: 'Договор и чек' },
            { label: 'Бесплатная консультация' },
            { label: 'Пожизненная гарантия' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 opacity-50">
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span className="font-inter text-text-muted text-xs">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
