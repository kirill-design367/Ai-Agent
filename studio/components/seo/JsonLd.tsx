import { ldJson } from "@/lib/seo/jsonld";

/*
  Печатает один или несколько блоков JSON-LD в <script type="application/ld+json">.
  Серверный компонент — разметка попадает в первичный HTML (важно для Яндекса).
*/
export default function JsonLd({ data }: { data: (Record<string, unknown> | null)[] }) {
  const json = ldJson(...data);
  if (json === "[]") return null;
  return (
    <script
      type="application/ld+json"
      // ldJson уже экранирует '<' — защита от инъекции разметки
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
