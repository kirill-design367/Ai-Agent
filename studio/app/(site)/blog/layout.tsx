import BlogTransition from "@/components/kit/BlogTransition";

/*
  Каркас блога. Оборачивает контент в #bh-stage — сцену для перехода
  «чёрная дыра» (реф blackhole-blog). Сам эффект — только десктоп/блог
  (BlogTransition), мобайл/reduce-motion получают обычный переход.
*/
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogTransition />
      <div id="bh-stage">{children}</div>
    </>
  );
}
