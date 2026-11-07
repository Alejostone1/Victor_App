import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardView } from "@/components/explore/BoardView";
import { UI_STRINGS } from "@/lib/config";
import { BOARDS, getBoard } from "@/lib/content/boards";

export function generateStaticParams() {
  return BOARDS.map((board) => ({ board: board.id }));
}

export default function BoardPage({ params }: PageProps<"/explore/[board]">) {
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 sm:p-6 lg:max-w-6xl lg:p-8">
      <Link href="/explore" className="self-start text-lg font-bold text-primary">
        ← {UI_STRINGS.nav.explore}
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-border" />}>
        <BoardContent params={params} />
      </Suspense>
    </section>
  );
}

async function BoardContent({ params }: { params: PageProps<"/explore/[board]">["params"] }) {
  const { board: id } = await params;
  const board = getBoard(id);
  if (!board) notFound();

  return (
    <>
      <header className="flex items-center gap-4 rounded-3xl p-5 text-white" style={{ backgroundColor: board.color }}>
        <span className="text-5xl" aria-hidden="true">
          {board.icon}
        </span>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">{board.title}</h1>
          <p lang="en" className="opacity-85">
            {board.titleEn}
          </p>
        </div>
      </header>
      <BoardView board={board} />
    </>
  );
}
