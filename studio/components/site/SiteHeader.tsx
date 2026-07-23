"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/seo/site";

/*
  ШАПКА — узкая верхняя панель (реф noth.in / MONOLOG):
  • лого AUREA слева — ВЕКТОРНЫЙ вордмарк; при прокрутке сворачивается до Λ
    (крупный акцент, вровень по весу с правой группой);
  • справа — два элемента в ряд: «Обсудить проект» (CTA) и «меню» (строчными,
    тем же весом) — открывает ПОЛНОЭКРАННЫЙ оверлей;
  • оверлей: пункты крупным кеглем (Druk) слева друг под другом со стаггером,
    внизу — контакты. Закрытие: «закрыть», Esc, клик по фону. Бургера нет —
    одна механика на десктопе и мобиле.
  mix-blend-difference → авто-контраст ч/б. Панель sticky, CLS=0.
*/
const NAV = [
  { href: "/uslugi/", label: "Услуги" },
  { href: "/dlya-biznesa/", label: "Для бизнеса" },
  { href: "/keisy/", label: "Кейсы" },
  { href: "/blog/", label: "Блог" },
  { href: "/o-studii/", label: "О студии" },
  { href: "/kontakty/", label: "Контакты" },
];

// Векторный вордмарк — полилинии по тем же координатам, что particle-надпись.
function Logo() {
  return (
    <svg className="site-logo" viewBox="-2.175 -0.085 4.41 1.17" role="img" aria-label="AUREA"
      fill="none" stroke="currentColor" strokeWidth="0.13" strokeLinejoin="round" strokeLinecap="round">
      {/* Λ1 — остаётся при прокрутке */}
      <path d="M-2.09 1L-1.72 0L-1.35 1" />
      <circle cx="-1.72" cy="0.73" r="0.055" fill="currentColor" stroke="none" />
      {/* остальные буквы — растворяются при прокрутке */}
      <g className="lg-rest">
        <path d="M-1.12 0L-1.12 0.68L-1.115 0.732L-1.102 0.783L-1.08 0.83L-1.05 0.873L-1.013 0.91L-0.97 0.94L-0.923 0.962L-0.872 0.975L-0.82 0.98L-0.768 0.975L-0.717 0.962L-0.67 0.94L-0.627 0.91L-0.59 0.873L-0.56 0.83L-0.538 0.783L-0.525 0.732L-0.52 0.68L-0.52 0" />
        <path d="M-0.23 1L-0.23 0L0.09 0L0.107 0.001L0.125 0.003L0.142 0.007L0.158 0.012L0.175 0.019L0.19 0.027L0.205 0.036L0.219 0.047L0.231 0.059L0.243 0.071L0.254 0.085L0.263 0.1L0.271 0.115L0.278 0.132L0.283 0.148L0.287 0.165L0.289 0.183L0.29 0.2L0.29 0.29L0.289 0.307L0.287 0.325L0.283 0.342L0.278 0.358L0.271 0.375L0.263 0.39L0.254 0.405L0.243 0.419L0.231 0.431L0.219 0.443L0.205 0.454L0.19 0.463L0.175 0.471L0.158 0.478L0.142 0.483L0.125 0.487L0.107 0.489L0.09 0.49L0.37 1" />
        <path d="M0.64 1L0.64 0L1.19 0" />
        <path d="M0.64 0.49L1.1 0.49" />
        <path d="M0.64 1L1.19 1" />
        <path d="M1.41 1L1.78 0L2.15 1" />
        <circle cx="1.78" cy="0.73" r="0.055" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isContactPage = !!pathname && pathname.startsWith("/kontakty");

  // при прокрутке логотип сворачивается в Λ
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // закрытие оверлея при смене маршрута; блокировка скролла; Esc
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  // ── плавающая мобильная CTA ──
  const [fabShow, setFabShow] = useState(false);
  const [formInView, setFormInView] = useState(false);
  useEffect(() => {
    const onScroll = () => setFabShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const target = document.getElementById("contact");
    if (!target) { setFormInView(false); return; }
    const io = new IntersectionObserver((e) => setFormInView(e[0].isIntersecting), { rootMargin: "0px 0px -12% 0px" });
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);
  const fabIn = fabShow && !formInView && !open && !isContactPage;

  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <Link href="/" className={`site-header-brand${scrolled ? " is-min" : ""}`} aria-label="AUREA — на главную">
            <span className="logo-clip"><Logo /></span>
          </Link>

          <div className="site-header-right">
            <Link href="/kontakty/" className="site-header-cta">
              <span className="cta-txt">Обсудить проект</span>
            </Link>
            <button
              type="button"
              className="site-menu-btn"
              aria-label="Открыть меню"
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
            >
              меню
            </button>
          </div>
        </div>
      </header>

      {/* ПОЛНОЭКРАННЫЙ ОВЕРЛЕЙ-МЕНЮ */}
      <div className={`nav-overlay${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label="Меню">
        <button type="button" className="nav-overlay-bg" aria-label="Закрыть меню" tabIndex={open ? undefined : -1} onClick={() => setOpen(false)} />
        <div className="nav-overlay-in">
          <button type="button" className="nav-overlay-close" tabIndex={open ? undefined : -1} onClick={() => setOpen(false)}>закрыть</button>
          <nav className="nav-overlay-list" aria-label="Разделы">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} className="nav-overlay-l" style={{ ["--i" as string]: i }} tabIndex={open ? undefined : -1}>
                <span className="nav-overlay-l-in">{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="nav-overlay-foot">
            <a href={SITE.contacts.telegram} target="_blank" rel="noopener">Telegram</a>
            <a href={SITE.contacts.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
            <a href={`mailto:${SITE.contacts.email}`}>{SITE.contacts.email}</a>
          </div>
        </div>
      </div>

      {/* Плавающая CTA — только мобайл */}
      <Link
        href="/kontakty/"
        className={`mfab${fabIn ? " is-in" : ""}`}
        aria-hidden={!fabIn}
        tabIndex={fabIn ? undefined : -1}
      >
        Обсудить проект
      </Link>
    </>
  );
}
