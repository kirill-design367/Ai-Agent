import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plus } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  { q: 'Что если мне не понравится результат?', a: 'Работаю до вашего полного удовлетворения. Перед стартом разработки мы согласовываем концепцию и структуру, поэтому неожиданностей не бывает. Бесплатные правки в течение 14 дней после сдачи.' },
  { q: 'Вы работаете по договору?', a: 'Да, заключаем договор на оказание услуг. Оплата удобным для вас способом: карта, расчётный счёт ИП, самозанятый чек. Предоплата 50%, остаток — после сдачи.' },
  { q: 'Что значит "пожизненная гарантия"?', a: 'Если сайт перестанет работать по технической причине — я устраняю проблему бесплатно, независимо от того, прошёл месяц или 5 лет. Это не маркетинг, это реальное обязательство.' },
  { q: 'Могу ли я сам редактировать сайт?', a: 'Да. После сдачи я записываю видеоинструкцию о том, как вносить базовые изменения. Для сложных правок — всегда на связи.' },
  { q: 'Что если у меня нет текстов и фото?', a: 'Не проблема. Я помогу составить структуру текстов и подберу качественные бесплатные фотографии из стоков. Копирайтинг базового уровня — в стоимости проекта.' },
  { q: 'Как вы работаете с заказчиком?', a: 'Только напрямую: Telegram или WhatsApp. Никаких менеджеров и телефонных игр. Вы всегда общаетесь с тем, кто делает ваш сайт.' },
]

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  const toggle = () => {
    const content = contentRef.current
    if (!content) return

    if (!open) {
      gsap.fromTo(content, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' })
      gsap.to(iconRef.current, { rotate: 45, duration: 0.3, ease: 'power2.out' })
    } else {
      gsap.to(content, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.in' })
      gsap.to(iconRef.current, { rotate: 0, duration: 0.3, ease: 'power2.out' })
    }
    setOpen(!open)
  }

  return (
    <div
      className={`faq-item-${index} opacity-0`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        className="w-full flex items-center justify-between gap-6 py-7 text-left group"
        onClick={toggle}
      >
        <span
          className="font-syne font-bold leading-snug transition-colors duration-200"
          style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', color: open ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {faq.q}
        </span>
        <Plus
          ref={iconRef}
          size={20}
          className="flex-shrink-0 transition-colors duration-200"
          style={{ color: open ? 'var(--gold)' : 'var(--text-muted)' }}
          strokeWidth={1.5}
        />
      </button>
      <div ref={contentRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <p
          className="font-inter leading-relaxed pb-7"
          style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '680px' }}
        >
          {faq.a}
        </p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-eyebrow',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.faq-eyebrow', start: 'top 85%' } }
      )
      gsap.fromTo('.faq-head',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.faq-head', start: 'top 82%' } }
      )

      faqs.forEach((_, i) => {
        gsap.fromTo(`.faq-item-${i}`,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.06,
            scrollTrigger: { trigger: `.faq-item-${i}`, start: 'top 88%', once: true },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-padding relative"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="faq-eyebrow flex items-center gap-3 mb-8">
          <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Вопросы и ответы</span>
        </div>
        <h2
          className="faq-head font-syne font-bold text-text-primary mb-16 lg:mb-20"
          style={{ fontSize: 'clamp(40px, 6vw, 82px)', lineHeight: 1.05 }}
        >
          Частые вопросы
        </h2>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
