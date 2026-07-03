"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРОЦЕСС — отвечает на «Это долго и мучительно для меня?».

  Вход — портал: тёмная завеса с надписью «Мы строим работу иначе» приближается
  к зрителю (parallax-зум) и растворяется — СЛЕДУЮЩИЙ блок проявляется будто
  изнутри этой надписи (а не просто начинается после). Дальше — «Как мы
  работаем» в рою вопросов-страхов и 4 шага с линией-кометой.
*/
const STEPS = [
  {
    verb: "Вы рассказываете",
    note: "О бизнесе, клиентах и цели. 20 минут голосом или текстом — без брифов на десять страниц.",
  },
  {
    verb: "Мы предлагаем",
    note: "Концепцию и структуру: что показать, где и почему. Ещё до первой строчки кода.",
  },
  {
    verb: "Вы утверждаете",
    note: "Смотрите готовый дизайн и правите до «идеально». Только потом — вёрстка.",
  },
  {
    verb: "Мы запускаем",
    note: "Чистый код, скорость, домен, аналитика. Сайт живёт — вы получаете заявки.",
  },
];

/* Вопросы роятся ВОКРУГ заголовка (центральная зона x25–75 / y38–62 оставлена
   пустой, чтобы они не залезали за надпись). Длинные — по центру сверху/снизу
   (там они помещаются в строку), короткие — по бокам. d — глубина параллакса. */
