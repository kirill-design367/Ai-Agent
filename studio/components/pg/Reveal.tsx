"use client";

import { useEffect, useRef } from "react";

/*
  REVEAL — лёгкое проявление по скроллу (progressive enhancement, §5.4).
  Контент виден без JS: скрытое состояние навешивается CSS'ом только при классе
  `.js` на <html> (см. root layout), а `is-in` включает IntersectionObserver.
  Никакого GSAP — минимум JS на первой отрисовке. reduced-motion гасится в CSS.
*/
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = Tag as React.ElementType;
  return (
    <Comp
      ref={ref}
      className={`pg-reveal ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Comp>
  );
}
