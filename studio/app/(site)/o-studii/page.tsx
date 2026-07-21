import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd, founderPersonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import TrustBlock from "@/components/pg/TrustBlock";
import RelatedLinks from "@/components/pg/RelatedLinks";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "О студии AUREA — авторская разработка сайтов | AUREA",
  description:
    "AUREA — авторская студия разработки сайтов. Вы работаете напрямую с основателем " +
    "Кириллом Горовым. Модель работы, принципы и подход.",
  path: "/o-studii",
});

// Принципы студии. TODO(владелец: факт-чек формулировок; при желании — год начала
// практики / число проектов для усиления E-E-A-T, без невыполнимых обещаний).
const PRINCIPLES = [
  {
    t: "Один отвечает за всё",
    d: "От первого экрана до запуска сайт ведёт один человек. Некому свалить ошибку и не на кого сослаться — за результат отвечаю лично.",
  },
  {
    t: "Чистый код, а не конструктор",
    d: "Никаких шаблонов Tilda и WordPress. Это даёт скорость, свободу в анимациях и сайт, который целиком принадлежит вам.",
  },
  {
    t: "Честные сроки и цены",
    d: "Называю цифру, выполнимую в худшем реалистичном случае, а каждую цену сопровождаю расшифровкой. Обещать невыполнимое — вредить и себе, и клиенту.",
  },
  {
    t: "Сайт как инструмент, а не картинка",
    d: "Красиво — необходимое условие, но не цель. Цель — чтобы сайт помогал привлекать клиентов и продавал.",
  },
];

export default function OStudii() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "О студии", path: "/o-studii/" },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), founderPersonLd()]} />
      <Breadcrumbs items={crumbs} />

      {/* МАНИФЕСТ (реф Lees): гигант-буквы + текст-манифест композицией вокруг */}
      <section className="mf">
        <span className="mf-giant" aria-hidden>AUREA</span>
        <div className="pg-wrap">
          <div className="mf-grid">
            <div className="mf-point mf-p-a">
              <h1 className="mf-h1">Авторская студия AUREA</h1>
              <p>Вы работаете напрямую с&nbsp;основателем студии. Без менеджеров, длинных цепочек согласований и&nbsp;потери информации. При необходимости к&nbsp;проекту подключаются профильные специалисты — дизайнеры, копирайтеры, фотографы. За&nbsp;итоговый результат отвечаю лично я.</p>
            </div>
            <div className="mf-point mf-p-b">
              <p>Я&nbsp;— основатель и&nbsp;главный разработчик. Работаем с&nbsp;клиентами по&nbsp;всей России, удалённо. Студия не&nbsp;привязана к&nbsp;городу — важен результат, а&nbsp;не&nbsp;адрес офиса.</p>
            </div>
            {PRINCIPLES.map((p, i) => (
              <div className={`mf-point mf-p-${["c","d","e","d"][i]}`} key={i}>
                <span className="mf-point-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="invert">
        <TrustBlock heading="Что это даёт вам" />
      </div>

      <RelatedLinks
        heading="Дальше"
        items={[
          { href: "/uslugi/", label: "Услуги", note: "форматы и цены" },
          { href: "/keisy/", label: "Кейсы", note: "работы студии" },
          { href: "/kontakty/", label: "Контакты", note: "обсудить проект" },
        ]}
      />
      <Cta title="Расскажите о вашем проекте" />
    </>
  );
}
