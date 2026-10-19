// エッセイの題名一覧（公開日の新しい順）

import Link from "next/link";
import { formatDate, type Locale, type ThemePresetId } from "@portfolio/shared";
import type { EssaySummary } from "@/lib/data";

export interface EssayListProps {
  preset: ThemePresetId;
  username: string;
  locale: Locale;
  heading: string;
  emptyLabel: string;
  essays: EssaySummary[];
}

export function EssayList({ username, locale, heading, emptyLabel, essays }: EssayListProps) {
  return (
    <section id="essays" aria-labelledby="essays-heading" className="mx-auto max-w-3xl px-6 pb-32 pt-16">
      <h2 id="essays-heading" className="mb-10 text-sm tracking-[0.3em] text-theme-muted">
        {heading.toUpperCase()}
      </h2>
      {essays.length === 0 ? (
        <p className="text-theme-muted">{emptyLabel}</p>
      ) : (
        <ol className="space-y-4">
          {essays.map((essay) => (
            <li key={essay.id}>
              <Link
                href={`/${username}/essays/${essay.slug}`}
                className="group block rounded-theme border border-theme-border bg-theme-surface px-6 py-5 no-underline transition-colors hover:border-theme-accent"
              >
                <time dateTime={new Date(essay.publishedAt).toISOString()} className="text-xs text-theme-muted">
                  {formatDate(essay.publishedAt, locale)}
                </time>
                <span className="mt-1 flex items-center justify-between gap-4 font-heading text-xl sm:text-2xl">
                  {essay.title}
                  <span aria-hidden className="text-theme-accent transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
