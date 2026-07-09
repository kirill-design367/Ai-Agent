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
    n: "Что-то сломалось или нужно поправить — чиню бесплатно.",
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
    n: "Обычно в течение пары часов — в Telegram или WhatsApp. Без менеджера и автоответчика.",
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

      // ответы проявляются; номер загорается и заголовок «дёргается» на входе
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
        {ADV.map((a, i) => (
          <article className="adv-item" data-i={i} key={a.t}>
            <span className="adv-num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="adv-t">{a.t}</h3>
            <p className="adv-n">{a.n}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
