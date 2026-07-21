import Link from "next/link";
import Image from "next/image";
import { getAllServices, getAllNiches, getAllCases } from "@/lib/content/loader";
import { formatPrice } from "@/lib/format";
import HubGrid, { type HubCard } from "@/components/pg/HubGrid";
import FounderBlock from "@/components/pg/FounderBlock";
import TrustBlock from "@/components/pg/TrustBlock";
import Testimonials from "@/components/pg/Testimonials";
import Cta from "@/components/pg/Cta";
import Contact from "@/components/sections/Contact";
import { SITE } from "@/lib/seo/site";
import { HERO } from "@/lib/homeContent";

/*
  ГЛАВНАЯ — «тихая роскошь», белый фон. Маршрут: hero-манифест (реф KOTA/Sidekick,
  гигант лесенкой) → услуги потоком строк → кейсы парящими фигурами (реф Akoya) →
  тёмная развязка (доверие/контакт/CTA). Контент — в SSR-HTML (SEO/LCP целы).
  Заголовок героя — блоки-слова (не инлайн-маски): пробелы гарантированы.
*/

// раскладка парящих кейсов (реф Akoya): позиция, ширина, клип-фигура, наклон, скорость дрейфа
const SHAPES = [
  { clip: "polygon(0 6%, 100% 0, 96% 92%, 4% 100%)", left: "1%", top: "0%", w: "30vw", rot: -5, drift: 0.10 },
  { clip: "polygon(4% 0, 100% 8%, 100% 100%, 0 90%)", left: "39%", top: "26%", w: "34vw", rot: 4, drift: -0.06 },
  { clip: "polygon(0 0, 100% 4%, 92% 100%, 6% 96%)", left: "70%", top: "2%", w: "26vw", rot: 7, drift: 0.14 },
  { clip: "polygon(0 10%, 100% 0, 100% 90%, 0 100%)", left: "10%", top: "54%", w: "28vw", rot: -3, drift: -0.09 },
  { clip: "polygon(6% 0, 100% 6%, 94% 100%, 0 94%)", left: "50%", top: "60%", w: "30vw", rot: 6, drift: 0.08 },
] as const;

export default function HomeLite() {
  const services: HubCard[] = getAllServices().map((s) => ({
    href: `/uslugi/${s.slug}/`,
    kicker: "Услуга",
    title: s.title,
    desc: s.metaDescription,
    meta: [
      s.priceFrom ? `от ${formatPrice(s.priceFrom)}` : "по договорённости",
      ...(s.termFrom ? [s.termFrom] : []),
    ],
  }));
  const niches: HubCard[] = getAllNiches().map((n) => ({
    href: `/dlya-biznesa/${n.slug}/`,
    kicker: "Ниша",
    title: n.title,
    desc: n.metaDescription,
  }));
  const cases = getAllCases().slice(0, SHAPES.length).map((c, i) => ({
    href: `/keisy/${c.slug}/`,
    title: c.title,
    type: c.siteType,
    cover: c.cover,
    ...SHAPES[i],
  }));

  return (
    <main id="content" className="site home">
      {/* ══ HERO-МАНИФЕСТ (реф KOTA/Sidekick) ══ */}
      <section className="hx">
        <div className="hx-art" aria-hidden><span className="hx-art-slot" /></div>
        <h1 className="hx-title" aria-label={HERO.headline.join(" ")}>
          <span className="hx-l hx-l1" aria-hidden>Первое</span>
          <span className="hx-l hx-l2" aria-hidden>впечатление</span>
          <span className="hx-l hx-l3" aria-hidden>невозможно</span>
          <span className="hx-l hx-l1" aria-hidden>повторить</span>
        </h1>
        <div className="hx-foot">
          <span className="hx-scroll"><i />листайте</span>
          <p className="hx-lead">
            Современные сайты для бизнеса на&nbsp;чистом коде. <b>Личная ответственность
            за&nbsp;каждый проект</b> и&nbsp;внимание к&nbsp;деталям, которые продают.
          </p>
        </div>
        <div className="hx-actions" style={{ position: "relative", zIndex: 1, marginTop: "var(--sp-4)" }}>
          <Link href="/uslugi/" className="pill pill--solid" data-magnetic><span>Услуги и цены</span></Link>
          <Link href="/kontakty/" className="pill" data-magnetic><span>Обсудить проект</span></Link>
        </div>
      </section>

      {/* ══ УСЛУГИ ПОТОКОМ ══ */}
      <section className="pg-hub">
        <div className="pg-wrap">
          <p className="pg-hero-kicker">01 — Услуги</p>
          <h2 className="pg-h2">Что я делаю</h2>
          <HubGrid cards={services} />
        </div>
      </section>

      {/* ══ КЕЙСЫ — ПАРЯЩИЕ ФИГУРЫ (реф Akoya) ══ */}
      <section className="wk">
        <div className="pg-wrap">
          <div className="wk-head">
            <p className="pg-hero-kicker">02 — Работы</p>
            <Link href="/keisy/" className="link-u" data-magnetic>Все кейсы →</Link>
          </div>
        </div>
        <div className="pg-wrap">
          <div className="wk-stage">
            {cases.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="wk-item"
                data-magnetic
                data-drift={c.drift}
                style={{ left: c.left, top: c.top, width: c.w }}
              >
                <span className="wk-name" style={{ left: 0, top: "-1.7em" }}>{c.title}</span>
                <span className="wk-shape" style={{ clipPath: c.clip, transform: `rotate(${c.rot}deg)`, aspectRatio: "3 / 2" }}>
                  {c.cover && <Image src={c.cover} alt="" width={560} height={373} />}
                </span>
                <span className="wk-type" style={{ right: 0, bottom: "-1.7em" }}>{c.type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ НИШИ ══ */}
      <section className="pg-hub">
        <div className="pg-wrap">
          <p className="pg-hero-kicker">03 — Ниши</p>
          <h2 className="pg-h2">Сайты под задачу бизнеса</h2>
          <HubGrid cards={niches} />
        </div>
      </section>

      {/* ══ ТЁМНАЯ РАЗВЯЗКА ══ */}
      <div className="invert">
        <TrustBlock />
        <Testimonials />
        <FounderBlock />
        <Contact />
        <Cta title="Обсудим ваш проект?" text={`Отвечу лично, обычно в течение пары часов. ${SITE.contacts.email}`} />
      </div>
    </main>
  );
}
