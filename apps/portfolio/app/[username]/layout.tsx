// ユーザーごとのページ（/[ユーザー名] 以下）に共通のレイアウト。
// そのユーザーが選んだテーマ（色・フォント・背景）で全体を包みます。

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { THEME_PRESETS } from "@portfolio/shared";
import { ThemeFonts, ThemeScope } from "@portfolio/ui";
import { Backdrop } from "@/components/Backdrop";
import { PortfolioProvider } from "@/components/PortfolioContext";
import { getProfile } from "@/lib/data";

// 30秒ごとにデータを読み直す（編集サイトで保存した内容が1分以内に反映される）
export const revalidate = 30;

export default async function UserLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();

  const t = await getTranslations({ locale: profile.locale, namespace: "portfolio" });

  return (
    <ThemeScope theme={profile.theme} lang={profile.locale} className="relative isolate min-h-dvh overflow-x-clip">
      <ThemeFonts presets={[profile.theme.preset]} />
      <Backdrop pattern={THEME_PRESETS[profile.theme.preset].pattern} />
      <PortfolioProvider
        value={{
          username: profile.username,
          strings: { notFoundTitle: t("notFoundTitle"), notFoundBody: t("notFoundBody"), goHome: t("goHome") },
        }}
      >
        <div className="relative">{children}</div>
      </PortfolioProvider>
    </ThemeScope>
  );
}
