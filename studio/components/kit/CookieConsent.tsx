"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/*
  COOKIE-СОГЛАСИЕ (152-ФЗ). Яндекс.Метрика подключается ТОЛЬКО после явного
  согласия пользователя (аналитические cookie — с согласия). Выбор запоминается
  в localStorage; при повторных визитах баннер не показывается, а Метрика
  подгружается сразу, если согласие уже дано.
*/
const KEY = "aurea-cookie-consent";
const METRIKA_ID = 110519983;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = any;

function loadMetrika() {
  const w = window as W;
  if (w.__aureaYm) return;
  w.__aureaYm = true;
  (function (m: W, e: Document, t: string, r: string, i: string) {
    m[i] =
      m[i] ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * (new Date() as unknown as number);
    for (let j = 0; j < e.scripts.length; j++) {
      if ((e.scripts[j] as HTMLScriptElement).src === r) return;
    }
    const k = e.createElement(t) as HTMLScriptElement;
    const a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    a.parentNode!.insertBefore(k, a);
  })(w, document, "script", `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`, "ym");
  w.ym(METRIKA_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let choice: string | null = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch {
      /* приватный режим — просто покажем баннер */
    }
    if (choice === "accepted") {
      loadMetrika();
    } else if (choice !== "declined") {
      setShow(true);
    }
  }, []);

  const decide = (accepted: boolean) => {
    try {
      localStorage.setItem(KEY, accepted ? "accepted" : "declined");
    } catch {
      /* ignore */
    }
    if (accepted) loadMetrika();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie" role="dialog" aria-label="Использование cookie">
      <p className="cookie-text">
        Мы используем файлы cookie и Яндекс.Метрику, чтобы сайт работал и
        становился лучше. Подробнее — в{" "}
        <Link href="/policy" target="_blank">
          Политике конфиденциальности
        </Link>
        .
      </p>
      <div className="cookie-actions">
        <button type="button" className="cookie-btn cookie-btn--ghost" onClick={() => decide(false)}>
          Только необходимые
        </button>
        <button type="button" className="cookie-btn cookie-btn--solid" onClick={() => decide(true)}>
          Принять
        </button>
      </div>
    </div>
  );
}
