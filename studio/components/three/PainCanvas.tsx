"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ScrollTrigger, registerGsap } from "@/lib/gsap";
import TunnelScene from "./TunnelScene";

/*
  R3F canvas for the Боль tunnel. Scroll progress across #pain (0..1) drives the
  travel speed. Fog gives depth fade (V.85); background is near-black luxe.
*/
export default function PainCanvas() {
  const scroll = useRef(0);

  useEffect(() => {
    registerGsap();
    const st = ScrollTrigger.create({
      trigger: "#pain",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        scroll.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 62 }}
      gl={{ antialias: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#0a0a0b"]} />
      <fog attach="fog" args={["#0a0a0b", 6, 70]} />
      <TunnelScene scroll={scroll} />
    </Canvas>
  );
}
