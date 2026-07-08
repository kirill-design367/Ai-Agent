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

      // ЛЕНТА «ПОРТФОЛИО» — постоянный медленный дрейф (CSS-анимация worksticker,
      // не привязан к скроллу): плывёт всегда, ровно и на GPU. См. globals.css.

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
            // выше scrub → сильнее сглаживание шагов скролла: уход маслянистый
            scrub: 0.9,
          },
        });
        tl.to(card, { scale: 0.62, yPercent: -3, ease: "power1.in", duration: 1 }, 0)
          // тень до полного чёрного — накрытый кейс не «призрачит» за следующим
          .to(shade, { opacity: 1, ease: "none", duration: 1 }, 0)
          .to(card, { autoAlpha: 0, ease: "power1.in", duration: 0.4 }, 0.6);
      });

      // ФИНАЛ (как в референс-видео): последний кейс уходит в глубину со
      // светящейся градиентной рамкой (анимируем ТОЛЬКО opacity рамки — тень
      // статичная, без пересчёта каждый кадр → плавно), описание внизу уезжает
      // вдогонку. Затем чёрная пауза → «Боль».
      const last = cards[cards.length - 1];
      const descs = gsap.utils.toArray<HTMLElement>(".wd-item");
      if (last) {
        const shade = last.querySelector(".work-shade");
        const glow = last.querySelector(".work-glow");
        const lastDesc = descs[descs.length - 1];
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".works-tail",
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.9,
          },
        });
        // СНАЧАЛА уезжает вглубь тем же темпом, что и остальные (scale по всему
        // ходу, картинка при этом ВИДНА — тень копится постепенно), и ТОЛЬКО в
        // самом конце растворяется. Раньше на коротком хвосте тень чернила
        // картинку рано, и кейс «схлопывался» до ухода вдаль.
        tl.to(glow, { opacity: 1, ease: "power1.in", duration: 0.55 }, 0)
          .to(last, { scale: 0.62, yPercent: -3, ease: "power1.in", duration: 1 }, 0)
          // тень начинает копиться позже (с 35%) → картинка дольше читается, пока едет вдаль
          .to(shade, { opacity: 1, ease: "none", duration: 0.65 }, 0.35)
          // исчезает В КОНЦЕ, уже уехав вглубь
          .to(last, { autoAlpha: 0, ease: "power1.in", duration: 0.25 }, 0.78);
        // описание уходит вместе с кейсом — в самом конце
        if (lastDesc)
          tl.to(
            lastDesc,
            { autoAlpha: 0, y: -30, scale: 0.9, ease: "power1.in", duration: 0.25 },
            0.78
          );
      }

      // ОПИСАНИЯ ВНИЗУ: sticky-подпись; при смене кейса старая растворяется,
      // новая плавно проявляется (кроссфейд, только opacity/transform).
      // Для ПОСЛЕДНЕЙ подписи выход делает скраб-таймлайн выше («вдогонку» за
      // кейсом), поэтому её toggle не гасит — только показывает.
      if (descs.length === cards.length) {
        gsap.set(descs, { autoAlpha: 0, y: 14 });
        cards.forEach((card, i) => {
          const isLast = i === cards.length - 1;
          ScrollTrigger.create({
            trigger: card,
            start: "top 72%",
            endTrigger: isLast ? ".works-tail" : cards[i + 1],
            end: isLast ? "bottom top" : "top 72%",
            onToggle: (self) => {
              // выход последней подписи ВПЕРЁД (в хвост) делает скраб-таймлайн;
              // и ВОЗВРАТ снизу — тоже он (подпись приходит вместе с кейсом,
              // а не мгновенно при пересечении границы)
              if (isLast && !self.isActive && self.progress === 1) return;
              if (isLast && self.isActive && self.direction === -1) return;
              gsap.to(descs[i], {
                autoAlpha: self.isActive ? 1 : 0,
                y: self.isActive ? 0 : 14,
                duration: 0.5,
                ease: "power2.out",
                // не убивать скраб-твин «вдогонку» у последней подписи
                overwrite: isLast ? false : true,
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
