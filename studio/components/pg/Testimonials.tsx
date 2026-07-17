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
// Реальные отзывы (Ф4). ПОКА НЕ ПУБЛИКУЮТСЯ — FLAGS.showTestimonials=false.
// TODO(владелец: сверить формулировки и подписи, подтвердить разрешение на
// публикацию, затем FLAGS.showTestimonials=true). Тексты — по присланным
// скриншотам/сути; при желании отредактировать.
const REVIEWS: { text: string; author: string; role?: string }[] = [
  {
    text:
      "Сделали сайт за два дня, подключили рекламу в Avito ADS — заявки идут " +
      "каждый день. Спасибо огромное, ты лучший!",
    author: "Предприниматель",
    role: "лендинг + Avito ADS",
  },
  {
    text:
      "Искренне рада, что всё получилось — до этого был очень горький опыт с " +
      "сайтом. Встроенный календарь записей и Telegram-бот с уведомлениями " +
      "работают отлично.",
    author: "Ульяна",
    role: "салон красоты",
  },
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
