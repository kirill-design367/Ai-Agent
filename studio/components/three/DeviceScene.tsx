"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/*
  PLACEHOLDER device for the Hero (Bible kульминация / user's macbook idea).
  Right now it's a procedural "laptop" (base + lid) so the scroll rig works
  end-to-end. Swap `DeviceScene` for a loaded GLB later:

    const { scene } = useGLTF("/models/macbook.glb");
    return <primitive object={scene} ... />;

  The rig already feeds it a `scroll` 0..1 value to drive the open + 360° spin.
*/
export default function DeviceScene({ scroll }: { scroll: { current: number } }) {
  const group = useRef<Group>(null);
  const lid = useRef<Group>(null);

  useFrame(() => {
    const p = scroll.current; // 0..1 across the hero scroll
    if (group.current) {
      // 360° turntable spin across the scroll (the user's "вокруг себя").
      group.current.rotation.y = p * Math.PI * 2;
      group.current.rotation.x = -0.25 + p * 0.1;
    }
    if (lid.current) {
      // lid opens from closed (~ -1.4rad) to open (~ -0.1rad) in first half.
      const open = Math.min(1, p * 2);
      lid.current.rotation.x = -1.45 + open * 1.35;
    }
  });

  return (
    <group ref={group} position={[0, -0.3, 0]} scale={1.1}>
      {/* base */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.12, 2]} />
        <meshStandardMaterial color="#1a1a1d" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* lid (rotates open around its back edge) */}
      <group ref={lid} position={[0, 0.06, -1]}>
        <mesh castShadow position={[0, 1, 0]}>
          <boxGeometry args={[3, 2, 0.1]} />
          <meshStandardMaterial color="#0f0f11" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* screen face — neutral luxe glow (swap for live site texture later) */}
        <mesh position={[0, 1, 0.06]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshStandardMaterial
            color="#e9e8e6"
            emissive="#e9e8e6"
            emissiveIntensity={0.22}
            metalness={0.1}
            roughness={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}
