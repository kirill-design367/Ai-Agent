import { Suspense } from "react";
import { getAllNiches } from "@/lib/content/loader";
import HubGrid, { type HubCard } from "@/components/pg/HubGrid";
import Hero, { HeroV1 } from "@/components/home/Hero";
import Hero3D from "@/components/home/Hero3D";
import Manifesto from "@/components/home/Manifesto";
import Cases from "@/components/home/Cases";
import Cost from "@/components/home/Cost";
import FounderBlock from "@/components/pg/FounderBlock";
import TrustBlock from "@/components/pg/TrustBlock";
import Testimonials from "@/components/pg/Testimonials";
import Cta from "@/components/pg/Cta";
import Contact from "@/components/sections/Contact";
import { SITE } from "@/lib/seo/site";

/*
  ГЛАВНАЯ — «тихая роскошь», белый фон. Маршрут: hero-манифест (реф KOTA/Sidekick,
  гигант лесенкой) → услуги потоком строк → кейсы парящими фигурами (реф Akoya) →
  тёмная развязка (доверие/контакт/CTA). Контент — в SSR-HTML (SEO/LCP целы).
  Заголовок героя — блоки-слова (не инлайн-маски): пробелы гарантированы.
*/

export default function HomeLite() {
  const niches: HubCard[] = getAllNiches().map((n) => ({
    href: `/dlya-biznesa/${n.slug}/`,
    kicker: "Ниша",
    title: n.title,
    desc: n.metaDescription,
  }));

  return (
    <>
      <main id="content" className="site home">
      {/* ══ HERO — манифест/h1 (LCP в SSR); частицы AUREA — на глобальном канвасе ══ */}
      <Suspense fallback={<HeroV1 />}>
        <Hero />
      </Suspense>

      {/* ══ 02 — MANIFESTO (словарная статья; заменил «Что я делаю») ══ */}
      <Manifesto />

      {/* ══ КЕЙСЫ — чёрное полотно, реф noth.in «WORKS» ══ */}
      <Cases />

      {/* ══ СТОИМОСТЬ — одна цифра, слово на шве ч/б ══ */}
      <Cost />

      {/* ══ НИШИ ══ */}
      <section className="pg-hub">
        <div className="pg-wrap">
          <p className="pg-hero-kicker">Ниши</p>
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
      {/* ГЛОБАЛЬНЫЙ FIXED-канвас частиц — ПОСЛЕ контента в DOM, чтобы в порядке
          отрисовки лечь ПОВЕРХ белых фонов секций (позиц. z-auto), но ПОД текстом
          (позиц. z≥1: манифест z2, mf2-inner z1) и шапкой (z200). */}
      <Hero3D />
    </>
  );
}
