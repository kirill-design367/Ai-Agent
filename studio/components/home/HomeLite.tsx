import Link from "next/link";
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
  ЛЁГКАЯ ГЛАВНАЯ (SSR, лёгкий тир + серверная разметка для всех). Весь смысловой
  контент — в первичном HTML (§5.2), голос §2, но БЕЗ кинематографического JS:
  быстрый LCP/низкий TBT на мобильных. На способном desktop поверх монтируется
  кинематографическая версия (см. HomeUpgrade) — ниже первого экрана, без мигания.
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
  const cases: HubCard[] = getAllCases()
    .slice(0, 3)
    .map((c) => ({
      href: `/keisy/${c.slug}/`,
      kicker: c.caseType === "own-product" ? "Свой бренд" : "Концепт",
      title: c.title,
      meta: [c.siteType, c.term],
      cover: c.cover,
    }));

  return (
    <main id="content" className="site theme-dark home-lite">
      {/* HERO-МАНИФЕСТ. Композиция по φ, √φ-тип, тёплый свет. Точка = «семя»
          в начале заголовка (§1.2 — поведение/исток, не орнамент): из неё
          в кинематографическом слое разворачивается заголовок; в Lite её роль
          играют светопятно и композиция. Заголовок = LCP из первичного HTML. */}
      <section className="hero-m theme-dark">
        <div className="hero-m-glow" aria-hidden />
        {/* Гигантский вордмарк-водяной знак — уходит за правый край (глубина, слои) */}
        <span className="hero-m-wm" aria-hidden>AUREA</span>
        <div className="hero-m-inner">
          <p className="hero-m-label">
            <span className="hero-m-idx">01</span>{HERO.kicker}
          </p>
          {/* Кинетический заголовок: каждое слово выезжает из маски снизу со
              stagger (CSS-анимация на загрузке → LCP не страдает, текст в DOM).
              Одно слово — контрастный италик-акцент (Playfair). */}
          <h1 className="hero-m-h1" aria-label={HERO.headline.join(" ")}>
            {HERO.headline.map((w, i) => (
              <span className={`hm-word${i === 1 ? " hm-em" : ""}`} key={i} aria-hidden>
                <span className="hm-word-in" style={{ ["--i" as string]: i }}>
                  {w}
                </span>{" "}
              </span>
            ))}
          </h1>
          <div className="hero-m-aside">
            <p className="hero-m-lead">{HERO.subtitle}</p>
            <ul className="hero-m-feats">
              {HERO.feats.map((f, i) => (
                <li key={f}>
                  <span className="hero-m-feat-n">{String(i + 1).padStart(2, "0")}</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="hero-m-actions">
              <Link href="/uslugi/" className="btn-unfold" data-magnetic>
                <span>Услуги и цены</span>
              </Link>
              <Link href="/kontakty/" className="btn-line" data-magnetic>
                Обсудить проект
              </Link>
            </div>
          </div>
          <div className="hero-m-meta" aria-hidden>
            <span>AUREA</span>
            <span>МОСКВА · РФ</span>
            <span>ОТ&nbsp;ТОЧКИ ДО&nbsp;ШЕДЕВРА</span>
          </div>
          <span className="hero-m-scroll" aria-hidden>
            <span className="hero-m-scroll-l">листайте</span>
            <span className="hero-m-scroll-line"><i /></span>
          </span>
        </div>
      </section>

      {/* Модель работы §2 — тихая зона */}
      <section className="pg-insight">
        <div className="pg-wrap">
          <blockquote className="pg-insight-q">
            Вы работаете напрямую с&nbsp;основателем студии. Без менеджеров и&nbsp;потери
            информации. За&nbsp;итоговый результат отвечаю лично я.
          </blockquote>
        </div>
      </section>

      <section className="pg-hub">
        <div className="pg-wrap">
          <h2 className="pg-h2">Услуги</h2>
          <HubGrid cards={services} />
        </div>
      </section>

      <section className="pg-hub">
        <div className="pg-wrap">
          <h2 className="pg-h2">Сайты под нишу</h2>
          <HubGrid cards={niches} />
        </div>
      </section>

      <section className="pg-hub">
        <div className="pg-wrap">
          <h2 className="pg-h2">Кейсы</h2>
          <HubGrid cards={cases} />
        </div>
      </section>

      <TrustBlock />
      <Testimonials />
      <FounderBlock />
      <Contact />
      <Cta title="Готовы начать?" text={`Отвечу лично, обычно в течение пары часов. ${SITE.contacts.email}`} />
    </main>
  );
}
