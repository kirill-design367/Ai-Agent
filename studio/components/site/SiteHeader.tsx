"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/seo/site";

/*
  ШАПКА — узкая верхняя панель (реф KOTA): лого слева, «Обсудить» + бургер справа.
  mix-blend-difference делает панель авто-контрастной на любом ч/б фоне.
  Меню — полноэкранный оверлей, только слова (реф 4.5): гигантские пункты со
  stagger-появлением, живой hover (курсив/сдвиг), внизу мелко контакты.
  Работает одинаково на десктопе и мобиле.
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
