import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppGate } from "@/components/Gate";

// ログイン後の画面（ダッシュボード・プロフィールなど）に共通のレイアウト。
// AppGate が「ログイン・メール確認・初回設定」がすべて済んでいるかを確認します。
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppGate>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
    </AppGate>
  );
}
