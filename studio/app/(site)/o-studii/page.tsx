import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd, founderPersonLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import Reveal from "@/components/pg/Reveal";
import TrustBlock from "@/components/pg/TrustBlock";
import RelatedLinks from "@/components/pg/RelatedLinks";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "О студии AUREA — авторская разработка сайтов | AUREA",
  description:
    "AUREA — авторская студия разработки сайтов. Вы работаете напрямую с основателем " +
    "Кириллом Горовым. Модель работы, принципы и подход.",
  path: "/o-studii",
  ogImage: "/og/o-studii.png",
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

      <PageHero
        kicker="О студии"
        h1="Авторская студия AUREA"
        lead={[
          "Вы работаете напрямую с основателем студии. Без менеджеров, длинных цепочек согласований и потери информации. При необходимости к проекту подключаются профильные специалисты — дизайнеры, копирайтеры, фотографы. За итоговый результат отвечаю лично я.",
          "Работаем с клиентами по всей России, удалённо. Студия не привязана к городу — важен результат, а не адрес офиса.",
        ]}
      />

      <section className="pg-steps" style={{ paddingTop: 0 }}>
        <div className="pg-wrap">
          <h2 className="pg-h2">Принципы</h2>
          <div className="pg-trust-grid">
            {PRINCIPLES.map((p, i) => (
              <Reveal className="pg-trust-card" key={i} delay={i * 40}>
                <h3 className="pg-h3">{p.t}</h3>
                <p>{p.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TrustBlock heading="Что это даёт вам" />

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
