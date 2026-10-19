// エッセイ詳細（/[ユーザー名]/essays/[slug]）：題名、公開日、本文、前後のエッセイ・トップへ戻る導線

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatDate } from "@portfolio/shared";
import { EssayBody, extractPlainText } from "@portfolio/ui";
import { getEssay, getProfile, type EssaySummary } from "@/lib/data";

export const revalidate = 30;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ username: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const profile = await getProfile(username);
  const result = profile ? await getEssay(profile.uid, slug) : null;
  if (!profile || !result) return {};
  const description = extractPlainText(result.essay.body) || undefined;
  // OGP 画像は同じフォルダの opengraph-image.tsx が自動で設定される
  return {
    title: `${result.essay.title} | ${profile.name}`,
    description,
    openGraph: { type: "article", title: result.essay.title, description },
    twitter: { card: "summary_large_image", title: result.essay.title, description },
  };
}

export default async function EssayPage({ params }: Props) {
  const { username, slug } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();
  const result = await getEssay(profile.uid, slug);
  if (!result) notFound();

  const { essay, previous, next } = result;
  const t = await getTranslations({ locale: profile.locale, namespace: "portfolio" });

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:pt-16">
      <Link href={`/${profile.username}`} className="text-sm text-theme-muted no-underline hover:text-theme-accent">
        ← {profile.name}
      </Link>

      <article className="mt-12">
        <header className="mb-12">
          <time dateTime={new Date(essay.publishedAt).toISOString()} className="text-sm text-theme-muted">
            {formatDate(essay.publishedAt, profile.locale)}
          </time>
          <h1 className="mt-3 font-heading text-[clamp(1.9rem,6vw,3rem)] font-bold leading-snug">{essay.title}</h1>
        </header>
        <EssayBody body={essay.body} />
      </article>

      <nav aria-label={t("essays")} className="mt-20 grid gap-4 border-t border-theme-border pt-10 sm:grid-cols-2">
        <NeighborLink username={profile.username} essay={previous} label={t("previous")} align="left" />
        <NeighborLink username={profile.username} essay={next} label={t("next")} align="right" />
      </nav>
      <div className="mt-12 text-center">
        <Link
          href={`/${profile.username}#essays`}
          className="inline-block rounded-theme bg-theme-accent px-6 py-3 text-sm font-medium text-theme-on-accent no-underline"
        >
          {t("backToTop")}
        </Link>
      </div>
    </main>
  );
}

function NeighborLink({
  username,
  essay,
  label,
  align,
}: {
  username: string;
  essay: EssaySummary | null;
  label: string;
  align: "left" | "right";
}) {
  if (!essay) return <span />;
  return (
    <Link
      href={`/${username}/essays/${essay.slug}`}
      className={`block rounded-theme border border-theme-border bg-theme-surface p-5 no-underline transition-colors hover:border-theme-accent ${align === "right" ? "sm:text-right" : ""}`}
    >
      <span className="text-xs text-theme-muted">
        {align === "left" ? `← ${label}` : `${label} →`}
      </span>
      <span className="mt-1 block font-heading">{essay.title}</span>
    </Link>
  );
}
