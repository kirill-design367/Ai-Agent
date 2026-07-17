import Link from "next/link";
import { SITE } from "@/lib/seo/site";

/*
  ПОДВАЛ САЙТА — общий. Прямые каналы связи (§9.3), правовые документы (152-ФЗ),
  реквизиты ИП без города (§2.4), карта навигации. Серверный компонент.
*/
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <div className="site-footer-brand">
          <span className="site-footer-word">AUREA</span>
          <p className="site-footer-tag">
            Авторская студия разработки сайтов. Работаем с клиентами по&nbsp;всей
            России, удалённо.
          </p>
          <p className="site-footer-sign">От точки до&nbsp;шедевра.</p>
        </div>

        <nav className="site-footer-col" aria-label="Разделы">
          <span className="site-footer-h">Разделы</span>
          <Link href="/uslugi/">Услуги</Link>
          <Link href="/dlya-biznesa/">Для бизнеса</Link>
          <Link href="/keisy/">Кейсы</Link>
          <Link href="/blog/">Блог</Link>
          <Link href="/o-studii/">О студии</Link>
          <Link href="/kontakty/">Контакты</Link>
        </nav>

        <nav className="site-footer-col" aria-label="Связь">
          <span className="site-footer-h">Связаться</span>
          <a href={SITE.contacts.telegram} target="_blank" rel="noopener">Telegram</a>
          <a href={SITE.contacts.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
          <a href={`mailto:${SITE.contacts.email}`}>{SITE.contacts.email}</a>
        </nav>

        <nav className="site-footer-col" aria-label="Правовые документы">
          <span className="site-footer-h">Документы</span>
          <Link href="/policy/">Политика конфиденциальности</Link>
          <Link href="/pd/">Обработка ПД</Link>
          <Link href="/offer/">Публичная оферта</Link>
          <Link href="/consent/">Согласие на обработку ПД</Link>
        </nav>
      </div>

      <div className="site-footer-legal">
        <span>
          {SITE.legal.ip} · ИНН&nbsp;{SITE.legal.inn} · ОГРНИП&nbsp;{SITE.legal.ogrnip}
        </span>
        <span>© {new Date().getFullYear()} AUREA</span>
      </div>
    </footer>
  );
}
