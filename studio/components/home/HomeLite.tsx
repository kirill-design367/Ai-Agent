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
  ГЛАВНАЯ КАК ПОЛОТНО (эталон Locomotive/Obys). НЕ стек секций — единая
  композиция-маршрут: завязка (hero-манифест) → разгон (услуги потоком строк) →
  кульминация (кейсы: пин + горизонтальная прокрутка) → развязка (манифест-CTA).
  Перекрытия вместо границ, разноскоростной параллакс, фон меняется под контентом
  (см. Canvas.tsx). Контент — в SSR-HTML (SEO/LCP целы); движение — усиление.
*/
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
  const caseTrack = getAllCases()
    .slice(0, 6)
    .map((c) => ({
      href: `/keisy/${c.slug}/`,
      title: c.title,
      cover: c.cover,
      meta: [c.origin === "replica" ? "Воссоздано" : "Свой бренд", c.siteType, c.term].filter(Boolean) as string[],
    }));

  return (
    <main id="content" className="site theme-dark home-cv" data-canvas>
      {/* Фон-полотно: цвет ведёт скролл (меняется ПОД контентом) */}
      <div className="cv-bg" aria-hidden />

      {/* ══ ЗАВЯЗКА — HERO-МАНИФЕСТ (тёмная зона) ══ */}
      <section className="cv-hero" data-zone="dark">
        <p className="cv-hero-tag"><span>01</span>&nbsp;&nbsp;AUREA — авторская студия разработки сайтов</p>
        <h1 className="cv-hero-h1" aria-label={HERO.headline.join(" ")}>
          <span className="cv-l cv-l1" aria-hidden>Первое</span>
          <span className="cv-l cv-l2" aria-hidden>впечатление</span>
          <span className="cv-l cv-l3" aria-hidden>невозможно</span>
          <span className="cv-l cv-l4" aria-hidden>повторить</span>
        </h1>
        <div className="cv-hero-corner" data-speed="0.78">
          <p className="cv-hero-lead">
            Современные сайты для бизнеса на чистом коде. Личная ответственность
            за каждый проект.
          </p>
          <div className="cv-hero-actions">
            <Link href="/uslugi/" className="pill pill--solid" data-magnetic><span>Услуги и цены</span></Link>
            <Link href="/kontakty/" className="pill" data-magnetic><span>Обсудить проект</span></Link>
          </div>
        </div>
        <span className="cv-scroll" aria-hidden><i />листайте</span>
      </section>

      {/* ══ БЕГУЩАЯ ГРАФИКА — текст как объект между зонами ══ */}
      <div className="cv-marquee" aria-hidden>
        <div className="cv-marquee-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={i % 2 ? "is-outline" : ""}>От&nbsp;точки до&nbsp;шедевра&nbsp;<em>✳</em>&nbsp;</span>
          ))}
        </div>
      </div>

      {/* ══ РАЗГОН — УСЛУГИ ПОТОКОМ (светлая зона, наезжает на hero) ══ */}
      <section className="cv-flow" data-zone="light">
        <div className="cv-flow-head">
          <p className="cv-eyebrow" data-speed="0.7"><span>02</span> Услуги</p>
          <h2 className="cv-h2 cv-bleed-l" data-speed="1.12">Что&nbsp;я делаю</h2>
        </div>
        <div className="cv-idx-wrap" data-speed="0.94">
          <HubGrid cards={services} />
        </div>
      </section>

      {/* ниши — асимметрия: заголовок справа, индекс слева */}
      <section className="cv-flow cv-flow--alt" data-zone="light">
        <div className="cv-flow-head cv-flow-head--right">
          <p className="cv-eyebrow" data-speed="0.7"><span>03</span> Ниши</p>
          <h2 className="cv-h2 cv-bleed-r" data-speed="1.1">Сайты под задачу бизнеса</h2>
        </div>
        <div className="cv-idx-wrap" data-speed="0.96">
          <HubGrid cards={niches} />
        </div>
      </section>

      {/* ══ КУЛЬМИНАЦИЯ — КЕЙСЫ: пин + горизонтальная прокрутка (тёмная зона) ══ */}
      <section className="cv-cases" data-zone="dark" data-track-wrap>
        <div className="cv-cases-head">
          <p className="cv-eyebrow"><span>04</span> Работы</p>
          <h2 className="cv-h2">Избранные кейсы</h2>
          <span className="cv-cases-hint" aria-hidden>прокрутка&nbsp;→</span>
        </div>
        <div className="cv-track" data-track>
          {caseTrack.map((c, i) => (
            <Link key={c.href} href={c.href} className="cv-case" data-magnetic>
              <span className="cv-case-n">{String(i + 1).padStart(2, "0")}</span>
              {c.cover && (
                <span className="cv-case-media">
                  <Image src={c.cover} alt="" width={640} height={440} />
                </span>
              )}
              <span className="cv-case-title">{c.title}</span>
              <span className="cv-case-meta">
                {c.meta.map((m, j) => (<span key={j}>{m}</span>))}
              </span>
            </Link>
          ))}
          <Link href="/keisy/" className="cv-case cv-case--all" data-magnetic>
            <span className="cv-case-title">Все<br />кейсы</span>
            <span className="cv-case-meta"><span>смотреть индекс&nbsp;↗</span></span>
          </Link>
        </div>
      </section>

      {/* ══ РАЗВЯЗКА — доверие, отзывы, основатель, контакт, манифест-CTA ══ */}
      <div className="cv-final" data-zone="dark">
        <TrustBlock />
        <Testimonials />
        <FounderBlock />
        <Contact />
        <Cta title="Обсудим ваш проект?" text={`Отвечу лично, обычно в течение пары часов. ${SITE.contacts.email}`} />
      </div>
    </main>
  );
}
