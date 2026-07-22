"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/seo/site";

/*
  ШАПКА — узкая верхняя панель, максимум воздуха (реф MONOLOG):
  • лого AUREA слева;
  • ЦЕНТР — текст-табы без рамок/плашек (hover = вычерчиваемое подчёркивание);
  • справа — «Обсудить проект», единственная плашка панели.
  Десктоп: табы видимы, бургера НЕТ. Мобайл (≤880): табы прячутся в бургер +
  полноэкранный оверлей (только слова). mix-blend-difference → авто-контраст ч/б.
*/
const NAV = [
  { href: "/uslugi/", label: "Услуги" },
  { href: "/dlya-biznesa/", label: "Для бизнеса" },
  { href: "/keisy/", label: "Кейсы" },
  { href: "/blog/", label: "Блог" },
  { href: "/o-studii/", label: "О студии" },
  { href: "/kontakty/", label: "Контакты" },
];

// Логотип-вордмарк: то же начертание, что particle-надпись — «A» Λ-образная
// (без перекладины) с точкой в контрформе, тонкий геометрический гротеск.
function Logo() {
  return (
    <svg className="site-logo" viewBox="0 0 86 24" role="img" aria-label="AUREA"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M0 21 L8.3 3 L16.6 21" />
      <path d="M19.4 3 L19.4 13.8 A7.2 7.2 0 0 1 33.8 13.8 L33.8 3" />
      <path d="M36.7 21 L36.7 3 L43.6 3 C50.9 3 50.9 12.4 43.6 12.4 L36.7 12.4 M42.5 12.4 L50.4 21" />
      <path d="M65.2 3 L53.3 3 L53.3 21 L65.2 21 M53.3 12 L63 12" />
      <path d="M68 21 L76.3 3 L84.6 21" />
      <circle cx="8.3" cy="14.9" r="2.8" fill="currentColor" stroke="none" />
      <circle cx="76.3" cy="14.9" r="2.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className={`site-header${open ? " is-open" : ""}`}>
        <div className="site-header-in">
          <Link href="/" className="site-header-brand" aria-label="AUREA — на главную">
            <Logo />
          </Link>

          <nav className="site-nav" aria-label="Основная навигация">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="site-nav-l">
                {n.label}
              </Link>
            ))}
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
      </header>

      <div className={`site-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Навигация">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} tabIndex={open ? undefined : -1}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="site-menu-foot">
          <a href={`mailto:${SITE.contacts.email}`}>{SITE.contacts.email}</a>
          <a href={SITE.contacts.telegram} target="_blank" rel="noopener">Telegram</a>
          <a href={SITE.contacts.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </>
  );
}
