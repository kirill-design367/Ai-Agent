"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРОЦЕСС — отвечает на «Это долго и мучительно для меня?».

  ПЕРЕХОД 2 (scene-to-scene): экран пинится, фон СКРАБОМ перетекает из чёрного в
  белый (без реза), надпись «Мы строим работу иначе» уходит, а реплики-вопросы
  СЫПЛЮТСЯ из-за краёв экрана с разных сторон и ОСЕДАЮТ с лёгким overshoot
  (back.out) — рождается сцена «Как мы работаем». Один scrubbed timeline,
  reversible. Дистанция пина откалибрована отдельно под mobile/desktop.
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

/* Вопросы роятся ВОКРУГ заголовка (центр x25–75 / y38–62 оставлен пустым). */
const QUESTIONS = [
  { t: "Цена вопроса?", x: 13, y: 20, s: 1.25, o: 0.52 },
  { t: "Какие сроки?", x: 76, y: 15, s: 1.35, o: 0.52 },
  { t: "А ГАРАНТИИ?", x: 16, y: 35, s: 1.15, o: 0.5 },
  { t: "Что входит?", x: 84, y: 31, s: 1.2, o: 0.48 },
  { t: "А рекламу сделаете?", x: 20, y: 70, s: 0.98, o: 0.44 },
  { t: "А сроки?", x: 87, y: 57, s: 1.05, o: 0.44 },
  { t: "SEO оптимизация будет?", x: 74, y: 74, s: 0.9, o: 0.42 },
  { t: "А когда будет начальная версия?", x: 50, y: 6, s: 0.82, o: 0.38 },
  { t: "А хостинг с доменом подключите?", x: 50, y: 13, s: 0.8, o: 0.36 },
  { t: "Сколько правок можно внести?", x: 50, y: 88, s: 0.84, o: 0.4 },
  { t: "А если мне не понравится?", x: 50, y: 95, s: 0.86, o: 0.38 },
  { t: "?", x: 7, y: 8, s: 2.8, o: 0.12 },
  { t: "?", x: 92, y: 90, s: 2.6, o: 0.12 },
  { t: "?", x: 30, y: 11, s: 1.4, o: 0.2 },
  { t: "?", x: 66, y: 9, s: 1.2, o: 0.18 },
  { t: "?", x: 8, y: 48, s: 1.6, o: 0.22 },
  { t: "?", x: 92, y: 44, s: 1.5, o: 0.2 },
  { t: "?", x: 24, y: 58, s: 1.3, o: 0.2 },
  { t: "?", x: 78, y: 46, s: 1.2, o: 0.18 },
  { t: "?", x: 40, y: 28, s: 1.0, o: 0.15 },
  { t: "?", x: 61, y: 70, s: 1.3, o: 0.2 },
  { t: "?", x: 12, y: 84, s: 1.4, o: 0.2 },
  { t: "?", x: 88, y: 70, s: 1.3, o: 0.2 },
  { t: "?", x: 34, y: 94, s: 1.1, o: 0.16 },
  { t: "?", x: 18, y: 26, s: 0.95, o: 0.16 },
  { t: "?", x: 82, y: 20, s: 1.05, o: 0.16 },
  { t: "?", x: 70, y: 62, s: 0.9, o: 0.14 },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(".proc-turn", { autoAlpha: 0 });
        gsap.set(".proc-scene", { backgroundColor: "#f4f3f0" });
        gsap.set(".proc-q", {
          xPercent: -50,
          yPercent: -50,
          autoAlpha: (i: number) => QUESTIONS[i]?.o ?? 0.3,
        });
        return;
      }

      // ── ПЕРЕХОД 2: отдельная калибровка дистанции пина под mobile/desktop
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 761px)", isMobile: "(max-width: 760px)" },
        (self) => {
          const isMobile = self.conditions?.isMobile;
          // мобильный вьюпорт ниже → короче дистанция, иначе переход «залипает»
          const dist = isMobile ? 850 : 1500;
          const vw = window.innerWidth;
          const vh = window.innerHeight;

          const qEls = gsap.utils.toArray<HTMLElement>(".proc-q");
          // старт: вопросы за краями экрана со случайной стороны + наклон
          qEls.forEach((q) => {
            const side = Math.floor(gsap.utils.random(0, 4));
            let fx = 0;
            let fy = 0;
            if (side === 0) fx = -vw * 0.85;
            else if (side === 1) fx = vw * 0.85;
            else if (side === 2) fy = -vh * 0.85;
            else fy = vh * 0.85;
            gsap.set(q, {
              xPercent: -50,
              yPercent: -50,
              x: fx,
              y: fy,
              rotation: gsap.utils.random(-8, 0),
              autoAlpha: 0,
              willChange: "transform, opacity",
            });
          });
          gsap.set(".proc-bigtitle", { autoAlpha: 0, y: 34 });
          gsap.set(".proc-turn", { autoAlpha: 1, scale: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".proc-scene",
              start: "top top",
              end: () => "+=" + dist,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // фон: чёрный → белый плавным скрабом, без реза
          tl.fromTo(
            ".proc-scene",
            { backgroundColor: "#070708" },
            { backgroundColor: "#f4f3f0", ease: "none", duration: 1 },
            0
          );
          // «Мы строим работу иначе» уходит (растворяется + лёгкий зум)
          tl.to(".proc-turn", { autoAlpha: 0, scale: 1.22, ease: "power1.in", duration: 0.3 }, 0);

          // вопросы СЫПЛЮТСЯ с разных сторон и ОСЕДАЮТ с overshoot; порядок случайный
          const order = gsap.utils.shuffle(qEls.map((_, i) => i));
          qEls.forEach((q, i) => {
            const targetO = QUESTIONS[i]?.o ?? 0.3;
            const at = 0.22 + (order.indexOf(i) / qEls.length) * 0.55 * gsap.utils.random(0.85, 1.15);
            tl.to(
              q,
              {
                x: 0,
                y: 0,
                rotation: 0,
                autoAlpha: targetO,
                ease: "back.out(1.2)",
                duration: 0.5,
              },
              at
            );
          });

          // «Как мы работаем» рождается, когда экран уже почти белый
          tl.to(".proc-bigtitle", { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, 0.62);
          // короткая задержка полностью раскрытой сцены
          tl.to({}, { duration: 0.25 });
        }
      );

      // НЕВЕСОМЫЙ ДРЕЙФ вопросов после оседания — плавают в невесомости.
      // Дрейфует ВНУТРЕННИЙ спан (.proc-q-float), а не .proc-q (его двигает
      // scrub-таймлайн) → не конфликтует с «оседанием».
      const qFloatTweens: gsap.core.Tween[] = [];
      gsap.utils.toArray<HTMLElement>(".proc-q-float").forEach((q) => {
        qFloatTweens.push(
          gsap.to(q, {
            y: gsap.utils.random(-26, 26),
            x: gsap.utils.random(-18, 18),
            rotation: gsap.utils.random(-6, 6),
            duration: gsap.utils.random(3.5, 6),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: gsap.utils.random(0, 1.6),
          })
        );
      });
      // Дрейф не тратит кадры вне экрана. ВАЖНО: триггер — вся секция .process
      // (root), а НЕ пиннящаяся .proc-scene: у пиннящегося элемента активное
      // окно схлопывается → вопросы «двигались в начале и застывали». У
      // непиннящегося root окно охватывает весь путь сцены.
      ScrollTrigger.create({
        trigger: root.current!,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) =>
          qFloatTweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      // ── шаги «Как мы работаем» (линия-комета + глаголы) — как было
      const line = root.current!.querySelector<HTMLElement>(".proc-line");
      const fill = root.current!.querySelector(".proc-fill");
      const comet = root.current!.querySelector<HTMLElement>(".proc-comet");
      // scrub 0.3 (плотнее, чем было 0.6) — точка на линии не «притормаживает»
      // с инерцией, а идёт вплотную за скроллом
      const lineST = { trigger: ".proc-steps", start: "top 65%", end: "bottom 75%", scrub: 0.3 };
      if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: lineST });
      let onCometRefresh: (() => void) | null = null;
      if (comet && line) {
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
      {/* ПЕРЕХОД 2 — пиннящаяся сцена: фон чёрный→белый, вопросы сыплются */}
      <div className="proc-scene">
        <div className="proc-questions" aria-hidden>
          {QUESTIONS.map((q, i) => (
            <span
              className="proc-q"
              key={i}
              style={{ left: `${q.x}%`, top: `${q.y}%`, fontSize: `${q.s}rem` }}
            >
              <span className="proc-q-float">{q.t}</span>
            </span>
          ))}
        </div>
        <h2 className="proc-turn">
          <span>Мы строим</span>
          <span>работу иначе</span>
        </h2>
        <h2 className="proc-bigtitle">Как&nbsp;мы работаем</h2>
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
