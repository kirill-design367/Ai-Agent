import SmoothScroll from "@/components/kit/SmoothScroll";
import MagneticTargets from "@/components/kit/MagneticTargets";
import GrainOverlay from "@/components/kit/GrainOverlay";
import ScrollProgress from "@/components/kit/ScrollProgress";
import Intro from "@/components/kit/Intro";
import MessengerFab from "@/components/kit/MessengerFab";
import Hero from "@/components/sections/Hero";
import Works from "@/components/sections/Works";
import Pain from "@/components/sections/Pain";
import Process from "@/components/sections/Process";
import Advantages from "@/components/sections/Advantages";
import Prices from "@/components/sections/Prices";
import Offer from "@/components/sections/Offer";
import Faq from "@/components/sections/Faq";
import BlackHole from "@/components/sections/BlackHole";
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
      <ScrollProgress />
      <MagneticTargets />
      <GrainOverlay />
      <MessengerFab />

      <main>
        <Hero />
        <Works />
        <Pain />
        <Process />
        <Advantages />
        <Prices />
        <Offer />
        <Faq />
        <BlackHole />
        <Reviews />
        <Teleport />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
