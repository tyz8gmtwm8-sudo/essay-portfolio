"use client";

// ダッシュボード（/）：自分のポートフォリオURLと、エッセイの一覧（下書き・公開の状態つき）

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { LIMITS } from "@portfolio/shared";
import { CopyButton } from "@/components/CopyButton";
import { Card, PageTitle, Spinner, buttonClass } from "@/components/ui";
import { useSignedIn } from "@/lib/auth";
import { useMyEssays } from "@/lib/essays";

const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3000";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user, profile } = useSignedIn();
  const essays = useMyEssays(user.uid);
  const myUrl = `${portfolioUrl}/${profile.username}`;
  const reachedLimit = profile.essayCount >= LIMITS.essaysPerUser;

  return (
    <>
      <PageTitle description={t("description")}>{t("title")}</PageTitle>

      <Card className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-sub">{t("yourUrl")}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={myUrl}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 break-all rounded-lg bg-paper px-3 py-2 font-mono text-sm hover:text-brand"
          >
            {myUrl}
          </a>
          <CopyButton text={myUrl} />
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          {t("essays")}{" "}
          <span className="text-sm font-normal text-sub">
            {profile.essayCount} / {LIMITS.essaysPerUser}
          </span>
        </h2>
        {reachedLimit ? (
          <span className="text-sm text-warn">{t("limitReached")}</span>
        ) : (
          <Link href="/essays/new" className={buttonClass("primary")}>
            ＋ {t("newEssay")}
          </Link>
        )}
      </div>

      {essays === null ? (
        <Spinner label={tCommon("loading")} />
      ) : essays.length === 0 ? (
        <Card className="text-center">
          <p className="text-sub">{t("empty")}</p>
        </Card>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {essays.map((essay) => (
            <li key={essay.id}>
              <Link
                href={`/essays/${essay.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper"
              >
                <span
                  className={
                    essay.status === "published"
                      ? "shrink-0 rounded-full bg-ok-soft px-2.5 py-0.5 text-xs font-medium text-ok"
                      : "shrink-0 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-sub"
                  }
                >
                  {essay.status === "published" ? t("published") : t("draft")}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{essay.title}</span>
                <span className="hidden shrink-0 text-xs text-sub sm:inline">
                  {essay.publishedAt
                    ? t("publishedOn", { date: format.dateTime(essay.publishedAt, { dateStyle: "medium" }) })
                    : essay.updatedAt
                      ? t("updatedOn", { date: format.dateTime(essay.updatedAt, { dateStyle: "medium" }) })
                      : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
