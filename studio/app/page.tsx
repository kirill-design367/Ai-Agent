import SmoothScroll from "@/components/kit/SmoothScroll";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import FounderBlock from "@/components/pg/FounderBlock";
import MagneticTargets from "@/components/kit/MagneticTargets";
import GrainOverlay from "@/components/kit/GrainOverlay";
import Intro from "@/components/kit/Intro";
import MessengerFab from "@/components/kit/MessengerFab";
import Hero from "@/components/sections/Hero";
import Works from "@/components/sections/Works";
import Pain from "@/components/sections/Pain";
import Process from "@/components/sections/Process";
import Advantages from "@/components/sections/Advantages";
import LightWipe from "@/components/sections/LightWipe";
import Prices from "@/components/sections/Prices";
import Faq from "@/components/sections/Faq";
import Reviews from "@/components/sections/Reviews";
import Teleport from "@/components/sections/Teleport";
import Contact from "@/components/sections/Contact";

/*
  AUREA — full rebuild in progress. The site is being recreated from scratch as
  one cohesive cinematic experience (reference-level), powered by the installed
  skills. Old block-by-block scenes were removed. Sections land below the Hero
  as each is built to the new standard.
*/
export default function Home() {
  return (
    <SmoothScroll>
      <Intro />
      {/* общая шапка сайта (в тёмном контексте, чтобы токены были светлыми) */}
      <div className="theme-dark">
        <SiteHeader />
      </div>
      <MagneticTargets />
      <GrainOverlay />
      <MessengerFab />

      <main>
        {/* Hero прилипает и Работы наезжают поверх — sticky Hero ограничен этим
            стеком, чтобы Hero НЕ висел приклеенным за всей страницей (иначе он
            просвечивал сквозь прозрачность блоков ниже) */}
        <div className="hero-works-stack">
          <Hero />
          <Works />
        </div>
        <Pain />
        <Process />
        <Advantages />
        {/* T3 — заполнение светом */}
        <LightWipe />
        <Prices />
        {/* T4 — занавес прайса рвётся и открывает FAQ (встроен в Faq) */}
        <Faq />
        {/* T5 — последний вопрос рассыпается, заголовок «Отзывов» собирается
            из букв (встроено в Faq/Reviews) */}
        <Reviews />
        <Teleport />
        <Contact />
      </main>

      {/* §2.3: блок основателя (монограмма, модель работы «напрямую с основателем»).
          Стоит после формы, чтобы не разрывать кинематографические переходы T1–T5. */}
      <div className="theme-dark">
        <FounderBlock />
        <SiteFooter />
      </div>
    </SmoothScroll>
  );
}
