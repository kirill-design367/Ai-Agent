import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const BASE = import.meta.env.BASE_URL

const projects = [
  {
    title: 'Анна Рыковская',
    niche: 'Стилист-имиджмейкер',
    tag: 'Сайт-визитка',
    days: '1 день',
    img: `${BASE}images/portfolio/p1.jpg`,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    accent: '#E8D5B0',
  },
  {
    title: 'Volume Records',
    niche: 'Студия звукозаписи',
    tag: 'Корпоративный',
    days: '3 дня',
    img: `${BASE}images/portfolio/p2.jpg`,
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #2d1200 100%)',
    accent: '#C9A87C',
  },
  {
    title: 'AIINSTIDE',
    niche: 'Агентство недвижимости',
    tag: 'Лендинг',
    days: '2 дня',
    img: '',
    gradient: 'linear-gradient(135deg, #050810 0%, #0c1220 50%, #141c30 100%)',
    accent: '#8B9EC7',
  },
  {
    title: 'Forest Cabins',
    niche: 'Аренда домиков',
    tag: 'Лендинг',
    days: '1 день',
    img: '',
    gradient: 'linear-gradient(135deg, #050f05 0%, #0a1a0a 50%, #102010 100%)',
    accent: '#7AB87A',
  },
  {
    title: 'UNFUR Studio',
    niche: 'Fashion-бренд',
    tag: 'Корпоративный',
    days: '4 дня',
    img: '',
    gradient: 'linear-gradient(135deg, #100808 0%, #1a0d0d 50%, #250f0f 100%)',
    accent: '#C47B7B',
  },
]

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.portfolio-label',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.portfolio-label', start: 'top 85%' } }
      )
      gsap.fromTo('.portfolio-title',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out', scrollTrigger: { trigger: '.portfolio-title', start: 'top 82%' } }
      )

      const track = trackRef.current
      if (!track) return

      const totalWidth = track.scrollWidth
      const viewWidth = window.innerWidth

      gsap.to(track, {
        x: -(totalWidth - viewWidth + 64),
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

      gsap.fromTo('.port-card',
        { opacity: 0, scale: 0.88, y: 50 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 1, stagger: 0.12, ease: 'power4.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="portfolio" className="relative" style={{ background: 'var(--bg-primary)' }}>

      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 pb-14">
        <div className="portfolio-label flex items-center gap-3 mb-8">
          <span className="w-6 h-px opacity-60" style={{ background: 'var(--gold)' }} />
          <span className="font-inter text-text-muted text-xs tracking-[0.25em] uppercase">Портфолио</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <h2
            className="portfolio-title font-syne font-bold text-text-primary"
            style={{ fontSize: 'clamp(44px, 7vw, 100px)', lineHeight: 1.0 }}
          >
            Избранные<br />работы
          </h2>
          <p className="font-inter text-text-muted text-sm max-w-xs leading-relaxed" style={{ paddingBottom: '6px' }}>
            Каждый проект — уникальное решение<br />под конкретный бизнес.
          </p>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div ref={containerRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-4 pl-6 lg:pl-12 pr-24" style={{ width: 'max-content' }}>
          {projects.map((p, i) => (
            <div
              key={i}
              className="port-card relative flex-shrink-0 overflow-hidden cursor-pointer group opacity-0"
              style={{
                width: 'clamp(300px, 38vw, 520px)',
                height: 'clamp(500px, 78vh, 820px)',
                borderRadius: '16px',
                background: p.img ? undefined : p.gradient,
              }}
            >
              {/* Background image or gradient */}
              {p.img ? (
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${p.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                  }}
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ background: p.gradient }}
                  />
                  {/* Noise texture on gradient cards */}
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                      backgroundSize: '150px',
                    }}
                  />
                </>
              )}

              {/* Gradient overlay — always present */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)' }}
              />

              {/* Accent glow */}
              <div
                className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                style={{ background: `radial-gradient(ellipse at 70% 20%, ${p.accent}22 0%, transparent 60%)` }}
              />

              {/* Top-left: project number */}
              <div className="absolute top-7 left-7 font-syne font-bold" style={{ fontSize: '12px', letterSpacing: '0.25em', color: `${p.accent}66` }}>
                0{i + 1}
              </div>

              {/* Top-right: link icon */}
              <div
                className="absolute top-7 right-7 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <ArrowUpRight size={16} className="text-white" />
              </div>

              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-7 pb-8">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400 ease-out">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span
                      className="font-inter text-xs px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)', color: p.accent }}
                    >
                      {p.tag}
                    </span>
                    <span className="font-inter text-xs opacity-45 text-white">{p.days}</span>
                  </div>
                  <h3 className="font-syne font-bold text-white mb-1.5" style={{ fontSize: 'clamp(20px, 2.2vw, 28px)' }}>
                    {p.title}
                  </h3>
                  <p className="font-inter text-sm text-white opacity-50">{p.niche}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 pt-10">
        <p className="font-inter text-text-muted text-sm">
          Ссылки на живые проекты — по запросу в личные сообщения
        </p>
      </div>
    </section>
  )
}
