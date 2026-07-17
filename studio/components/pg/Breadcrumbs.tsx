import Link from "next/link";

/*
  Видимые хлебные крошки (§6.5). JSON-LD BreadcrumbList печатается отдельно на
  странице теми же элементами. Последний элемент — текущая страница (без ссылки).
*/
export default function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <nav className="pg-crumbs" aria-label="Хлебные крошки">
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.path}>
              {last ? (
                <span aria-current="page">{it.name}</span>
              ) : (
                <Link href={it.path}>{it.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
