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

function Logo() {
  return (
    <span className="site-logo" aria-label="AUREA">
      AURE<span className="site-logo-seed">A</span>
      <span className="site-logo-dot" aria-hidden />
    </span>
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
