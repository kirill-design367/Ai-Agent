"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/*
  ШАПКА САЙТА — общая для всех страниц (кроме кинематографической главной, где
  своя). Фиксированная, конденсируется по скроллу. Один основной CTA (§9.1).
  Мобильное меню — маленький клиентский островок; на десктопе — плоская навигация.
*/
const NAV = [
  { href: "/uslugi/", label: "Услуги" },
  { href: "/dlya-biznesa/", label: "Для бизнеса" },
  { href: "/keisy/", label: "Кейсы" },
  { href: "/blog/", label: "Блог" },
  { href: "/o-studii/", label: "О студии" },
];

function Logo() {
  return (
    <span className="site-logo" aria-label="AUREA">
      <svg viewBox="0 0 22 26" aria-hidden className="site-logo-a">
        <path d="M11 2 L20 24 L16.3 24 L11 10 L5.7 24 L2 24 Z" fill="currentColor" />
        <circle cx="11" cy="19.2" r="2" fill="currentColor" />
      </svg>
      <span className="site-logo-txt">URE</span>
      <svg viewBox="0 0 22 26" aria-hidden className="site-logo-a">
        <path d="M11 2 L20 24 L16.3 24 L11 10 L5.7 24 L2 24 Z" fill="currentColor" />
        <circle cx="11" cy="19.2" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // закрывать меню при переходе
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="site-header-in">
        <Link href="/" className="site-header-brand" aria-label="AUREA — на главную">
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Основная навигация">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href.replace(/\/$/, "") + "/");
            return (
              <Link key={n.href} href={n.href} className={active ? "is-active" : ""}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/kontakty/" className="site-header-cta" data-magnetic>
          Обсудить проект
        </Link>

        <button
          type="button"
          className="site-burger"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* мобильное меню-полотно */}
      <div className="site-menu" hidden={!open}>
        <nav aria-label="Мобильная навигация">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <Link href="/kontakty/" className="site-menu-cta">
            Обсудить проект
          </Link>
        </nav>
      </div>
    </header>
  );
}
