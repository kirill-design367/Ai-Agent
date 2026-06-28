import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initLenis } from './lib/lenis'
import Navbar from './components/Navbar'
import Hero from './components/sections/Hero'
import Pain from './components/sections/Pain'
import Process from './components/sections/Process'
import Deliverables from './components/sections/Deliverables'
import Pricing from './components/sections/Pricing'
import Portfolio from './components/sections/Portfolio'
import Comparison from './components/sections/Comparison'
import Testimonials from './components/sections/Testimonials'
import FAQ from './components/sections/FAQ'
import CTA from './components/sections/CTA'
import Footer from './components/Footer'
import Popup from './components/Popup'

gsap.registerPlugin(ScrollTrigger)

function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(ref.current, {
          yPercent: -100,
          duration: 0.85,
          ease: 'power4.inOut',
          onComplete: onDone,
        })
      }
    })

    tl.fromTo(textRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    tl.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut', transformOrigin: 'left' }, '-=0.2')
    tl.to(textRef.current, { opacity: 0, y: -15, duration: 0.3, ease: 'power2.in' }, '-=0.2')
  }, [])

  return (
    <div ref={ref} className="fixed inset-0 z-[300] flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="noise-layer absolute inset-0 opacity-40" />
      <div ref={textRef} className="relative text-center mb-8">
        <div className="font-syne font-bold text-text-primary text-4xl tracking-[0.3em] mb-2">AUREA</div>
        <div className="font-cormorant italic text-text-muted text-base">Загружаем...</div>
      </div>
      <div className="w-48 h-px relative overflow-hidden" style={{ background: 'var(--border)' }}>
        <div ref={barRef} className="absolute inset-0 origin-left" style={{ background: 'var(--gold)' }} />
      </div>
    </div>
  )
}

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      gsap.to(dot, { x: mx, y: my, duration: 0.1, ease: 'none' })
      gsap.to(ring, { x: mx, y: my, duration: 0.35, ease: 'power2.out' })
    }

    const onEnter = () => {
      gsap.to(ring, { scale: 1.6, opacity: 0.5, duration: 0.2 })
    }
    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 0.25, duration: 0.2 })
    }

    window.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="custom-cursor fixed pointer-events-none z-[999]"
        style={{ width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      <div ref={ringRef} className="custom-cursor fixed pointer-events-none z-[998]"
        style={{ width: 32, height: 32, border: '1px solid rgba(201,168,124,0.25)', borderRadius: '50%', transform: 'translate(-50%, -50%)', opacity: 0.25 }} />
    </>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    if (ready) {
      const lenis = initLenis()
      return () => lenis.destroy()
    }
  }, [ready])

  return (
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      {!isMobile && <CustomCursor />}
      <div style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <Navbar />
        <main>
          <Hero />
          <Pain />
          <Process />
          <Deliverables />
          <Portfolio />
          <Pricing />
          <Comparison />
          <Testimonials />
          <FAQ />
          <CTA />
        </main>
        <Footer />
        <Popup />
      </div>
    </>
  )
}
