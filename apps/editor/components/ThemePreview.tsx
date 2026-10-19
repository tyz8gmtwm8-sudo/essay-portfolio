// テーマ設定画面のプレビュー。ポートフォリオのトップを小さくした見本です。
// ThemeScope（packages/ui）でポートフォリオと同じ CSS 変数を当てています。

import { THEME_PRESETS, cloudinaryAvatar, type UserTheme } from "@portfolio/shared";
import { ThemeScope } from "@portfolio/ui";

interface ThemePreviewProps {
  theme: UserTheme;
  name: string;
  comment: string;
  avatarUrl: string;
  sampleTitles: string[];
  buttonLabel: string;
}

export function ThemePreview({ theme, name, comment, avatarUrl, sampleTitles, buttonLabel }: ThemePreviewProps) {
  const pattern = THEME_PRESETS[theme.preset].pattern;
  return (
    <ThemeScope theme={theme} className="relative overflow-hidden rounded-2xl border border-line">
      <PreviewPattern pattern={pattern} />
      <div className="relative flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <div
          className="mb-4 size-20 overflow-hidden border-2"
          style={{ borderRadius: "50%", borderColor: "var(--accent)", background: "var(--surface)" }}
        >
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- Cloudinary 側で最適化済みの画像
            <img src={cloudinaryAvatar(avatarUrl, 160)} alt="" className="size-full object-cover" />
          )}
        </div>
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {name}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {comment}
        </p>
        <span
          className="mt-5 inline-block px-4 py-1.5 text-xs font-medium"
          style={{ background: "var(--accent)", color: "var(--on-accent)", borderRadius: "var(--radius)" }}
        >
          {buttonLabel}
        </span>
      </div>
      <ul className="relative space-y-2 px-6 pb-8">
        {sampleTitles.map((title) => (
          <li
            key={title}
            className="flex items-center justify-between border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {title}
            <span style={{ color: "var(--accent)" }}>→</span>
          </li>
        ))}
      </ul>
    </ThemeScope>
  );
}

/** プリセットごとの背景装飾（プレビュー用の静止版） */
function PreviewPattern({ pattern }: { pattern: string }) {
  if (pattern === "blobs") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 -top-8 size-32 rounded-full opacity-25" style={{ background: "var(--accent)" }} />
        <div className="absolute -right-6 top-24 size-20 rounded-full opacity-20" style={{ background: "#ffc94a" }} />
      </div>
    );
  }
  if (pattern === "glow") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 60%)" }}
      />
    );
  }
  if (pattern === "brush") {
    return (
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-6 h-24 w-full opacity-40" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M10 70 C 80 20, 140 90, 210 50 S 330 20, 390 60" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // lines
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-y-0 left-6 w-px" style={{ background: "var(--border)" }} />
      <div className="absolute inset-y-0 right-6 w-px" style={{ background: "var(--border)" }} />
    </div>
  );
}
