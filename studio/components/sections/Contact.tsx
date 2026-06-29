"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

/*
  КОНТАКТ — финал. Не сухая форма, а предвкушение. Гигантский заголовок,
  магнитные кнопки реальных каналов, и возврат к точке-треугольнику-A —
  замыкаем петлю бренда (точка → … → шедевр), с чего начинали в интро.
*/
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const split = new SplitText(title.current!, { type: "words,chars" });
      gsap.from(split.chars, {
        yPercent: 120,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: { each: 0.02, from: "start" },
        scrollTrigger: { trigger: title.current!, start: "top 82%" },
      });
      gsap.fromTo(
        ".contact-row",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".contact-row", start: "top 88%" },
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="contact" className="theme-dark contact" ref={root}>
      <div className="contact-inner">
        <span className="contact-kicker" data-magnetic>
          (10) С чего начать
        </span>
        <h2 className="contact-title" ref={title}>
          Расскажите
          <br />о проекте
        </h2>

        <p className="contact-sub contact-row">
          Идея, сроки, бюджет — в&nbsp;двух словах. Дальше придумаю я. Отвечаю
          лично, обычно в&nbsp;течение пары часов.
        </p>

        <div className="contact-channels contact-row">
          <a className="contact-ch" href="https://t.me/Sk_Mac1" target="_blank" rel="noopener" data-magnetic>
            <span className="contact-ch-l">Telegram</span>
            <span className="contact-ch-v">@Sk_Mac1</span>
          </a>
          <a className="contact-ch" href="https://wa.me/79185367424" target="_blank" rel="noopener" data-magnetic>
            <span className="contact-ch-l">WhatsApp</span>
            <span className="contact-ch-v">+7 918 536-74-24</span>
          </a>
          <a className="contact-ch" href="mailto:kirill0061@mail.ru" data-magnetic>
            <span className="contact-ch-l">Почта</span>
            <span className="contact-ch-v">kirill0061@mail.ru</span>
          </a>
        </div>

        <div className="contact-foot contact-row">
          <svg className="contact-geo" viewBox="0 0 80 72" aria-hidden>
            <polygon points="40,6 75,66 5,66" />
            <circle cx="40" cy="49" r="3" />
          </svg>
          <span className="contact-sign">
            AUREA — от точки до шедевра. Без чат-ботов и менеджеров.
          </span>
        </div>
      </div>
    </section>
  );
}
