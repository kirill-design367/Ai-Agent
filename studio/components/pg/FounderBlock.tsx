import Link from "next/link";
import { SITE } from "@/lib/seo/site";

/*
  FOUNDER BLOCK (§2.3) — доверие через основателя. БЕЗ фотографии: типографический
  монограмм-аватар в фирменном стиле. Имя, роль, 2–3 строки, ссылка на /o-studii/.
*/
export default function FounderBlock() {
  return (
    <section className="pg-founder">
      <div className="pg-wrap pg-founder-in">
        <span className="pg-monogram" aria-hidden>
          <svg viewBox="0 0 22 26">
            <path d="M11 2 L20 24 L16.3 24 L11 10 L5.7 24 L2 24 Z" fill="currentColor" />
            <circle cx="11" cy="19.2" r="2" fill="currentColor" />
          </svg>
        </span>
        <div className="pg-founder-body">
          <p className="pg-founder-name">{SITE.founder.name}</p>
          <p className="pg-founder-role">{SITE.founder.role}</p>
          <p className="pg-founder-text">
            Вы работаете напрямую с&nbsp;основателем студии. Без менеджеров, длинных
            цепочек согласований и&nbsp;потери информации. За&nbsp;итоговый результат
            отвечаю лично я.
          </p>
          <Link href="/o-studii/" className="pg-link-arrow" data-magnetic>
            О студии и подходе <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
