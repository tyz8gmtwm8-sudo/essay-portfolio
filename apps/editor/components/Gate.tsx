"use client";

// ページの「門番」。ログイン状態を見て、表示してよい人か判断し、だめなら適切な画面へ移動させる。
//   AppGate        … ダッシュボードなど（ログイン＋メール確認＋初回設定済みが必要）
//   OnboardingGate … 初回設定画面（ログイン＋メール確認済み、初回設定はまだ）
//   GuestGate      … ログイン・新規登録画面（ログイン済みならダッシュボードへ）

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Spinner } from "./ui";

type Destination = "/login" | "/verify-email" | "/onboarding" | "/" | null;

/** 今の状態なら、どこにいるべきか */
function useDestination(): { ready: boolean; destination: Destination } {
  const { loading, user, emailVerified, profile, profileLoading } = useAuth();
  if (loading) return { ready: false, destination: null };
  if (!user) return { ready: true, destination: "/login" };
  if (!emailVerified) return { ready: true, destination: "/verify-email" };
  if (profileLoading) return { ready: false, destination: null };
  if (!profile) return { ready: true, destination: "/onboarding" };
  return { ready: true, destination: "/" };
}

function Redirecting({ to }: { to: Destination }) {
  const router = useRouter();
  const t = useTranslations("common");
  useEffect(() => {
    if (to) router.replace(to);
  }, [to, router]);
  return <Spinner label={t("loading")} />;
}

export function AppGate({ children }: { children: ReactNode }) {
  const { ready, destination } = useDestination();
  if (!ready) return <Redirecting to={null} />;
  if (destination !== "/") return <Redirecting to={destination} />;
  return <>{children}</>;
}

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { ready, destination } = useDestination();
  if (!ready) return <Redirecting to={null} />;
  if (destination !== "/onboarding") return <Redirecting to={destination} />;
  return <>{children}</>;
}

export function VerifyEmailGate({ children }: { children: ReactNode }) {
  const { ready, destination } = useDestination();
  if (!ready) return <Redirecting to={null} />;
  if (destination !== "/verify-email") return <Redirecting to={destination} />;
  return <>{children}</>;
}

export function GuestGate({ children }: { children: ReactNode }) {
  const { ready, destination } = useDestination();
  if (!ready) return <Redirecting to={null} />;
  if (destination !== "/login") return <Redirecting to={destination} />;
  return <>{children}</>;
}