const QUESTIONS = [
  // короткие — по бокам
  { t: "Цена вопроса?", x: 13, y: 20, s: 1.25, o: 0.52, d: 1.4 },
  { t: "Какие сроки?", x: 76, y: 15, s: 1.35, o: 0.52, d: 1.6 },
  { t: "А ГАРАНТИИ?", x: 16, y: 35, s: 1.15, o: 0.5, d: 1.2 },
  { t: "Что входит?", x: 84, y: 31, s: 1.2, o: 0.48, d: 1.3 },
  { t: "А рекламу сделаете?", x: 20, y: 70, s: 0.98, o: 0.44, d: 0.95 },
  { t: "А сроки?", x: 87, y: 57, s: 1.05, o: 0.44, d: 1.05 },
  { t: "SEO оптимизация будет?", x: 74, y: 74, s: 0.9, o: 0.42, d: 1.0 },
  // длинные — по центру сверху/снизу (помещаются в строку)
  { t: "А когда будет начальная версия?", x: 50, y: 6, s: 0.82, o: 0.38, d: 1.0 },
  { t: "А хостинг с доменом подключите?", x: 50, y: 13, s: 0.8, o: 0.36, d: 0.9 },
  { t: "Сколько правок можно внести?", x: 50, y: 88, s: 0.84, o: 0.4, d: 1.1 },
  { t: "А если мне не понравится?", x: 50, y: 95, s: 0.86, o: 0.38, d: 1.2 },
  // парящие знаки вопроса
  { t: "?", x: 7, y: 8, s: 2.8, o: 0.12, d: 2.1 },
  { t: "?", x: 92, y: 90, s: 2.6, o: 0.12, d: 2.3 },
  { t: "?", x: 50, y: 50, s: 3.2, o: 0.06, d: 1.8 },
  { t: "?", x: 30, y: 11, s: 1.4, o: 0.2, d: 1.3 },
  { t: "?", x: 66, y: 9, s: 1.2, o: 0.18, d: 1.1 },
  { t: "?", x: 8, y: 48, s: 1.6, o: 0.22, d: 1.4 },
  { t: "?", x: 92, y: 44, s: 1.5, o: 0.2, d: 1.3 },
  { t: "?", x: 24, y: 58, s: 1.3, o: 0.2, d: 1.1 },
  { t: "?", x: 78, y: 46, s: 1.2, o: 0.18, d: 1.0 },
  { t: "?", x: 40, y: 28, s: 1.0, o: 0.15, d: 0.9 },
  { t: "?", x: 61, y: 70, s: 1.3, o: 0.2, d: 1.2 },
  { t: "?", x: 12, y: 84, s: 1.4, o: 0.2, d: 1.2 },
  { t: "?", x: 88, y: 70, s: 1.3, o: 0.2, d: 1.1 },
  { t: "?", x: 34, y: 94, s: 1.1, o: 0.16, d: 1.0 },
  { t: "?", x: 18, y: 26, s: 0.95, o: 0.16, d: 0.9 },
  { t: "?", x: 82, y: 20, s: 1.05, o: 0.16, d: 1.0 },
  { t: "?", x: 70, y: 62, s: 0.9, o: 0.14, d: 0.85 },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(".proc-veil", { autoAlpha: 0 });
        return;
      }
      // МОБИЛЬНЫЙ GPU не вывозит полную сцену (зум огромного текста ×5 + зум всей
      // сцены + 21 параллакс-вопрос) → кадры проседают, текст «дрожит и троит».
      // На мобиле облегчаем: зум меньше, без зума сцены и без пер-вопросного
      // параллакса/дрейфа. На десктопе — всё в полном объёме.
      const mobile = window.matchMedia("(max-width: 760px)").matches;

      // ПОРТАЛ-ВХОД (ЕДИНЫЙ для десктопа и мобилки — премиальный, плавный):
      // надпись приближается и растворяется, следующий блок проявляется изнутри.
      // Пин — через CSS position:sticky (трек .proc-enter-track), а не pin
      // ScrollTrigger: нативный GPU-пин без per-frame transform → нет дрожания.
      // Скролл трека скрабит анимацию. На мобиле облегчаем ТОЛЬКО нагрузку (зум
      // текста меньше, без масштабирования всей сцены-интро с вопросами и без
      // пер-вопросного параллакса) — механика и ощущение те же, что на десктопе.
      const enter = gsap.timeline({
        scrollTrigger: {
          trigger: ".proc-enter-track",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
      enter
        .fromTo(
          ".proc-turn",
          { scale: 1, opacity: 1 },
          { scale: mobile ? 2.6 : 5, opacity: 0, ease: "power2.in", duration: 0.4 },
          0
        )
        .to(".proc-veil", { autoAlpha: 0, ease: "power1.in", duration: 0.28 }, 0.32);
      // масштаб всей сцены-интро (с роем вопросов) — только десктоп: на мобиле
      // ре-растеризация целого поддерева = дрожание, поэтому там его нет
      if (!mobile)
        enter.fromTo(
          ".proc-intro",
          { scale: 1.14 },
          { scale: 1, ease: "power1.out", duration: 0.45 },
          0.1
        );
      enter
        // лёгкий дрейф роя во время раскрытия
        .to(".proc-questions", { yPercent: -10, ease: "none", duration: 0.6 }, 0)
        // ПАУЗА: сцена замирает — можно рассмотреть вопросы (≈40% прокрутки пина)
        .to({}, { duration: 0.6 });

      // у каждого вопроса своя глубина параллакса (только десктоп — на мобиле
      // 21 скраб-триггер съедал кадры)
      if (!mobile)
        gsap.utils.toArray<HTMLElement>(".proc-q").forEach((q) => {
          const depth = parseFloat(q.dataset.depth || "1");
          gsap.fromTo(
            q,
            { yPercent: 22 * depth },
            {
              yPercent: -22 * depth,
              ease: "none",
              scrollTrigger: {
                trigger: ".proc-enter-track",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
              },
            }
          );
        });

      // заголовок + лёгкое «дыхание» роя (внутренний float на обёртке-флоут)
      const title = root.current!.querySelector(".proc-bigtitle");
      if (title)
        gsap.fromTo(
          title,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ".proc-enter",
              start: "top 30%",
            },
          }
        );
      // дрейф вопросов — ЖИВОЙ ВЕЗДЕ (и на мобиле): хаотично и эстетично,
      // transform-only твины на собственных GPU-слоях (will-change) — дёшево
      const qFloatTweens: gsap.core.Tween[] = [];
      gsap.utils.toArray<HTMLElement>(".proc-q .proc-q-float").forEach((q) => {
        qFloatTweens.push(
          gsap.to(q, {
            y: gsap.utils.random(-26, 26),
            x: gsap.utils.random(-18, 18),
            rotation: gsap.utils.random(-4, 4),
            duration: gsap.utils.random(2.4, 4.2),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: gsap.utils.random(0, 1.5),
          })
        );
      });
      // дрейф вопросов не тратит кадры, пока вход в секцию вне экрана
      ScrollTrigger.create({
        trigger: ".proc-enter-track",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) =>
          qFloatTweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      // линия + комета
      const line = root.current!.querySelector<HTMLElement>(".proc-line");
      const fill = root.current!.querySelector(".proc-fill");
      const comet = root.current!.querySelector<HTMLElement>(".proc-comet");
      const lineST = { trigger: ".proc-steps", start: "top 65%", end: "bottom 75%", scrub: 0.6 };
      if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: lineST });
      let onCometRefresh: (() => void) | null = null;
      if (comet && line) {
        // комета едет через transform: translateY (GPU), а не через top (layout-reflow)
        gsap.set(comet, { xPercent: -50, yPercent: -50 });
        let lineH = line.offsetHeight;
        onCometRefresh = () => {
          lineH = line.offsetHeight;
        };
        ScrollTrigger.addEventListener("refreshInit", onCometRefresh);
        const setCometY = gsap.quickSetter(comet, "y", "px");
        ScrollTrigger.create({
          ...lineST,
          onUpdate: (self) => setCometY(self.progress * lineH),
        });
      }

      // глаголы «въезжают и выпрямляются»
      gsap.utils.toArray<HTMLElement>(".proc-step").forEach((step) => {
        const verb = step.querySelector(".proc-verb");
        const note = step.querySelector(".proc-note");
        gsap.fromTo(
          verb,
          { xPercent: -8, skewX: 7, opacity: 0.18 },
          {
            xPercent: 0,
            skewX: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 82%", end: "top 42%", scrub: 0.7 },
          }
        );
        if (note)
          gsap.fromTo(
            note,
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "expo.out",
              scrollTrigger: { trigger: step, start: "top 70%" },
            }
          );
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        if (onCometRefresh) ScrollTrigger.removeEventListener("refreshInit", onCometRefresh);
      };
    },
    { scope: root }
  );

  return (
    <section id="process" className="process" ref={root}>
      {/* портал-вход: следующий блок проявляется изнутри надписи.
          Трек задаёт длину прокрутки, .proc-enter внутри липнет (sticky). */}
      <div className="proc-enter-track">
      <div className="proc-enter">
        <div className="proc-intro">
          <div className="proc-questions" aria-hidden>
            {QUESTIONS.map((q, i) => (
              <span
                className="proc-q"
                key={i}
                data-depth={q.d}
                style={{ left: `${q.x}%`, top: `${q.y}%`, fontSize: `${q.s}rem`, opacity: q.o }}
              >
                <span className="proc-q-float">{q.t}</span>
              </span>
            ))}
          </div>
          <h2 className="proc-bigtitle">Как&nbsp;мы работаем</h2>
        </div>

        <div className="proc-veil" aria-hidden>
          <h2 className="proc-turn">
            <span>Мы строим</span>
            <span>работу иначе</span>
          </h2>
        </div>
      </div>
      </div>

      <div className="proc-steps">
        <span className="proc-line" aria-hidden>
          <span className="proc-fill" />
          <span className="proc-comet" />
        </span>

        {STEPS.map((s, i) => (
          <div className="proc-step" data-i={i} key={s.verb}>
            <span className="proc-idx">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="proc-verb">{s.verb}</h3>
            <p className="proc-note">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
