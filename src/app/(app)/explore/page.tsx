import { BoardCards } from "@/components/explore/BoardCards";
import { UI_STRINGS } from "@/lib/config";

const t = UI_STRINGS.path;

export default function ExplorePage() {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 p-4 sm:p-6 lg:max-w-5xl lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold">🧭 {t.exploreTitle}</h1>
        <p className="text-lg text-muted">{t.exploreHint}</p>
      </header>
      <BoardCards />
    </section>
  );
}
