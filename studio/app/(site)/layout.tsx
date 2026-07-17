import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import MessengerFab from "@/components/kit/MessengerFab";
import MagneticTargets from "@/components/kit/MagneticTargets";

/*
  КАРКАС ВНУТРЕННИХ СТРАНИЦ (route group «site»). Общая шапка/подвал, тёмная тема,
  плавающая кнопка мессенджера (CRO). БЕЗ кинематографического кита главной
  (прелоадер, WebGL, пиннинг) — внутренние страницы лёгкие и серверные (§10).
*/
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site theme-dark">
      <SiteHeader />
      <MagneticTargets />
      <main id="content" className="site-main">
        {children}
      </main>
      <SiteFooter />
      <MessengerFab />
    </div>
  );
}
