"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

/*
  HERO — три радикально разных ПО ТОНУ варианта (ч/б, воздух). Временный механизм
  выбора: ?v=1|2|3 переключает только hero (клиентски, после гидратации; SSR всегда
  рендерит v1 → LCP-заголовок в HTML, статический пререндер и SEO целы). Без
  параметра — v1. После вердикта лишние удаляются, победитель остаётся без параметра.

  КРИТИЧНО (баг возвращался 3 раза): в РАЗМЕТКЕ H1 обязаны быть пробелы между
  словами. Лесенка — через display:block в CSS, НЕ через удаление пробелов.
  Каждое слово-спан содержит завершающий пробел → textContent = «Первое впечатление…».
  Guard scripts/check-h1.mjs падает на сборке, если пробелы исчезнут.
*/

// Тексты заголовков. V1 — текущий. V2/V3 — «тихая уверенность», обещание результата.
const V2_HEAD = "Сайт, который приводит клиентов"; // альт: «Первое впечатление, которое продаёт»
const V3_WORD = "Шедевр"; // альт: «AUREA»

function Stair({ words }: { words: string[] }) {
  // Лесенка: каждое слово — блок; ПРОБЕЛ внутри спана сохраняет его в textContent.
  return (
    <h1 className="hx-title" aria-label={words.join(" ")}>
      {words.map((w, i) => (
        <span className="hx-l" style={{ ["--i" as string]: i }} key={i}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}

function Actions() {
  return (
    <div className="hx-actions">
      <Link href="/uslugi/" className="pill pill--solid" data-magnetic><span>Услуги и цены</span></Link>
      <Link href="/kontakty/" className="pill" data-magnetic><span>Обсудить проект</span></Link>
    </div>
  );
}

/* V1 «Плакат» — Druk капсом, лесенка KOTA, воздух сверху, подпись справа внизу.
   Экспортируется как Suspense-fallback → статический пререндер содержит H1 (SEO/LCP). */
export function HeroV1() {
  return (
    <section className="hx hx--poster">
      <div className="hx-art" aria-hidden><span className="hx-art-slot" /></div>
      <Stair words={["Первое", "впечатление", "невозможно", "повторить"]} />
      <div className="hx-foot">
        <span className="hx-scroll"><i />листайте</span>
        <p className="hx-lead">
          Современные сайты для бизнеса на&nbsp;чистом коде. <b>Личная ответственность
          за&nbsp;каждый проект</b> и&nbsp;внимание к&nbsp;деталям, которые продают.
        </p>
      </div>
      <Actions />
    </section>
  );
}

/* V2 «Редакция» — журнальный разворот: крупный mixed-case заголовок слева 2/3,
   тонкая колонка справа (подпись + CTA). Тихая роскошь через спокойствие. */
function V2() {
  return (
    <section className="hx hx2">
      <div className="hx2-main">
        <p className="hx2-eyebrow">Авторская студия · сайты для бизнеса</p>
        <h1 className="hx2-title">{V2_HEAD}</h1>
      </div>
      <aside className="hx2-side">
        <p className="hx2-lead">
          Современные сайты на&nbsp;чистом коде. Личная ответственность за&nbsp;каждый
          проект, внимание к&nbsp;деталям и&nbsp;решения, которые продают.
        </p>
        <Actions />
        <span className="hx-scroll"><i />листайте</span>
      </aside>
    </section>
  );
}

/* V3 «Слово» — минимализм Sidekick: одно гигантское слово + строка-подпись + CTA */
function V3() {
  return (
    <section className="hx hx3">
      <h1 className="hx3-word">{V3_WORD}</h1>
      <div className="hx3-foot">
        <p className="hx3-lead">Сайты для бизнеса на&nbsp;чистом коде. От&nbsp;точки до&nbsp;шедевра.</p>
        <Actions />
      </div>
    </section>
  );
}

export default function Hero() {
  const v = useSearchParams().get("v");
  if (v === "2") return <V2 />;
  if (v === "3") return <V3 />;
  return <HeroV1 />;
}
