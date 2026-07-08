import Link from "next/link";
import { LEGAL_DOCS } from "@/lib/legalDocs";

/*
  Единый макет юридических страниц (152-ФЗ): чистая читаемая типографика,
  светлая тема, ссылка «назад на сайт». Контент берётся из lib/legalDocs.ts
  (автогенерация из .docx клиента).
*/
export default function LegalPage({ slug }: { slug: string }) {
  const blocks = LEGAL_DOCS[slug] ?? [];
  const title = blocks.find((b) => b.t === "h1")?.x ?? "Документ";

  return (
    <main className="legal">
      <div className="legal-wrap">
        <Link href="/" className="legal-back">
          ← На главную
        </Link>
        <article className="legal-doc">
          {blocks.map((b, i) => {
            if (b.t === "h1") return <h1 key={i}>{b.x}</h1>;
            if (b.t === "h2") return <h2 key={i}>{b.x}</h2>;
            return <p key={i}>{b.x}</p>;
          })}
        </article>
        <footer className="legal-foot">
          <Link href="/">AUREA</Link>
          <span>ИП Горовой Кирилл Николаевич · aureadesign.ru</span>
        </footer>
      </div>
    </main>
  );
}

export const LEGAL_TITLES: Record<string, string> = {
  policy: "Политика конфиденциальности",
  pd: "Политика обработки персональных данных",
  consent: "Согласие на обработку персональных данных",
  offer: "Публичная оферта",
};
