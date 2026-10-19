"use client";

// ログイン後の画面の上部に出るメニュー
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSignedIn, useAuth } from "@/lib/auth";

const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3000";

const NAV_ITEMS = [
  { href: "/", key: "dashboard" },
  { href: "/profile", key: "profile" },
  { href: "/theme", key: "theme" },
  { href: "/settings", key: "settings" },
] as const;

export function AppHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { logout } = useAuth();
  const { profile } = useSignedIn();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/essays") : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-sm font-bold tracking-[0.15em]">
          ESSAY<span className="text-brand">·</span>EDITOR
        </Link>
        <nav aria-label={t("label")} className="-mx-1 flex flex-1 gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm text-sub hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-brand-soft aria-[current=page]:font-medium aria-[current=page]:text-brand"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <a
          href={`${portfolioUrl}/${profile.username}`}
          target="_blank"
          rel="noreferrer"
          className="hidden shrink-0 text-sm text-sub hover:text-ink sm:inline"
        >
          {t("viewPortfolio")} ↗
        </a>
        <button type="button" onClick={logout} className="shrink-0 text-sm text-sub hover:text-ink">
          {t("logout")}
        </button>
      </div>
    </header>
  );
}
