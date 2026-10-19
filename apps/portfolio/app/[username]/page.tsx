// 個人トップ（/[ユーザー名]）：ヒーロー（名前・顔写真・コメント）→ スクロールでエッセイ題名一覧

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { cloudinaryAvatar } from "@portfolio/shared";
import { EssayList } from "@/components/EssayList";
import { Hero } from "@/components/Hero";
import { getProfile, getPublishedEssays } from "@/lib/data";

export const revalidate = 30;

// 空の配列を返すと「アクセスされたときに作って、以後はキャッシュする」動きになる（ISR）
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return {};
  return {
    title: profile.name,
    description: profile.comment || undefined,
    openGraph: {
      title: profile.name,
      description: profile.comment || undefined,
      images: profile.avatarUrl ? [cloudinaryAvatar(profile.avatarUrl, 600)] : undefined,
    },
  };
}

export default async function UserTopPage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();

  const [essays, t] = await Promise.all([
    getPublishedEssays(profile.uid),
    getTranslations({ locale: profile.locale, namespace: "portfolio" }),
  ]);

  return (
    <>
      <Hero
        preset={profile.theme.preset}
        name={profile.name}
        comment={profile.comment}
        avatarUrl={profile.avatarUrl}
        scrollLabel={t("scroll")}
      />
      <EssayList
        preset={profile.theme.preset}
        username={profile.username}
        locale={profile.locale}
        heading={t("essays")}
        emptyLabel={t("noEssays")}
        essays={essays}
      />
    </>
  );
}
