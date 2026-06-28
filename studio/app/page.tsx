import SmoothScroll from "@/components/kit/SmoothScroll";
import CustomCursor from "@/components/kit/CustomCursor";
import MagneticTargets from "@/components/kit/MagneticTargets";
import GrainOverlay from "@/components/kit/GrainOverlay";
import ScrollProgress from "@/components/kit/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Pain from "@/components/sections/Pain";
import Process from "@/components/sections/Process";
import Value from "@/components/sections/Value";
import Pricing from "@/components/sections/Pricing";
import Comparison from "@/components/sections/Comparison";
import Portfolio from "@/components/sections/Portfolio";

/*
  Page shell = the studio "engine" assembled. Sections drop in below Hero as we
  build them (Боль → Процесс → ... → Финал, Bible Chapter III). The kit
  (smooth-scroll, cursor, magnetic, grain, progress) wraps every project.
*/
export default function Home() {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <CustomCursor />
      <MagneticTargets />
      <GrainOverlay />

      <main>
        <Hero />
        <Pain />
        <Process />
        <Value />
        <Pricing />
        <Portfolio />
        <Comparison />

        {/* Next: Отзывы → FAQ → Финал */}
      </main>
    </SmoothScroll>
  );
}
