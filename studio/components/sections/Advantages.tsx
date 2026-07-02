"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРЕИМУЩЕСТВА — отвечает на «Почему вы, а не агентство/фрилансер?».

  Переход из Процесса (светлый) — тёмная волна-чернила поднимается снизу и
  «затапливает» блок. Вопрос набран КРУПНЫМИ буквами ИЗ ТОЧЕК, встаёт столбиком
  по золотому сечению. Финальный «?» стекает в спинной «ручей», который наливается
  по скроллу — и втекает в каждый ответ: номер ответа загорается, когда ручей
  до него доходит. Прямая связь «вопрос → ответ».
*/
const ADV = [
  {
    t: "Один мастер — от идеи до запуска",
    n: "Без менеджеров и испорченного телефона. Вы общаетесь с тем, кто реально делает сайт.",
  },
  {
    t: "Чистый код, не конструктор",
    n: "Никаких шаблонов Tilda и WordPress. Скорость, гибкость и любые анимации.",
  },
  {
    t: "1–5 дней",
    n: "Пока агентство составляет смету и согласовывает бриф — ваш сайт уже работает.",
  },
  {
    t: "Пожизненная гарантия",
    n: "Что-то сломалось или нужно поправить — чиню бесплатно. Навсегда.",
  },
  {
    t: "Дизайн под вас, а не из набора",
    n: "Каждый экран — под вашу задачу, продукт и аудиторию. Ни одного чужого пикселя.",
  },
  {
    t: "Сайт ваш на 100%",
    n: "Код, домен и все доступы у вас. Никакой привязки и абонентской платы.",
  },
  {
    t: "Отвечаю лично и быстро",
    n: "Обычно в течение пары часов — в Telegram или WhatsApp. Без тикетов и очередей.",
  },
  {
    t: "Делаю, как для себя",
    n: "Каждый проект — в моё портфолио. Мне важно, чтобы вы возвращались и рекомендовали.",
  },
];

