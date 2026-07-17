import { MDXRemote } from "next-mdx-remote/rsc";
import Reveal from "./Reveal";

/*
  PROSE — рендер свободного тела MDX (доп. глубина для SEO/AI, §7.6). Строки-маркеры
  TODO(владелец:…) вырезаются — посетитель их не видит; факт правит владелец в .mdx.
  Если после очистки текста не осталось — не рендерим ничего.
*/
export default function Prose({ body, heading }: { body: string; heading?: string }) {
  const clean = body
    .split("\n")
    .filter((l) => !l.includes("TODO(владелец"))
    .join("\n")
    .trim();
  if (!clean) return null;

  return (
    <section className="pg-prose-sec">
      <div className="pg-wrap">
        {heading && <h2 className="pg-h2">{heading}</h2>}
        <Reveal className="pg-prose">
          <MDXRemote source={clean} />
        </Reveal>
      </div>
    </section>
  );
}
