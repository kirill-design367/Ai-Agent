import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Plus } from 'lucide-react'
import GoldenMark from '../GoldenMark'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  { q: 'Что если мне не понравится результат?', a: 'Работаю до вашего полного удовлетворения. Перед стартом разработки мы согласовываем концепцию и структуру, поэтому неожиданностей не бывает. Бесплатные правки в течение 14 дней после сдачи.' },
  { q: 'Вы работаете по договору?', a: 'Да, заключаем договор на оказание услуг. Оплата удобным для вас способом: карта, расчётный счёт ИП, самозанятый чек. Предоплата 50%, остаток — после сдачи.' },
  { q: 'Что значит "пожизненная гарантия"?', a: 'Если сайт перестанет работать по технической причине — я устраняю проблему бесплатно, независимо от того, прошёл месяц или 5 лет. Это не маркетинг, это реальное обязательство.' },
  { q: 'Могу ли я сам редактировать сайт?', a: 'Да. После сдачи я записываю видеоинструкцию о том, как вносить базовые изменения. Для сложных правок — всегда на связи.' },
  { q: 'Что если у меня нет текстов и фото?', a: 'Не проблема. Я помогу составить структуру текстов и подберу качественные бесплатные фотографии из стоков. Копирайтинг базового уровня — в стоимости проекта.' },
  { q: 'Как вы работаете с заказчиком?', a: 'Только напрямую: Telegram или WhatsApp. Никаких менеджеров и телефонных игр в испорченный телефон. Вы всегда общаетесь с тем, кто делает ваш сайт.' },
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
      className={`faq-item-${index} rounded-xl overflow-hidden transition-all duration-300 opacity-0`}
      style={{ background: 'var(--surface)' }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-6 text-left group"
        onClick={toggle}
      >
        <span className={`font-inter font-medium text-sm leading-relaxed transition-colors duration-200 ${open ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
          {faq.q}
        </span>
        <Plus
          ref={iconRef}
          size={18}
          className={`flex-shrink-0 transition-colors duration-200 ${open ? 'text-gold' : 'text-text-muted group-hover:text-text-secondary'}`}
          strokeWidth={1.5}
        />
      </button>
      <div ref={contentRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <p className="font-inter text-text-muted text-sm leading-relaxed px-6 pb-6">{faq.a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.faq-label', start: 'top 85%' } })
      gsap.fromTo('.faq-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.faq-title', start: 'top 82%' } })

      faqs.forEach((_, i) => {
        gsap.fromTo(`.faq-item-${i}`,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.07,
            scrollTrigger: { trigger: `.faq-item-${i}`, start: 'top 88%', once: true }
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <GoldenMark variant="circles-tr" size={500} className="absolute -bottom-10 -right-10" />
      <GoldenMark variant="spiral-tl" size={350} className="absolute -top-5 left-1/3" />
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-14 text-center">
          <div className="faq-label flex items-center justify-center gap-3 mb-6">
            <span className="w-6 h-px bg-gold opacity-60" />
            <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Вопросы и ответы</span>
            <span className="w-6 h-px bg-gold opacity-60" />
          </div>
          <h2 className="faq-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Частые вопросы
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
