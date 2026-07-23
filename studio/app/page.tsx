import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HomeLite from "@/components/home/HomeLite";
import { buildMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = buildMetadata({
  title: "Разработка сайтов под ключ для бизнеса — студия AUREA",
  description:
    "Авторская студия AUREA: современные сайты для бизнеса на чистом коде. " +
    "Личная ответственность за каждый проект, пожизненная гарантия.",
  path: "/",
});

/*
  ГЛАВНАЯ — ОДНА премиальная база (HomeLite) для всех устройств: весь контент и
  голос §2 в первичном HTML (быстрый LCP, серверный рендер для Яндекса). Движение,
  прелоадер-бренд-момент и переходы — надстройка (SiteMotion/PageTransition в
  layout, Preloader — только здесь). Никакого отдельного макета: motion/WebGL
  усиливают ту же структуру.
*/
export default function Home() {
  return (
    <>
      <SiteHeader />
      <HomeLite />
      <SiteFooter />
    </>
  );
}
