import Reveal from "./Reveal";
import { FLAGS } from "@/lib/flags";

/*
  ОТЗЫВЫ — только реальные подтверждаемые (Ф4). Секция СКРЫТА флагом
  FLAGS.showTestimonials до разрешения авторов на публикацию и подписи.
  Контент берётся из присланных скриншотов реальных отзывов; старые (с лендинга)
  НЕ переносим.

  TODO(владелец: перенести текст реальных отзывов со скриншотов Ф4 сюда, добавить
  подпись (имя/проект) и получить разрешение автора; затем FLAGS.showTestimonials=true)
*/
const REVIEWS: { text: string; author: string; role?: string }[] = [
  // Пример структуры (не публикуется — флаг выключен):
  // { text: "…текст реального отзыва…", author: "Имя", role: "проект/город" },
];

export default function Testimonials() {
  if (!FLAGS.showTestimonials || REVIEWS.length === 0) return null;
  return (
    <section className="pg-tst" aria-labelledby="tst-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="tst-h">
          Что говорят клиенты
        </h2>
        <div className="pg-tst-grid">
          {REVIEWS.map((r, i) => (
            <Reveal className="pg-tst-card" key={i} delay={i * 50}>
              <blockquote>{r.text}</blockquote>
              <p className="pg-tst-author">
                {r.author}
                {r.role && <span>{r.role}</span>}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
