"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРЕИМУЩЕСТВА — отвечает на «Почему вы, а не агентство/фрилансер?».

  Вопрос набран КРУПНЫМИ буквами из точек (как в референсе), слова встают в
  столбик чуть хаотично по золотому сечению. Финальный «?» стекает водой вниз
  и «наливает» блок ответов — преимущества проявляются в невесомости.
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
];

export default function Advantages() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // слова вопроса СВАЛИВАЮТСЯ по скроллу — слово за словом
      gsap.utils.toArray<HTMLElement>(".adv-qw").forEach((w, i) => {
        gsap.fromTo(
          w,
          { y: -130, opacity: 0, rotateX: -55 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
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

      // «?» стекает водой → наливает блок ответов
      const drip = root.current!.querySelector(".adv-drip");
      const drop = root.current!.querySelector(".adv-drop");
      if (drip && drop) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".adv-stage", start: "top 30%" },
        });
        tl.fromTo(
          drip,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.9, ease: "power1.in" }
        ).fromTo(
          drop,
          { y: 0, opacity: 1, scale: 1 },
          { y: 120, opacity: 0, scale: 0.6, duration: 0.7, ease: "power1.in" },
          "-=0.2"
        );
      }

      // ответы проявляются и невесомо парят
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
        gsap.to(item, {
          y: gsap.utils.random(-10, 10),
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
        {ADV.map((a, i) => (
          <article className="adv-item" data-i={i} key={a.t}>
            <span className="adv-num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="adv-t">{a.t}</h3>
            <p className="adv-n">{a.n}</p>
          </article>
        ))}
        <a href="#contact" className="btn btn--primary adv-cta" data-magnetic>
          Обсудить проект
        </a>
      </div>
    </section>
  );
}
