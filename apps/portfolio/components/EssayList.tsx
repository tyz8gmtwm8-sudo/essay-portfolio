// エッセイの題名一覧（公開日の新しい順）。
// スクロールすると題名が順番に浮かび上がり、カーソルを近づけると題名が引き寄せられる。

import Link from "next/link";
import { formatDate, type Locale, type ThemePresetId } from "@portfolio/shared";
import type { EssaySummary } from "@/lib/data";
import { Magnetic } from "./motion/Magnetic";
import { Reveal } from "./motion/Reveal";

export interface EssayListProps {
  preset: ThemePresetId;
  username: string;
  locale: Locale;
  heading: string;
  emptyLabel: string;
  essays: EssaySummary[];
}

export function EssayList({ preset, username, locale, heading, emptyLabel, essays }: EssayListProps) {
  return (
    <section id="essays" aria-labelledby="essays-heading" className="mx-auto max-w-3xl scroll-mt-8 px-6 pb-32 pt-16">
      <Reveal>
        <h2 id="essays-heading" className="mb-12 flex items-center gap-4 text-sm tracking-[0.3em] text-theme-muted">
          {heading.toUpperCase()}
          <span aria-hidden className="h-px flex-1 bg-theme-border" />
          <span aria-hidden className="tabular-nums">{String(essays.length).padStart(2, "0")}</span>
        </h2>
      </Reveal>
      {essays.length === 0 ? (
        <Reveal>
          <p className="text-theme-muted">{emptyLabel}</p>
        </Reveal>
      ) : (
        <ol className="space-y-5">
          {essays.map((essay, index) => (
            <Reveal
              key={essay.id}
              as="li"
              order={index}
              // モノトーンは左右交互に、それ以外は下から浮かび上がる
              from={preset === "mono" ? (index % 2 === 0 ? "left" : "right") : "below"}
            >
              <Magnetic reach={12} strength={0.35}>
                <Link
                  href={`/${username}/essays/${essay.slug}`}
                  className="essay-card group block rounded-theme border border-theme-border bg-theme-surface px-6 py-6 no-underline sm:px-8"
                >
                  <span className="flex items-baseline gap-4 text-xs text-theme-muted">
                    <span aria-hidden className="tabular-nums text-theme-accent">
                      {String(essays.length - index).padStart(2, "0")}
                    </span>
                    <time dateTime={new Date(essay.publishedAt).toISOString()}>
                      {formatDate(essay.publishedAt, locale)}
                    </time>
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-4 font-heading text-xl leading-snug sm:text-2xl">
                    {essay.title}
                    <span
                      aria-hidden
                      className="shrink-0 text-theme-accent transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Magnetic>
            </Reveal>
          ))}
        </ol>
      )}
    </section>
  );
}
