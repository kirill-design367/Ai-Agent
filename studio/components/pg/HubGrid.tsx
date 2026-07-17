import Link from "next/link";
import Image from "next/image";
import Reveal from "./Reveal";

export type HubCard = {
  href: string;
  kicker?: string;
  title: string;
  desc?: string;
  meta?: string[];
  cover?: string;
};

/*
  Сетка карточек для хабов (услуги/ниши/кейсы/блог). Обложка через next/image
  (priority только на первых — задаём в шаблоне при желании).
*/
export default function HubGrid({ cards }: { cards: HubCard[] }) {
  return (
    <div className="pg-hub-grid">
      {cards.map((c, i) => (
        <Reveal key={c.href} delay={(i % 3) * 60}>
          <Link href={c.href} className="pg-hub-card" data-magnetic>
            {c.cover && (
              <div className="pg-hub-cover">
                <Image src={c.cover} alt="" width={480} height={300} />
              </div>
            )}
            <div className="pg-hub-card-body">
              {c.kicker && <span className="pg-hub-kicker">{c.kicker}</span>}
              <span className="pg-hub-title">{c.title}</span>
              {c.desc && <span className="pg-hub-desc">{c.desc}</span>}
              {c.meta && c.meta.length > 0 && (
                <span className="pg-hub-meta">
                  {c.meta.map((m, j) => (
                    <span key={j}>{m}</span>
                  ))}
                </span>
              )}
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
