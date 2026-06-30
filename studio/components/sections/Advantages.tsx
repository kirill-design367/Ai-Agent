"use client";

import { useRef } from "react";
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
const QWORDS = ["Почему", "выбирают", "меня,", "а не", "агентство"];

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

      // слова вопроса СВАЛИВАЮТСЯ по скроллу — слово за словом, точки «проявляются»
      gsap.utils.toArray<HTMLElement>(".adv-qw").forEach((w, i) => {
        gsap.fromTo(
          w,
          { y: -130, opacity: 0, rotateX: -55, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".adv-stage",
              start: `top ${64 - i * 7}%`,
              end: `top ${36 - i * 7}%`,
              scrub: 0.7,
            },
          }
        );
      });

      // «?» стекает каплей в верх спинного ручья
      const drip = root.current!.querySelector(".adv-drip");
      const drop = root.current!.querySelector(".adv-drop");
      if (drip && drop) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".adv-stage", start: "top 30%" },
        });
        tl.fromTo(drip, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power1.in" }).fromTo(
          drop,
          { y: 0, opacity: 1, scale: 1 },
          { y: 120, opacity: 0, scale: 0.6, duration: 0.7, ease: "power1.in" },
          "-=0.2"
        );
      }

      // ВЕНОМ-ПОТОК: точка из вопроса перетекает вниз сквозь ответы (без статичной линии)
      const trail = root.current!.querySelector(".adv-venom-trail");
      const head = root.current!.querySelector(".adv-venom-head");
      const venomST = { trigger: ".adv-list", start: "top 72%", end: "bottom 82%", scrub: 0.6 };
      if (trail) gsap.fromTo(trail, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: venomST });
      if (head) gsap.fromTo(head, { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: venomST });

      // ответы проявляются; номер загорается, когда ручей до него «дотекает»
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
        if (num)
          ScrollTrigger.create({
            trigger: item,
            start: "top 64%",
            onEnter: () => num.classList.add("is-lit"),
            onLeaveBack: () => num.classList.remove("is-lit"),
          });
        gsap.to(item, {
          y: gsap.utils.random(-8, 8),
          duration: gsap.utils.random(3.5, 5.5),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
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
        <div className="adv-quest">
          {QWORDS.map((w, i) => (
            <span className={`adv-qw adv-qw-${i}`} key={w}>
              {w}
              {i === QWORDS.length - 1 && <span className="adv-qmark">?</span>}
            </span>
          ))}
        </div>
        <span className="adv-drip" aria-hidden>
          <span className="adv-drop" />
        </span>
      </div>

      <div className="adv-list">
        {/* веном-поток: точка из вопроса перетекает вниз в ответы (без статичной линии) */}
        <span className="adv-venom" aria-hidden>
          <span className="adv-venom-trail" />
          <span className="adv-venom-head" />
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