export default function Advantages() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // бесконечные твины (дрейф ответов, пульс капли) — ставятся на паузу вне экрана
      const idleTweens: gsap.core.Tween[] = [];

      // ПЕРЕХОД-ВХОД: тёмная волна-чернила поднимается из Процесса и затапливает блок
      const wave = root.current!.querySelector(".adv-wave");
      if (wave) {
        gsap.fromTo(
          wave,
          { yPercent: 36 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".adv",
              start: "top 96%",
              end: "top 40%",
              scrub: 0.7,
            },
          }
        );
      }

      // вопрос собирается ИЗ ЧАСТИЦ на канвасе — см. <QuestParticles /> ниже

      // ВЕНОМ-БЛОБ: «?» стекает амёбой вниз сквозь ответы — ядро + хвост с лагом,
      // гуи-фильтр (см. <filter id="adv-goo">) сплавляет кружки в одну каплю
      const venomEl = root.current!.querySelector<HTMLElement>(".adv-venom");
      const blobCore = root.current!.querySelector<HTMLElement>(".adv-blob-core");
      const blobTail1 = root.current!.querySelector<HTMLElement>(".adv-blob-tail-1");
      const blobTail2 = root.current!.querySelector<HTMLElement>(".adv-blob-tail-2");
      const blobTail3 = root.current!.querySelector<HTMLElement>(".adv-blob-tail-3");
      const blobGlow = root.current!.querySelector<HTMLElement>(".adv-blob-glow");
      let onVenomRefresh: (() => void) | null = null;
      if (venomEl && blobCore) {
        // высоту трека кэшируем и пересчитываем только на ресайзе —
        // движение капли идёт через transform: translateY (компоновка на GPU,
        // без layout-reflow, в отличие от анимации top)
        let trackH = venomEl.offsetHeight;
        onVenomRefresh = () => {
          trackH = venomEl.offsetHeight;
        };
        ScrollTrigger.addEventListener("refreshInit", onVenomRefresh);

        const quickY = (el: HTMLElement | null) =>
          el ? gsap.quickSetter(el, "y", "px") : () => {};
        const setCore = quickY(blobCore);
        const setTail1 = quickY(blobTail1);
        const setTail2 = quickY(blobTail2);
        const setTail3 = quickY(blobTail3);
        const setGlow = quickY(blobGlow);

        ScrollTrigger.create({
          trigger: ".adv-list",
          start: "top 72%",
          end: "bottom 82%",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            setCore(p * trackH);
            setTail1(Math.max(0, p - 0.025) * trackH);
            setTail2(Math.max(0, p - 0.05) * trackH);
            setTail3(Math.max(0, p - 0.078) * trackH);
            setGlow(p * trackH);
          },
        });
        // живое «дыхание» капли — лёгкая пульсация ядра
        idleTweens.push(
          gsap.to(blobCore, {
            scale: 1.18,
            duration: 0.9,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          })
        );
      }

      // ответы проявляются; номер загорается и заголовок «дёргается» — блоб его захватил
      gsap.utils.toArray<HTMLElement>(".adv-item").forEach((item, i) => {
        gsap.fromTo(
          item,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: item, start: "top 90%" },
          }
        );
        const num = item.querySelector(".adv-num");
        const heading = item.querySelector<HTMLElement>(".adv-t");
        ScrollTrigger.create({
          trigger: item,
          start: "top 64%",
          onEnter: () => {
            num?.classList.add("is-lit");
            if (heading)
              gsap.fromTo(
                heading,
                { x: 0, skewX: 0 },
                {
                  keyframes: [
                    { x: 7, skewX: -3.5, duration: 0.12, ease: "power2.out" },
                    { x: -3, skewX: 1.5, duration: 0.12, ease: "power2.inOut" },
                    { x: 0, skewX: 0, duration: 0.2, ease: "power3.out" },
                  ],
                }
              );
          },
          onLeaveBack: () => num?.classList.remove("is-lit"),
        });
        idleTweens.push(
          gsap.to(item, {
            y: gsap.utils.random(-8, 8),
            duration: gsap.utils.random(3.5, 5.5),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.2,
          })
        );
      });

      ScrollTrigger.create({
        trigger: ".adv-list",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) =>
          idleTweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        if (onVenomRefresh) ScrollTrigger.removeEventListener("refreshInit", onVenomRefresh);
      };
    },
    { scope: root }
  );

  return (
    <section id="advantages" className="theme-dark adv" ref={root}>
      {/* переход-вход: волна-чернила, поднимающаяся из Процесса */}
      <svg className="adv-wave" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0,70 C220,128 430,8 720,60 C1010,112 1230,18 1440,70 L1440,140 L0,140 Z"
          fill="#08080a"
        />
      </svg>

      {/* космос — звёздная пыль и дрейфующие орбиты (невесомость) */}
      <div className="adv-space" aria-hidden>
        <span className="adv-stars" />
        <span className="adv-orb adv-orb-1" />
        <span className="adv-orb adv-orb-2" />
      </div>

      <div className="adv-stage">
        <QuestParticles />
      </div>

      <div className="adv-list">
        {/* веном-блоб: «?» стекает амёбой вниз и захватывает каждый заголовок */}
        <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
          <filter id="adv-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
          </filter>
        </svg>
        <span className="adv-venom" aria-hidden>
          <span className="adv-blob-glow" />
          <span className="adv-blob-goo">
            <span className="adv-blob-tail adv-blob-tail-3" />
            <span className="adv-blob-tail adv-blob-tail-2" />
            <span className="adv-blob-tail adv-blob-tail-1" />
            <span className="adv-blob-core" />
          </span>
        </span>

        {ADV.map((a, i) => (
          <article className="adv-item" data-i={i} key={a.t}>
            <span className="adv-num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="adv-t">{a.t}</h3>
            <p className="adv-n">{a.n}</p>
          </article>
        ))}
        <a href="#contact" className="btn btn--cut adv-cta" data-magnetic>
          <span>Хочу сайт как у вас&nbsp;&nbsp;→</span>
        </a>
      </div>
    </section>
  );
}

