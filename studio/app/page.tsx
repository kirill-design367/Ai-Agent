import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HomeLite from "@/components/home/HomeLite";
import HomeUpgrade from "@/components/home/HomeUpgrade";

/*
  ГЛАВНАЯ — расслоена по тиру устройства (§1).
  SSR отдаёт лёгкую главную (HomeLite): весь контент и голос §2 в первичном HTML,
  быстрый LCP/низкий TBT на мобильных. На способном desktop HomeUpgrade подменяет
  её на кинематографическую версию после гидратации (ниже первого экрана — без
  мигания). Шапка/подвал — общие, вне переключателя.
*/
export default function Home() {
  return (
    <>
      <div className="theme-dark">
        <SiteHeader />
      </div>

      <HomeUpgrade>
        <HomeLite />
      </HomeUpgrade>

      <div className="theme-dark">
        <SiteFooter />
      </div>
    </>
  );
}
