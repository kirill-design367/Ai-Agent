import React, { useMemo } from 'react'

const PHI = 1.618033988749895
const GOLDEN_ANGLE_RAD = 2.3999632 // 137.507764°

// Logarithmic Fibonacci spiral — the core of golden ratio geometry
function genSpiral(cx: number, cy: number, baseR: number, maxDeg: number): string {
  const pts: string[] = []
  for (let t = 0; t <= maxDeg; t += 3) {
    const rad = (t * Math.PI) / 180
    const r = baseR * Math.pow(PHI, t / 90)
    pts.push(`${(cx + r * Math.cos(rad)).toFixed(1)},${(cy + r * Math.sin(rad)).toFixed(1)}`)
  }
  return 'M ' + pts.join(' L ')
}

// Points distributed at golden angle increments (sunflower/phyllotaxis)
function goldenPoints(cx: number, cy: number, n: number, scale: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = i * GOLDEN_ANGLE_RAD
    const r = scale * Math.sqrt(i + 1)
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

// Concentric circles at phi ratio sizes
function phiCircles(cx: number, cy: number, r0: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    cx: cx + Math.sin(i * 1.2) * r0 * 0.3, // slight chaotic offset
    cy: cy + Math.cos(i * 0.8) * r0 * 0.2,
    r: r0 * Math.pow(PHI, i),
  }))
}

export type GoldenVariant =
  | 'spiral-br'   // spiral from bottom-right
  | 'spiral-tl'   // spiral from top-left
  | 'circles-tr'  // phi circles top-right
  | 'circles-bl'  // phi circles bottom-left
  | 'sunflower'   // golden angle dot field
  | 'rects'       // nested golden rectangles

interface GoldenMarkProps {
  variant?: GoldenVariant
  size?: number
  baseColor?: string
  className?: string
  style?: React.CSSProperties
}

export default function GoldenMark({
  variant = 'spiral-br',
  size = 700,
  baseColor = '#C9A87C',
  className = '',
  style = {},
}: GoldenMarkProps) {
  const s = size

  const elements = useMemo(() => {
    switch (variant) {
      case 'spiral-br': {
        // Spiral grows inward from bottom-right corner
        const path1 = genSpiral(s, s, 6, 560)
        const path2 = genSpiral(s * 0.75, s * 0.85, 4, 490)
        const circles = phiCircles(s * 0.6, s * 0.7, 18, 5)
        return (
          <>
            <path d={path1} stroke={baseColor} strokeWidth="0.6" opacity="0.12" />
            <path d={path2} stroke={baseColor} strokeWidth="0.4" opacity="0.06" />
            {circles.map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.5" opacity={0.05 - i * 0.005} fill="none" />
            ))}
            {/* Diagonal line at golden angle from corner */}
            <line x1={s} y1={s * 0.4} x2={s * 0.3} y2={s}
              stroke={baseColor} strokeWidth="0.4" opacity="0.07" />
            <line x1={s * 0.8} y1={s} x2={s} y2={s * 0.1}
              stroke={baseColor} strokeWidth="0.3" opacity="0.05" />
          </>
        )
      }

      case 'spiral-tl': {
        const path1 = genSpiral(0, 0, 6, 560)
        const path2 = genSpiral(s * 0.2, s * 0.15, 4, 490)
        const circles = phiCircles(s * 0.35, s * 0.25, 22, 4)
        return (
          <>
            <path d={path1} stroke={baseColor} strokeWidth="0.6" opacity="0.11" />
            <path d={path2} stroke={baseColor} strokeWidth="0.4" opacity="0.06" />
            {circles.map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.5" opacity={0.06 - i * 0.008} fill="none" />
            ))}
            <line x1="0" y1={s * 0.55} x2={s * 0.7} y2="0"
              stroke={baseColor} strokeWidth="0.4" opacity="0.06" />
          </>
        )
      }

      case 'circles-tr': {
        // Multiple phi-ratio circles bursting from top-right
        const c1 = phiCircles(s * 0.85, s * 0.12, 30, 6)
        const c2 = phiCircles(s * 0.55, s * 0.4, 14, 4)
        // A small spiral accent
        const accent = genSpiral(s * 0.9, 0, 5, 450)
        return (
          <>
            {c1.map((c, i) => (
              <circle key={`a${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.6" opacity={0.10 - i * 0.012} fill="none" />
            ))}
            {c2.map((c, i) => (
              <circle key={`b${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.4" opacity={0.06 - i * 0.01} fill="none" />
            ))}
            <path d={accent} stroke={baseColor} strokeWidth="0.5" opacity="0.08" />
            <line x1={s * 0.7} y1="0" x2={s} y2={s * 0.55}
              stroke={baseColor} strokeWidth="0.35" opacity="0.06" />
          </>
        )
      }

      case 'circles-bl': {
        const c1 = phiCircles(s * 0.12, s * 0.88, 28, 5)
        const c2 = phiCircles(s * 0.4, s * 0.62, 16, 4)
        const accent = genSpiral(0, s, 5, 430)
        return (
          <>
            {c1.map((c, i) => (
              <circle key={`a${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.6" opacity={0.09 - i * 0.01} fill="none" />
            ))}
            {c2.map((c, i) => (
              <circle key={`b${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.4" opacity={0.05 - i * 0.008} fill="none" />
            ))}
            <path d={accent} stroke={baseColor} strokeWidth="0.5" opacity="0.08" />
          </>
        )
      }

      case 'sunflower': {
        // Golden angle point distribution — phyllotaxis pattern
        const pts = goldenPoints(s / 2, s / 2, 120, s * 0.022)
        const spiralAccent = genSpiral(s * 0.5, s * 0.5, 3, 600)
        return (
          <>
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i < 20 ? 1.2 : 0.8}
                fill={baseColor} opacity={0.07 - (i / 120) * 0.04} />
            ))}
            <path d={spiralAccent} stroke={baseColor} strokeWidth="0.5" opacity="0.06" />
          </>
        )
      }

      case 'rects': {
        // Nested golden rectangles rotated at different golden-angle increments
        const rects = [
          { w: 340, h: 340 / PHI, x: s * 0.35, y: s * 0.28, rot: 0 },
          { w: 340 / PHI, h: 340 / (PHI * PHI), x: s * 0.5, y: s * 0.45, rot: 34.5 },
          { w: 340 / (PHI * PHI), h: 340 / (PHI * PHI * PHI), x: s * 0.6, y: s * 0.55, rot: 69 },
          { w: 200, h: 200 / PHI, x: s * 0.2, y: s * 0.65, rot: -21 },
        ]
        const circleAccent = phiCircles(s * 0.75, s * 0.25, 20, 5)
        return (
          <>
            {rects.map((r, i) => (
              <rect key={i}
                x={r.x - r.w / 2} y={r.y - r.h / 2}
                width={r.w} height={r.h}
                stroke={baseColor} strokeWidth="0.6"
                opacity={0.08 - i * 0.012} fill="none"
                transform={`rotate(${r.rot}, ${r.x}, ${r.y})`}
              />
            ))}
            {circleAccent.map((c, i) => (
              <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={baseColor}
                strokeWidth="0.4" opacity={0.05 - i * 0.006} fill="none" />
            ))}
            <line x1={s * 0.1} y1={s * 0.85} x2={s * 0.9} y2={s * 0.15}
              stroke={baseColor} strokeWidth="0.4" opacity="0.05" />
          </>
        )
      }

      default:
        return null
    }
  }, [variant, s, baseColor])

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible', ...style }}
      aria-hidden="true"
    >
      {elements}
    </svg>
  )
}
