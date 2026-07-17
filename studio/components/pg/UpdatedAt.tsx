import { formatDate } from "@/lib/format";

/*
  Видимое «Обновлено: {dateModified}» (§6.8) — на статьях, кейсах, нишах.
  <time> с машиночитаемым datetime.
*/
export default function UpdatedAt({ iso, author }: { iso: string; author?: string }) {
  return (
    <p className="pg-updated">
      {author && <span className="pg-updated-author">{author}</span>}
      <span>
        Обновлено: <time dateTime={iso}>{formatDate(iso)}</time>
      </span>
    </p>
  );
}