/*
  ВОПРОС ИЗ ЧАСТИЦ (кинематографично): канвас заполнен тысячами мелких частиц,
  которые постоянно плавно дрейфуют — живая энергия, никогда не замирают.
  Когда блок доходит до зрителя, частицы притягиваются и СОБИРАЮТСЯ в буквы
  фразы «Почему выбирают меня, а не агентство?» (не буквы появляются — частицы
  формируют их). Даже собранные, частицы едва заметно дышат. При скролле назад —
  рассыпаются обратно в свободный дрейф. Всё на одном canvas (один слой GPU).
*/
function QuestParticles() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.4 : 1.6);
    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-headline")
        .trim() || "system-ui";

    type P = {
      x: number; y: number; vx: number; vy: number;
      tx: number; ty: number; ph: number; sp: number; a: number;
    };
    let parts: P[] = [];
    let mode: "float" | "assemble" = "float";
    let raf = 0;
    let running = false;
    let W = 0;
    let H = 0;
    let t = 0;
    const size = mobile ? 1.7 : 2;

    const build = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // рендерим фразу на offscreen-канвас и сэмплируем точки букв
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const octx = off.getContext("2d")!;
      const lines = mobile
        ? ["ПОЧЕМУ", "ВЫБИРАЮТ", "МЕНЯ, А НЕ", "АГЕНТСТВО?"]
        : ["ПОЧЕМУ ВЫБИРАЮТ", "МЕНЯ, А НЕ АГЕНТСТВО?"];
      let fs = mobile ? W * 0.19 : W * 0.085;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `700 ${fs}px ${family}`;
      const maxW = Math.max(...lines.map((l) => octx.measureText(l).width));
      const totH = lines.length * fs * 1.12;
      const k = Math.min((W * 0.97) / maxW, (H * 0.92) / totH, 1);
      fs *= k;
      octx.font = `700 ${fs}px ${family}`;
      const lh = fs * 1.14;
      const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
      octx.fillStyle = "#fff";
      lines.forEach((l, i) => octx.fillText(l, W / 2, y0 + i * lh));

      const stepPx = 3;
      const img = octx.getImageData(0, 0, W, H).data;
      let targets: { x: number; y: number }[] = [];
      for (let y = 0; y < H; y += stepPx)
        for (let x = 0; x < W; x += stepPx)
          if (img[(y * W + x) * 4 + 3] > 140) targets.push({ x, y });
      const cap = mobile ? 1600 : 3800;
      if (targets.length > cap) {
        const keep = cap / targets.length;
        targets = targets.filter(() => Math.random() < keep);
      }

      const old = parts;
      parts = targets.map((tg, i) => {
        const o = old[i];
        return {
          x: o ? o.x : Math.random() * W,
          y: o ? o.y : Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          tx: tg.x,
          ty: tg.y,
          ph: Math.random() * Math.PI * 2,
          sp: 0.5 + Math.random() * 0.9,
          a: 0.5 + Math.random() * 0.5,
        };
      });
    };

    const tick = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f2f0ea";
      for (const p of parts) {
        if (mode === "assemble") {
          // частицы ПРИТЯГИВАЮТСЯ к буквам; лёгкое вечное дыхание вокруг цели
          p.x += (p.tx - p.x) * 0.08;
          p.y += (p.ty - p.y) * 0.08;
          ctx.globalAlpha = p.a * (0.86 + 0.14 * Math.sin(t * 2 * p.sp + p.ph));
          ctx.fillRect(
            p.x + Math.sin(t * p.sp + p.ph) * 0.45,
            p.y + Math.cos(t * p.sp * 0.9 + p.ph) * 0.45,
            size,
            size
          );
        } else {
          // свободный дрейф — живая энергия, никогда не замирает
          p.vx += Math.sin(t * 0.7 + p.ph) * 0.004;
          p.vy += Math.cos(t * 0.6 + p.ph) * 0.004;
          p.vx *= 0.995;
          p.vy *= 0.995;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -4) p.x = W + 4;
          else if (p.x > W + 4) p.x = -4;
          if (p.y < -4) p.y = H + 4;
          else if (p.y > H + 4) p.y = -4;
          ctx.globalAlpha = p.a * 0.55;
          ctx.fillRect(p.x, p.y, size, size);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const triggers: ScrollTrigger[] = [];
    let disposed = false;
    const init = async () => {
      try {
        await document.fonts.ready;
      } catch {}
      if (disposed) return;
      build();
      if (reduce) {
        // без движения: сразу собранная фраза, один кадр
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#f2f0ea";
        parts.forEach((p) => {
          ctx.globalAlpha = p.a;
          ctx.fillRect(p.tx, p.ty, size, size);
        });
        return;
      }
      registerGsap();
      triggers.push(
        // канвас живёт только на экране — вне экрана rAF остановлен
        ScrollTrigger.create({
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? start() : stop()),
        }),
        // дошли до блока → частицы собираются в буквы; назад — рассыпаются
        ScrollTrigger.create({
          trigger: wrap,
          start: "top 66%",
          onEnter: () => {
            mode = "assemble";
          },
          onLeaveBack: () => {
            mode = "float";
            parts.forEach((p) => {
              p.vx = (Math.random() - 0.5) * 0.7;
              p.vy = (Math.random() - 0.5) * 0.7;
            });
          },
        })
      );
    };
    init();

    const onResize = () => {
      if (!reduce) build();
    };
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      stop();
      triggers.forEach((tr) => tr.kill());
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="adv-quest-wrap" ref={wrapRef}>
      <h2 className="adv-sr">Почему выбирают меня, а не агентство?</h2>
      <canvas className="adv-quest-canvas" ref={canvasRef} aria-hidden />
    </div>
  );
}
