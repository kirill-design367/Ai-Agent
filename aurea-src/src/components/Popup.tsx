import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { X, ArrowRight } from 'lucide-react'

export default function Popup() {
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('popup-dismissed')) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, 20000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible || closed) return

    const overlay = overlayRef.current
    const card = cardRef.current
    if (!overlay || !card) return

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    gsap.fromTo(card,
      { scale: 0.88, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.4)', delay: 0.1 }
    )
  }, [visible, closed])

  const dismiss = () => {
    const overlay = overlayRef.current
    const card = cardRef.current
    if (!overlay || !card) { setClosed(true); return }

    gsap.to(card, { scale: 0.9, y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' })
    gsap.to(overlay, {
      opacity: 0, duration: 0.35, delay: 0.1, ease: 'power2.in',
      onComplete: () => { setClosed(true); sessionStorage.setItem('popup-dismissed', '1') }
    })
  }

  if (!visible || closed) return null

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: 'rgba(7,9,13,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div ref={cardRef} className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,124,0.2)' }}>
        {/* Gold top line */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,124,0.08) 0%, transparent 70%)' }} />

        {/* Close */}
        <button onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
          aria-label="Закрыть">
          <X size={15} strokeWidth={2} />
        </button>

        <div className="p-8 pt-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-inter"
            style={{ background: 'rgba(201,168,124,0.1)', border: '1px solid rgba(201,168,124,0.2)', color: 'var(--gold)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            Специальное предложение
          </div>

          <h3 className="font-syne font-bold text-text-primary text-2xl mb-3" style={{ lineHeight: 1.2 }}>
            Бесплатный аудит<br />вашего сайта
          </h3>

          <p className="font-inter text-text-muted text-sm leading-relaxed mb-7">
            Разберу текущий сайт по 12 параметрам: скорость, конверсия, дизайн. Покажу, что теряете прямо сейчас — и как это исправить.
          </p>

          <div className="space-y-3 mb-7">
            {['Анализ скорости и Core Web Vitals', 'Оценка конверсионных элементов', 'Сравнение с конкурентами'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,124,0.12)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                </span>
                <span className="font-inter text-text-secondary text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://t.me/Sk_Mac1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-inter font-semibold text-bg-primary text-sm transition-all duration-200 hover:brightness-105 relative overflow-hidden"
              style={{ background: 'var(--gold)' }}
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 skew-x-12"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
              Получить аудит бесплатно
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <button onClick={dismiss}
              className="w-full py-2.5 rounded-xl font-inter text-text-muted text-sm hover:text-text-secondary transition-colors duration-200">
              Спасибо, не нужно
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
