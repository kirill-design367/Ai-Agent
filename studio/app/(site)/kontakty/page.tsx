import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import Contact from "@/components/sections/Contact";

export const metadata: Metadata = buildMetadata({
  title: "Контакты — обсудить проект с AUREA | AUREA",
  description:
    "Расскажите про бизнес и задачу — отвечу лично, обычно в течение пары часов. " +
    "Telegram, WhatsApp, почта. Форма заявки с уведомлением в Telegram.",
  path: "/kontakty",
  ogImage: "/og/kontakty.png",
});

export default function Kontakty() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Контакты", path: "/kontakty/" },
  ];
  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <Contact />
    </>
  );
}
