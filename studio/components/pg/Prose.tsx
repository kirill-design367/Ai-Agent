import { MDXRemote } from "next-mdx-remote/rsc";
import Reveal from "./Reveal";

/*
  PROSE — рендер свободного тела MDX (доп. глубина для SEO/AI, §7.6). Это ЗАЩИТА
  на рендере: любой абзац с маркером-инструкцией (TODO/FIXME) выкидывается целиком —
  по абзацам, а не по строкам, чтобы многострочная инструкция не «протекала»
  хвостом (баг с висящей скобкой). Основную защиту даёт prebuild-guard
  (scripts/check-content-leaks.mjs) — до посетителя такой текст не доходит вовсе.
  Если после очистки текста не осталось — не рендерим ничего.
*/
export default function Prose({ body, heading }: { body: string; heading?: string }) {
  const clean = body
    .split(/\n{2,}/) // по абзацам
    .filter((p) => !/\b(TODO|FIXME)\b/i.test(p))
    .join("\n\n")
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
