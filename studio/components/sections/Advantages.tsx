"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРЕИМУЩЕСТВА — отвечает на возражение «Почему вы, а не агентство/фрилансер?».

  Открывается экраном-манифестом в духе TrucknRoll: гигантский halftone-текст
  (dithered, заполнен точечным паттерном) как атмосферный фон + плавающий
  caption/CTA по центру. Дальше — 6 преимуществ редакторской асимметричной
  сеткой с reveal-параллаксом. Возврат в люкс-чёрный, занавес-перетекание.
*/
const GIANT = ["Сайт,", "который", "запомнят"];

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

      // параллакс гигантских halftone-строк
      gsap.utils.toArray<HTMLElement>(".adv-giant .g").forEach((line, i) => {
        gsap.fromTo(
          line,
          { yPercent: 14 + i * 6 },
          {
            yPercent: -(14 + i * 6),
            ease: "none",
            scrollTrigger: {
              trigger: ".adv-hero",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      });

      // reveal преимуществ со stagger
      gsap.utils.toArray<HTMLElement>(".adv-item").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: item, start: "top 88%" },
          }
        );
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="advantages" className="theme-dark adv" ref={root}>
      {/* экран-манифест: halftone-гигант + плавающий центр */}
      <div className="adv-hero">
        <div className="adv-giant" aria-hidden>
          {GIANT.map((w) => (
            <span className="g" key={w}>
              {w}
            </span>
          ))}
        </div>
        <div className="adv-hero-center">
          <span className="adv-tag">(04) Почему AUREA</span>
          <p className="adv-claim">
            Почему выбирают меня, а&nbsp;не агентство со&nbsp;штатом или
            конструктор за&nbsp;вечер.
          </p>
          <a href="#contact" className="btn btn--primary" data-magnetic>
            Обсудить проект
          </a>
        </div>
      </div>

      {/* 6 преимуществ — редакторская асимметрия */}
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
