"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { ScrollTrigger, registerGsap } from "@/lib/gsap";
import DeviceScene from "./DeviceScene";

/*
  R3F Hero canvas. Scroll position (0..1 across #hero) is fed into a ref that
  DeviceScene reads in its render loop — so the device opens + spins 360° as the
  user scrolls (scroll = camera, Bible II.5). Single light source (I.12.2).
  Heavy 3D is desktop-first; on mobile we lower DPR / can fall back to a static
  render later (⚠️РФ, IV.20).
*/
export default function HeroCanvas() {
  const scroll = useRef(0);

  useEffect(() => {
    registerGsap();
    const st = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        scroll.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.5, 7], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* one motivated key light + soft fill */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Environment preset="city" />
      <DeviceScene scroll={scroll} />
    </Canvas>
  );
}
