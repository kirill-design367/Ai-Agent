import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

/*
  404 — «точка потерялась» (§3). Не служебка: тот же тёмный тёплый мир, фирменная
  идея развёрнута в текст. Одна точка-момент, дальше — путь назад к началу.
*/
export const metadata = { title: "Страница не найдена — AUREA", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="site theme-dark">
      <SiteHeader />
      <main className="nf" id="content">
        <div className="nf-inner">
          <p className="nf-label">Ошибка 404 · Страница потерялась</p>
          <h1 className="nf-h1">
            Точка<span className="nf-dot" aria-hidden />
            <br />
            потерялась
          </h1>
          <p className="nf-text">
            Страницы, которую вы искали, здесь нет — она не существует или переехала.
            Ничего страшного: из точки всё и разворачивается заново.
          </p>
          <div className="nf-actions">
            <Link href="/" className="pg-btn pg-btn--primary" data-magnetic>
              <span>На главную</span>
            </Link>
            <Link href="/uslugi/" className="pg-btn pg-btn--ghost" data-magnetic>
              Услуги и цены
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
