"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/*
  РАБОТЫ — отвечает на «У вас действительно высокий уровень?».

  Референс-уровень (по мотивам maheshppai): редакторские строки-кейсы —
  крупный индекс, название, теги, CTA; ниже — мокап устройства и описание.
  Тонкая светящаяся линия-разделитель. Появление на скролле. В самом конце
  последний кейс уходит ВГЛУБЬ со светящейся рамкой — и открывается блок «Боль».
*/
const CASES = [
  {
    n: "01",
    img: "/work/case-1.webp",
    title: "Volume — After Dark",
    tags: ["Лендинг", "Кинематограф", "3 дня"],
    desc: "Кинематографический лендинг ночного бренда: тёмная сцена, крупная типографика, плавный скролл-театр. Каждый экран удерживает внимание и ведёт к заявке.",
  },
  {
    n: "02",
    img: "/work/case-2.webp",
    title: "Aristide",
    tags: ["Портфолио", "Галерея", "4 дня"],
    desc: "Портфолио фотографа с полноэкранной галереей и мягкими переходами. Работы на первом плане — интерфейс исчезает, остаётся только впечатление.",
  },
  {
    n: "03",
    img: "/work/case-3.webp",
    title: "Анна Рыковская",
    tags: ["Визитка", "Личный бренд", "2 дня"],
    desc: "Визитка стилиста-имиджмейкера: минимум текста, максимум характера. Один экран — и уже понятно, к кому и зачем обращаться.",
  },
  {
    n: "04",
    img: "/work/case-4.webp",
    title: "Garden Eight",
    tags: ["Студия", "Сетка проектов", "5 дней"],
    desc: "Сайт дизайн-студии с живой сеткой проектов и глубиной при наведении. Строгая система, в которой каждый кейс дышит.",
  },
  {
    n: "05",
    img: "/work/case-5.webp",
    title: "Dream.doll",
    tags: ["Магазин", "Каталог", "6 дней"],
    desc: "Интернет-магазин коллекционных кукол: атмосферный каталог, аккуратная карточка товара и честный, короткий путь к покупке.",
  },
  {
    n: "06",
    img: "/work/case-6.webp",
    title: "Step into Web3",
    tags: ["Лендинг", "3D-мокапы", "3 дня"],
    desc: "Лендинг web3-мессенджера: динамичная сцена, объёмные мокапы устройств, акцент на ранний доступ. Технологично и живо.",
  },
];

export default function Works() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ЛЕНТА — горизонтальный parallax, привязанный к scrollY (не ко времени).
      if (!reduce) {
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
      }

      const rows = gsap.utils.toArray<HTMLElement>(".work-row");

      // ПОЯВЛЕНИЕ каждой строки на скролле: индекс/заголовок/теги/кнопка мягко
      // въезжают, мокап раскрывается (clip + лёгкий подъём). Только transform/opacity.
      if (!reduce)
        rows.forEach((rowEl) => {
          const head = rowEl.querySelectorAll<HTMLElement>("[data-rev]");
          const mock = rowEl.querySelector<HTMLElement>(".wr-mockup");
          const line = rowEl.querySelector<HTMLElement>(".wr-line");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: rowEl, start: "top 78%", once: true },
          });
          if (line)
            tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "expo.out" }, 0);
          tl.fromTo(
            head,
            { y: 34, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.08 },
            0.05
          );
          if (mock)
            tl.fromTo(
              mock,
              { yPercent: 12, opacity: 0, clipPath: "inset(14% 0% 0% 0%)" },
              {
                yPercent: 0,
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.1,
                ease: "expo.out",
              },
              0.1
            );
        });

      // Лёгкий параллакс картинки внутри рамки мокапа (глубина).
      if (!reduce)
        rows.forEach((rowEl) => {
          const img = rowEl.querySelector<HTMLElement>(".wr-mockup img");
          if (img)
            gsap.fromTo(
              img,
              { yPercent: -6 },
              {
                yPercent: 6,
                ease: "none",
                scrollTrigger: { trigger: rowEl, start: "top bottom", end: "bottom top", scrub: 1 },
              }
            );
        });

      // ФИНАЛ: последний кейс уходит ВГЛУБЬ (scale↓ + наклон в 3D) со светящейся
      // рамкой — как в референсе. Дальше короткая чёрная пауза → блок «Боль».
      if (!reduce) {
        const last = rows[rows.length - 1];
        const mock = last?.querySelector<HTMLElement>(".wr-mockup");
        if (mock) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".works-tail",
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6,
            },
          });
          tl.to(last, { "--glow": 1, ease: "power1.in", duration: 0.5 } as gsap.TweenVars, 0)
            .to(
              mock,
              { scale: 0.62, rotateX: 14, yPercent: -6, ease: "power1.inOut", duration: 1 },
              0
            )
            .to(last, { autoAlpha: 0, ease: "power2.in", duration: 0.4 }, 0.62);
        }
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

      <div className="works-list">
        {CASES.map((c) => (
          <article className="work-row" key={c.title}>
            <span className="wr-line" aria-hidden />
            <header className="wr-head">
              <span className="wr-num" data-rev>
                {c.n}
              </span>
              <div className="wr-titles">
                <h3 className="wr-title" data-rev>
                  {c.title}
                </h3>
                <div className="wr-tags" data-rev>
                  {c.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <a className="wr-cta" href="#contact" data-magnetic data-rev>
                Хочу так&nbsp;же
              </a>
            </header>

            <div className="wr-body">
              <div className="wr-mockup">
                <span className="wr-chrome" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(c.img)} alt={c.title} loading="lazy" />
              </div>
              <p className="wr-desc" data-rev>
                {c.desc}
              </p>
            </div>
          </article>
        ))}
        {/* хвост: последний кейс уходит вглубь, затем чёрная пауза перед «Болью» */}
        <div className="works-tail" aria-hidden />
      </div>
    </section>
  );
}
