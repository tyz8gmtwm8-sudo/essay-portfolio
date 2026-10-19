import type { ReactNode } from "react";

// ログイン・新規登録などの画面に共通の、中央寄せのレイアウト
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center text-sm font-semibold tracking-[0.2em] text-sub">ESSAY PORTFOLIO</p>
        {children}
      </div>
    </main>
  );
}
