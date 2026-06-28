import React, { useRef, useState } from 'react'
import gsap from 'gsap'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
  strength?: number
}

export default function MagneticButton({ children, className = '', onClick, href, strength = 0.35 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    setIsHovered(false)
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
  }

  const handleMouseEnter = () => setIsHovered(true)

  const Tag = href ? 'a' : 'div'
  const tagProps = href ? { href } : {}

  return (
    <div
      ref={ref}
      className="magnetic-btn"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{ display: 'inline-block' }}
    >
      <Tag
        {...tagProps}
        className={`${className} transition-all duration-300 ${isHovered ? 'scale-[1.02]' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        {children}
      </Tag>
    </div>
  )
}
