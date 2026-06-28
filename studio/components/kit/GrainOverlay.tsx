"use client";

/*
  Grain / noise overlay (Bible I.10.2 / IV.10.2) — the secret premium
  ingredient. 3–8% opacity, soft-light blend, pointer-events: none. Kills
  gradient banding and adds "analog", "shot not generated" depth. The SVG
  feTurbulence is inlined as a data-URI so there's zero extra network request.
*/
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)'/>
     </svg>`
  );

export default function GrainOverlay() {
  return (
    <div
      className="grain"
      aria-hidden
      style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: "160px 160px" }}
    />
  );
}
