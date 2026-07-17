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
  // Читаемый вордмарк AUREA. Знак «точка» (мотив «от точки до шедевра») —
  // акцентная точка после слова; финальную фирменную монограмму задаёт концепт.
  return (
    <span className="site-logo" aria-label="AUREA">
      AURE<span className="site-logo-seed">A</span>
      <span className="site-logo-dot" aria-hidden />
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  // На главной шапочный логотип скрыт, пока герой в вьюпорте (§6): у героя свой
  // крупный знак. Появляется при скролле за пределы героя — fade, без layout shift.
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setPastHero(window.scrollY > window.innerHeight * 0.82);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // закрывать меню при переходе
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="site-header-in">
        <Link
          href="/"
          className={`site-header-brand${isHome && !pastHero ? " is-hidden" : ""}`}
          aria-label="AUREA — на главную"
          tabIndex={isHome && !pastHero ? -1 : undefined}
        >
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
