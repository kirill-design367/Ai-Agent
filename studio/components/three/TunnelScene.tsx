"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points as ThreePoints } from "three";

/*
  Particle tunnel for the Боль scene (Bible III.3 + user's "тоннель в пустоту").
  A cylindrical shell of points recedes into fog; the camera "flies" forward as
  the user scrolls (scroll = camera, II.5). Points loop in Z for an endless
  void. Monochrome luxe — cold white specks on near-black, depth via fog.
*/
const COUNT = 1400;
const DEPTH = 130;

export default function TunnelScene({ scroll }: { scroll: { current: number } }) {
  const ref = useRef<ThreePoints>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 3.5 + Math.random() * 6.5; // radius shell (hollow centre = tunnel)
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = -Math.random() * DEPTH;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const p = scroll.current; // 0..1 across the section
    pts.rotation.z += delta * 0.03; // slow ambient swirl
    const speed = 8 + p * 70; // scroll accelerates travel through the void
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 2] += delta * speed;
      if (arr[i * 3 + 2] > 5) arr[i * 3 + 2] = -DEPTH; // recycle to the back
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#f4f2ee"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
