"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "@/lib/gsap";

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

      // ВОПРОС-ТИТР (3D-кинетика, awwwards): буквы «встают» из глубины сцены —
      // rotateX −95°→0 от базовой линии, каскадом, в перспективе. Как титры в
      // кино. Только transform/opacity → композитор, плавно и на мобиле.
      const aq = root.current!.querySelector<HTMLElement>(".aq-title");
      if (aq) {
        const split = new SplitText(aq, { type: "words,chars" });
        gsap.set(split.chars, {
          rotateX: -95,
          yPercent: 65,
          z: -60,
          opacity: 0,
          transformOrigin: "50% 100%",
        });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".adv-quest3d",
              start: "top 66%",
              toggleActions: "play none none reverse",
            },
          })
          .to(split.chars, {
            rotateX: 0,
            yPercent: 0,
            z: 0,
            opacity: 1,
            duration: 1.25,
            ease: "expo.out",
            stagger: { each: 0.03, from: "start" },
          });
        // вечная жизнь: строки едва заметно дышат в глубине (никогда не замирают)
        gsap.utils.toArray<HTMLElement>(".aq-l").forEach((line, i) => {
          idleTweens.push(
            gsap.to(line, {
              y: [6, -7, 5][i % 3],
              rotateX: 1.6,
              duration: 4.6 + i * 0.7,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: i * 0.5,
            })
          );
        });
      }

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
        // вся секция (не только список) — дыхание титра живёт, пока блок на экране
        trigger: ".adv",
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
      {/* переход-вход: статичная волна-чернила, тёмный край блока в светлый Процесс */}
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
        <div className="adv-quest3d">
          <h2 className="aq-title">
            <span className="aq-l">Почему</span>
            <span className="aq-l aq-l2">выбирают</span>
            <span className="aq-l aq-l3">меня,</span>
            <span className="aq-l aq-l4">а&nbsp;не</span>
            <span className="aq-l aq-l5">агентство?</span>
          </h2>
        </div>
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
