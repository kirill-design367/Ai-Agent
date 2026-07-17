"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isHeavyCapable } from "@/lib/deviceTier";

// Кинематографическая версия грузится ТОЛЬКО на способном устройстве (ssr:false).
const HomeCinematic = dynamic(() => import("./HomeCinematic"), { ssr: false });

/*
  ПЕРЕКЛЮЧАТЕЛЬ ТИРА ГЛАВНОЙ. SSR и первый клиентский рендер — лёгкая главная
  (children = HomeLite): быстрый LCP, весь контент в HTML. На способном desktop
  после гидратации подменяем на кинематографическую версию — она начинается тем же
  героем (§2) и её прелоадер перекрывает подмену, поэтому мигания нет. Мобильные
  кинематографический код не грузят вовсе.
*/
export default function HomeUpgrade({ children }: { children: React.ReactNode }) {
  const [heavy, setHeavy] = useState(false);
  useEffect(() => {
    if (isHeavyCapable()) setHeavy(true);
  }, []);
  return heavy ? <HomeCinematic /> : <>{children}</>;
}
