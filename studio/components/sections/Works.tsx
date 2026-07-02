"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/*
  РАБОТЫ — отвечает на «У вас действительно высокий уровень?».

  Как в референс-видео: стопка-кино — каждый кейс липнет, следующий наезжает
  сверху, накрытый плавно уходит ВГЛУБЬ (уменьшается, темнеет, растворяется).
  Внизу — sticky-описание кейса: с каждым новым кейсом старая подпись
  растворяется, а новая плавно проявляется (кроссфейд). Финал — последний кейс
  уходит в глубину со светящейся градиентной рамкой, открывая блок «Боль».
*/
const CASES = [
  {
    img: "/work/case-1.webp",
    title: "Volume — After Dark",
    meta: "Лендинг · 3 дня",
    desc: "Кинематографический лендинг ночного бренда: тёмная сцена, крупная типографика, плавный скролл-театр. Каждый экран удерживает внимание и ведёт к заявке.",
  },
  {
    img: "/work/case-2.webp",
    title: "Aristide",
    meta: "Портфолио · 4 дня",
    desc: "Портфолио фотографа с полноэкранной галереей и мягкими переходами. Работы на первом плане — интерфейс исчезает, остаётся только впечатление.",
  },
  {
    img: "/work/case-3.webp",
    title: "Анна Рыковская",
    meta: "Визитка · 2 дня",
    desc: "Визитка стилиста-имиджмейкера: минимум текста, максимум характера. Один экран — и уже понятно, к кому и зачем обращаться.",
  },
  {
    img: "/work/case-4.webp",
    title: "Garden Eight",
    meta: "Студия дизайна · 5 дней",
    desc: "Сайт дизайн-студии с живой сеткой проектов и глубиной при наведении. Строгая система, в которой каждый кейс дышит.",
  },
  {
    img: "/work/case-5.webp",
    title: "Dream.doll",
    meta: "Интернет-магазин · 6 дней",
    desc: "Интернет-магазин коллекционных кукол: атмосферный каталог, аккуратная карточка товара и честный, короткий путь к покупке.",
  },
  {
    img: "/work/case-6.webp",
    title: "Step into Web3",
    meta: "Лендинг · 3 дня",
    desc: "Лендинг web3-мессенджера: динамичная сцена, объёмные мокапы устройств, акцент на ранний доступ. Технологично и живо.",
  },
];

export default function Works() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // ЛЕНТА — горизонтальный parallax, привязанный к scrollY (не ко времени).
      const ticker = root.current?.querySelector(".works-ticker");
      if (ticker)
        gsap.fromTo(
          ticker,
          { xPercent: 2 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: {
              trigger: ".works-banner",
              start: "top bottom",
              end: "bottom top",
              scrub: 1.4,
            },
          }
        );

      const cards = gsap.utils.toArray<HTMLElement>(".work-card");

      // КАЖДЫЙ кейс уходит ВГЛУБЬ ПОСЛЕДОВАТЕЛЬНО: когда наезжает следующий,
      // текущий уменьшается, темнеет и растворяется в самом конце — плавно,
      // по одному, без преждевременных исчезновений.
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const shade = card.querySelector(".work-shade");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 0.6,
          },
        });
        tl.to(card, { scale: 0.62, yPercent: -3, ease: "power1.in", duration: 1 }, 0)
          .to(shade, { opacity: 0.85, ease: "none", duration: 1 }, 0)
          .to(card, { autoAlpha: 0, ease: "power1.in", duration: 0.4 }, 0.6);
      });

      // ФИНАЛ (как в референс-видео): последний кейс уходит в глубину со
      // светящейся градиентной рамкой, растворяется → чёрная пауза → «Боль».
      const last = cards[cards.length - 1];
      if (last) {
        const shade = last.querySelector(".work-shade");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".works-tail",
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        tl.to(last, { "--glow": 1, ease: "power1.in", duration: 0.45 } as gsap.TweenVars, 0)
          .to(last, { scale: 0.42, yPercent: -3, ease: "power1.inOut", duration: 1 }, 0)
          .to(shade, { opacity: 0.9, ease: "none", duration: 1 }, 0)
          .to(last, { autoAlpha: 0, ease: "power2.in", duration: 0.45 }, 0.6);
      }

      // ОПИСАНИЯ ВНИЗУ: sticky-подпись; при смене кейса старая растворяется,
      // новая плавно проявляется (кроссфейд, только opacity/transform).
      const descs = gsap.utils.toArray<HTMLElement>(".wd-item");
      if (descs.length === cards.length) {
        gsap.set(descs, { autoAlpha: 0, y: 14 });
        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 72%",
            endTrigger: i < cards.length - 1 ? cards[i + 1] : ".works-tail",
            end: i < cards.length - 1 ? "top 72%" : "top 55%",
            onToggle: (self) => {
              gsap.to(descs[i], {
                autoAlpha: self.isActive ? 1 : 0,
                y: self.isActive ? 0 : 14,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            },
          });
        });
      }

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="work" className="theme-dark works" ref={root}>
      {/* лента-parallax «ПОРТФОЛИО ПРИМЕРЫ РАБОТ» */}
      <div className="works-banner" aria-label="Портфолио — примеры работ">
        <div className="works-band">
          <div className="works-ticker">
            {Array.from({ length: 2 }).map((_, g) => (
              <div className="works-ticker-group" key={g} aria-hidden={g === 1}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span className="wb-row" key={i}>
                    <span className="wb-big">Портфолио</span>
                    <span className="wb-big">Примеры&nbsp;работ</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="works-stack">
        {/* sticky-описания внизу экрана — кроссфейд при смене кейса */}
        <div className="works-desc" aria-hidden>
          {CASES.map((c) => (
            <p className="wd-item" key={c.title}>
              {c.desc}
            </p>
          ))}
        </div>

        {CASES.map((c, i) => (
          <article className="work-card" key={c.title}>
            <span className="work-num">
              {String(i + 1).padStart(2, "0")} / {String(CASES.length).padStart(2, "0")}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(c.img)} alt={c.title} loading="lazy" />
            <div className="work-shade" aria-hidden />
            <span className="work-glow" aria-hidden />
            <div className="work-cap">
              <h3>{c.title}</h3>
              <span className="meta">{c.meta}</span>
            </div>
          </article>
        ))}

        {/* хвост: последний кейс уходит вглубь, затем чёрная пауза перед «Болью» */}
        <div className="works-tail" aria-hidden />
      </div>
    </section>
  );
}
