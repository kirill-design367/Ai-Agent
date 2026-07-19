"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  CANVAS — режиссура полотна (эталон Locomotive/Obys). НЕ стек секций, а одна
  композиция, через которую едет пользователь. Прогрессивное усиление поверх
  SSR-разметки (контент в HTML → SEO/LCP целы). Всё под reduce-motion выключается,
  полотно остаётся статичным и читаемым (фолбэк-фоны заданы в CSS на [data-zone]).

  Механики (калибровка по покадровому разбору locomotive.ca / obys.agency):
  • [data-speed]      — разноскоростной параллакс: y = (speed-1)·range, scrub.
  • [data-zone]       — фон и текст МЕНЯЮТСЯ ПОД контентом: при входе светлой зоны
                        в середину экрана плавно кроссфейдим --cv-bg/--cv-fg.
  • [data-track]      — кейсы: пин секции + горизонтальная прокрутка индекса работ.
  • [data-preview]    — превью кейса следует за курсором (истинный Locomotive).
*/
export default function Canvas() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    registerGsap();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector<HTMLElement>("[data-canvas]");
    if (!root) return;

    // canvas-live: CSS переключает фолбэк-фоны зон на прозрачные (фон ведёт JS)
    if (!reduce) root.classList.add("canvas-live");

    const cleanups: Array<() => void> = [];
    const sts: ScrollTrigger[] = [];

    if (!reduce) {
      const ctx = gsap.context(() => {
        // ── 1. РАЗНОСКОРОСТНОЙ ПАРАЛЛАКС ──────────────────────────────────
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const speed = parseFloat(el.dataset.speed || "1");
          if (speed === 1) return;
          gsap.fromTo(
            el,
            { yPercent: (1 - speed) * 14 },
            {
              yPercent: (speed - 1) * 14,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
            }
          );
        });

        // ── 2. ФОН/ТЕКСТ МЕНЯЮТСЯ ПОД КОНТЕНТОМ (плавно, не жёстким стыком) ──
        const DARK = { bg: "#0b0a09", fg: "#f3efe6" };
        const LIGHT = { bg: "#f0ebe0", fg: "#17130d" };
        gsap.utils.toArray<HTMLElement>('[data-zone="light"]').forEach((zone) => {
          const to = (v: { bg: string; fg: string }) =>
            gsap.to(root, {
              "--cv-bg": v.bg,
              "--cv-fg": v.fg,
              duration: 0.6,
              ease: "power2.inOut",
              overwrite: "auto",
            });
          ScrollTrigger.create({
            trigger: zone,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: () => to(LIGHT),
            onEnterBack: () => to(LIGHT),
            onLeave: () => to(DARK),
            onLeaveBack: () => to(DARK),
          });
        });

        // ── 3. КЕЙСЫ: пин + горизонтальная прокрутка индекса работ ──────────
        const track = document.querySelector<HTMLElement>("[data-track]");
        const wrap = document.querySelector<HTMLElement>("[data-track-wrap]");
        if (track && wrap && window.innerWidth > 860) {
          const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
          gsap.to(track, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: () => "+=" + dist(),
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
        }
      }, root);
      cleanups.push(() => ctx.revert());
    }

    // ── 4. ПРЕВЬЮ КЕЙСА У КУРСОРА (работает и без «полотна»/на всех тач-hover) ──
    if (!window.matchMedia("(hover: none)").matches) {
      const onMove = (e: PointerEvent) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        const row = t.closest<HTMLElement>("[data-preview]");
        const layer = root.querySelector<HTMLElement>("[data-preview-layer]");
        if (!layer) return;
        if (row) {
          const src = row.dataset.preview;
          const img = layer.querySelector("img");
          if (src && img && img.getAttribute("src") !== src) img.setAttribute("src", src);
          layer.style.setProperty("--px", e.clientX + "px");
          layer.style.setProperty("--py", e.clientY + "px");
          layer.classList.add("is-on");
        } else {
          layer.classList.remove("is-on");
        }
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => document.removeEventListener("pointermove", onMove));
    }

    ScrollTrigger.refresh();
    return () => {
      cleanups.forEach((c) => c());
      sts.forEach((s) => s.kill());
      root.classList.remove("canvas-live");
    };
  }, [pathname]);

  return null;
}
