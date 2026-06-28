import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'
import GoldenMark from '../GoldenMark'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  { title: 'Анна Рыковская', niche: 'Стилист-имиджмейкер', tag: 'Сайт-визитка', days: '1 день', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)', accent: '#E8D5B0' },
  { title: 'Volume Records', niche: 'Студия звукозаписи', tag: 'Корпоративный', days: '3 дня', gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #2d1200 100%)', accent: '#C9A87C' },
  { title: 'AIINSTIDE', niche: 'Агентство недвижимости', tag: 'Лендинг', days: '2 дня', gradient: 'linear-gradient(135deg, #050810 0%, #0c1220 50%, #141c30 100%)', accent: '#8B9EC7' },
  { title: 'Forest Cabins', niche: 'Аренда домиков', tag: 'Лендинг', days: '1 день', gradient: 'linear-gradient(135deg, #050f05 0%, #0a1a0a 50%, #102010 100%)', accent: '#7AB87A' },
  { title: 'UNFUR Studio', niche: 'Fashion-бренд', tag: 'Корпоративный', days: '4 дня', gradient: 'linear-gradient(135deg, #100808 0%, #1a0d0d 50%, #250f0f 100%)', accent: '#C47B7B' },
  { title: 'TechLaunch Pro', niche: 'SaaS-продукт', tag: 'Лендинг', days: '2 дня', gradient: 'linear-gradient(135deg, #050810 0%, #0a0e1a 50%, #101525 100%)', accent: '#7B9BC4' },
]

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.portfolio-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.portfolio-label', start: 'top 85%' } })
      gsap.fromTo('.portfolio-title', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.portfolio-title', start: 'top 82%' } })

      // Horizontal scroll
      const track = trackRef.current
      const section = sectionRef.current
      if (!track || !section) return

      const totalWidth = track.scrollWidth
      const viewWidth = window.innerWidth

      gsap.to(track, {
        x: -(totalWidth - viewWidth + 48),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${totalWidth - viewWidth + 200}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      // Cards reveal
      gsap.fromTo('.port-card',
        { opacity: 0, scale: 0.92, y: 40 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="portfolio" className="relative" style={{ background: 'var(--bg-secondary)' }}>
      <GoldenMark variant="sunflower" size={500} className="absolute top-0 left-1/2 -translate-x-1/4 opacity-80" />
      {/* Header — outside pinned area */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="portfolio-label flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-gold opacity-60" />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Портфолио</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <h2 className="portfolio-title font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            Избранные<br />работы
          </h2>
          <p className="font-inter text-text-muted text-sm max-w-xs leading-relaxed">
            Каждый проект — уникальное решение под конкретный бизнес. Никаких шаблонов.
          </p>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div ref={containerRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-5 pl-6 pr-24" style={{ width: 'max-content' }}>
          {projects.map((p, i) => (
            <div
              key={i}
              className="port-card relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group opacity-0"
              style={{ width: 'clamp(280px, 35vw, 480px)', height: 'clamp(360px, 55vh, 580px)', background: p.gradient }}
            >
              {/* Decorative elements inside card */}
              <div className="absolute inset-0">
                {/* Noise */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`, backgroundSize: '150px' }} />

                {/* Center glow */}
                <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-700" style={{ background: `radial-gradient(ellipse at 60% 30%, ${p.accent}22 0%, transparent 60%)` }} />

                {/* Project number */}
                <div className="absolute top-6 right-6 font-syne font-bold text-xs tracking-[0.2em] opacity-20" style={{ color: p.accent }}>
                  0{i + 1}
                </div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              </div>

              {/* Zoom on hover image area */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105" style={{ background: p.gradient }} />

              {/* Reveal mask on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${p.accent}08 0%, transparent 50%)` }} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-7">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-inter text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: p.accent }}>
                      {p.tag}
                    </span>
                    <span className="font-inter text-xs opacity-50" style={{ color: p.accent }}>{p.days}</span>
                  </div>
                  <h3 className="font-syne font-bold text-white text-xl mb-1">{p.title}</h3>
                  <p className="font-inter text-sm opacity-60 text-white">{p.niche}</p>
                </div>

                {/* Hover arrow */}
                <div className="absolute top-6 left-6 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <ArrowUpRight size={15} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-12">
        <p className="font-inter text-text-muted text-sm">
          Ссылки на живые проекты — по запросу в личные сообщения
        </p>
      </div>
    </section>
  )
}
