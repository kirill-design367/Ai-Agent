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
      {/* HERO — голос §2, заголовок = LCP из HTML */}
      <section className="pg-hero home-lite-hero">
        <div className="pg-wrap">
          <p className="pg-hero-kicker">AUREA — авторская студия разработки сайтов</p>
          <h1 className="home-lite-h1">
            Первое впечатление
            <br />
            невозможно повторить
          </h1>
          <p className="home-lite-sub">
            Современные сайты для&nbsp;бизнеса. Личная ответственность за&nbsp;каждый
            проект, внимание к&nbsp;деталям и&nbsp;решения, которые помогают привлекать
            клиентов.
          </p>
          <ul className="home-lite-feats">
            <li>Индивидуальный дизайн</li>
            <li>Чистый код, не&nbsp;конструктор</li>
            <li>Пожизненная гарантия</li>
          </ul>
          <div className="home-lite-actions">
            <Link href="/uslugi/" className="pg-btn pg-btn--primary" data-magnetic>
              Услуги и цены
            </Link>
            <Link href="/kontakty/" className="pg-btn pg-btn--ghost" data-magnetic>
              Обсудить проект
            </Link>
          </div>
        </div>
      </section>

      {/* Модель работы §2 */}
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
