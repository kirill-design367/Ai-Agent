import SmoothScroll from "@/components/kit/SmoothScroll";
import CustomCursor from "@/components/kit/CustomCursor";
import MagneticTargets from "@/components/kit/MagneticTargets";
import GrainOverlay from "@/components/kit/GrainOverlay";
import ScrollProgress from "@/components/kit/ScrollProgress";
import Hero from "@/components/sections/Hero";
import Pain from "@/components/sections/Pain";
import Process from "@/components/sections/Process";
import Value from "@/components/sections/Value";

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

        {/* Placeholder for the next scenes — replaced as we build them. */}
        <section
          id="work"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "var(--space-5xl) var(--space-xl)",
          }}
        >
          <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
            Следующие сцены (Боль → Процесс → Портфолио → … → Финал)
            <br />
            собираются здесь по мере готовности анимаций.
          </p>
        </section>
      </main>
    </SmoothScroll>
  );
}
