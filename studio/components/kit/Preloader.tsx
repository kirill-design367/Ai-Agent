"use client";

import { useEffect, useState } from "react";

/*
  Preloader curtain (Bible V.117 / V.38). Short (<2.5s), sets the premium
  spectacle tone from second 0, then lifts as a curtain into the Hero. Honest:
  no fake percentage — just a brief branded beat while fonts/assets settle.
*/
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), 1400);
    const t2 = setTimeout(() => setHidden(true), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="preloader" data-done={done} aria-hidden>
      <span className="preloader-word">Сайт за&nbsp;1–5&nbsp;дней</span>
    </div>
  );
}
