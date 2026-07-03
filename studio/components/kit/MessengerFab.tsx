"use client";

import { useEffect, useState } from "react";

/*
  Floating messenger button (Bible L.156) — the ONE always-present CTA that is
  allowed: РФ audience often prefers writing in Telegram over leaving a form.
  Появляется НЕ сразу: на Hero кнопка отвлекала бы, поэтому она проявляется
  ненавязчиво только ПОСЛЕ блока «Портфолио» (#work прокручен выше вьюпорта).
  No pressure, no pop-up, no timer. Magnetic for tactility.
*/
export default function MessengerFab() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const work = document.getElementById("work");
    if (!work) return;
    // корень наблюдения — вьюпорт (скроллится документ)
    const io = new IntersectionObserver(
      ([entry]) => {
        // показываем, когда низ блока «Портфолио» ушёл выше верхней кромки экрана
        setShown(entry.boundingClientRect.bottom < 0);
      },
      { root: null, threshold: 0, rootMargin: "0px" }
    );
    io.observe(work);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="https://t.me/Sk_Mac1"
      target="_blank"
      rel="noopener"
      className={`msg-fab${shown ? " is-shown" : ""}`}
      data-magnetic
      data-cursor="hover"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
    >
      <span aria-hidden>✦</span> Написать
    </a>
  );
}
