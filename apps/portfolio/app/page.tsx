// サイトトップ（/）：サービス紹介と、編集サイトへの登録リンク（個人の一覧は出さない）

import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { DEFAULT_THEME, localeFromAcceptLanguage } from "@portfolio/shared";
import { ThemeFonts, ThemeScope } from "@portfolio/ui";
import { Backdrop } from "@/components/Backdrop";

const editorUrl = process.env.NEXT_PUBLIC_EDITOR_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  title: "Essay Portfolio",
  description: "エッセイを、あなたらしいデザインで公開できるポートフォリオ。",
};

export default async function SiteTopPage() {
  const locale = localeFromAcceptLanguage((await headers()).get("accept-language"));
  const t = await getTranslations({ locale, namespace: "portfolio" });
  const features = [1, 2, 3] as const;

  return (
    <ThemeScope theme={DEFAULT_THEME} lang={locale} className="relative isolate min-h-dvh overflow-x-clip">
      <ThemeFonts presets={[DEFAULT_THEME.preset]} />
      <Backdrop pattern="brush" />
      <main className="rise relative mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-6 py-24">
        <p className="text-sm tracking-[0.3em] text-theme-muted">{t("siteTitle").toUpperCase()}</p>
        <h1 className="mt-6 font-heading text-[clamp(2.2rem,7vw,4.5rem)] font-bold leading-tight">
          {t("siteTagline")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-theme-muted">{t("siteDescription")}</p>
        <div className="mt-10">
          <a
            href={`${editorUrl}/signup`}
            className="inline-block rounded-theme bg-theme-accent px-8 py-4 font-medium text-theme-on-accent no-underline"
          >
            {t("startCta")} →
          </a>
        </div>
        <ul className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((n) => (
            <li key={n} className="rounded-theme border border-theme-border bg-theme-surface p-6">
              <h2 className="font-heading text-lg font-bold">{t(`siteFeature${n}Title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-theme-muted">{t(`siteFeature${n}Body`)}</p>
            </li>
          ))}
        </ul>
      </main>
    </ThemeScope>
  );
}
