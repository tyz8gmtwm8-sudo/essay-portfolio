// 中に入れた要素に、ユーザーのテーマ（CSS変数）を適用する部品。
// 編集サイトのプレビューと、ポートフォリオの各ページで使います。

import type { CSSProperties, ReactNode } from "react";
import { THEME_PRESETS, themeToCssVars, type UserTheme } from "@portfolio/shared";

interface ThemeScopeProps {
  theme: UserTheme;
  children: ReactNode;
  className?: string;
  /** この範囲の言語（ja / en）。読み上げソフトやフォント選択に使われる */
  lang?: string;
}

export function ThemeScope({ theme, children, className, lang }: ThemeScopeProps) {
  return (
    <div
      data-preset={theme.preset}
      data-pattern={THEME_PRESETS[theme.preset].pattern}
      className={className}
      lang={lang}
      style={
        {
          ...themeToCssVars(theme),
          background: "var(--bg)",
          color: "var(--fg)",
          fontFamily: "var(--font-body)",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
