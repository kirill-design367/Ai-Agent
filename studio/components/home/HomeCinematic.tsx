"use client";

import SmoothScroll from "@/components/kit/SmoothScroll";
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
  КИНЕМАТОГРАФИЧЕСКАЯ ГЛАВНАЯ (тяжёлый тир, desktop). Монтируется динамически
  ТОЛЬКО на способном устройстве и ТОЛЬКО после гидратации лёгкой главной —
  ниже первого экрана, поэтому подмена не видна. На мобильных этот код не грузится.
  SmoothScroll/Intro/весь scroll-театр живут здесь, а не в SSR-разметке.
*/
export default function HomeCinematic() {
  return (
    <SmoothScroll>
      <Intro />
      <MagneticTargets />
      <GrainOverlay />
      <MessengerFab />

      <main>
        <div className="hero-works-stack">
          <Hero />
          <Works />
        </div>
        <Pain />
        <Process />
        <Advantages />
        <LightWipe />
        <Prices />
        <Faq />
        <Reviews />
        <Teleport />
        <Contact />
      </main>

      <div className="theme-dark">
        <FounderBlock />
      </div>
    </SmoothScroll>
  );
}
