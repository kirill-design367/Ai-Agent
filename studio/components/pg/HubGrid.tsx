import Link from "next/link";
import Image from "next/image";

export type HubCard = {
  href: string;
  kicker?: string;
  title: string;
  desc?: string;
  meta?: string[];
  cover?: string;
};

/*
  ИНДЕКС-РАБОТ (эталон OBYS/Locomotive): работы/услуги/ниши поданы редакционным
  списком-строкой (номер · название · категория/город · описание), при hover —
  превью-миниатюра выезжает справа (там, где есть обложка). Появление строк по
  скроллу (SiteMotion наблюдает .idx-row). Замена карточной сетки на индекс.
*/
export default function HubGrid({ cards }: { cards: HubCard[] }) {
  return (
    <ul className="idx">
      {cards.map((c, i) => (
        <li key={c.href}>
          <Link href={c.href} className="idx-row" data-magnetic>
            <span className="idx-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="idx-main">
              <span className="idx-title">{c.title}</span>
              {(c.kicker || (c.meta && c.meta.length > 0)) && (
                <span className="idx-meta">
                  {c.kicker && <span>{c.kicker}</span>}
                  {c.meta?.map((m, j) => (
                    <span key={j}>{m}</span>
                  ))}
                </span>
              )}
              {c.desc && <span className="idx-desc">{c.desc}</span>}
            </span>
            <span className="idx-arrow" aria-hidden>↗</span>
            {c.cover && (
              <span className="idx-media" aria-hidden>
                <Image src={c.cover} alt="" width={360} height={270} />
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
