import Link from "next/link";
import { SITE } from "@/lib/seo/site";

/*
  CTA-БЛОК (§9) — один основной призыв, вторичные каналы рядом (§9.3).
  Путь до заявки — 1 клик. Ставится в конце коммерческих/нишевых страниц.
*/
export default function Cta({
  title = "Обсудим ваш проект?",
  text = "Расскажите про бизнес и задачу — отвечу лично, обычно в течение пары часов.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="pg-cta">
      <div className="pg-wrap pg-cta-in">
        <h2 className="pg-cta-title">{title}</h2>
        <p className="pg-cta-text">{text}</p>
        <div className="pg-cta-actions">
          <Link href="/kontakty/" className="pill pill--solid" data-magnetic>
            <span>Оставить заявку</span>
          </Link>
          <a href={SITE.contacts.telegram} target="_blank" rel="noopener" className="pill" data-magnetic>
            <span>Написать в Telegram</span>
          </a>
          <a href={SITE.contacts.whatsapp} target="_blank" rel="noopener" className="pill" data-magnetic>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
