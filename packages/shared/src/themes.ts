// テーマのプリセット定義。編集サイト（プレビュー）とポートフォリオの両方で使います。
// 色やフォントを「CSS変数」に変換して画面に適用します。
// CSS変数 = `--accent: #ff5a5f;` のように名前を付けた値。CSSの中で var(--accent) として使い回せます。

import { readableTextColor } from "./color";
import type { ThemePresetId, UserTheme } from "./types";
import { HEX_COLOR_PATTERN } from "./validation";

/** 背景の装飾パターンの種類 */
export type BackgroundPattern = "blobs" | "brush" | "lines" | "glow";

export interface ThemePreset {
  id: ThemePresetId;
  colors: {
    background: string;
    surface: string;
    text: string;
    subText: string;
    border: string;
    /** メインカラー（アクセント）の既定値 */
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    /** Google Fonts で読み込むフォント（URL の family= の部分） */
    googleFamilies: string[];
  };
  /** 角丸の大きさ */
  radius: string;
  pattern: BackgroundPattern;
  /** アニメーションの強さ */
  motion: {
    /** マグネティック効果でカーソル方向へ引き寄せる割合（0〜1） */
    magnet: number;
    /** バネの硬さ（大きいほど速く動く） */
    stiffness: number;
    /** バネの減衰（小さいほど弾む） */
    damping: number;
    /** フェードインの時間（秒） */
    duration: number;
    /** スライドインの移動距離（px） */
    distance: number;
    /** 動きの緩急（CSS の cubic-bezier の4つの数値）。1を超える値があると「弾む」動きになる */
    ease: [number, number, number, number];
  };
}

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  pop: {
    id: "pop",
    colors: {
      background: "#fff7ea",
      surface: "#ffffff",
      text: "#2b2340",
      subText: "#6b6280",
      border: "#f0dfc6",
      accent: "#ff5a5f",
    },
    fonts: {
      heading: "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif",
      body: "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif",
      googleFamilies: ["Zen+Maru+Gothic:wght@400;700"],
    },
    radius: "28px",
    pattern: "blobs",
    motion: { magnet: 0.45, stiffness: 260, damping: 11, duration: 0.6, distance: 48, ease: [0.34, 1.56, 0.64, 1] },
  },
  natural: {
    id: "natural",
    colors: {
      background: "#f3eee4",
      surface: "#faf7f1",
      text: "#38332d",
      subText: "#776e62",
      border: "#ddd3c2",
      accent: "#6f7f45",
    },
    fonts: {
      heading: "'Shippori Mincho', 'Hiragino Mincho ProN', serif",
      body: "'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif",
      googleFamilies: ["Shippori+Mincho:wght@400;700", "Zen+Kaku+Gothic+New:wght@400;700"],
    },
    radius: "12px",
    pattern: "brush",
    motion: { magnet: 0.25, stiffness: 80, damping: 18, duration: 1.2, distance: 28, ease: [0.25, 0.8, 0.3, 1] },
  },
  mono: {
    id: "mono",
    colors: {
      background: "#ffffff",
      surface: "#fafafa",
      text: "#111111",
      subText: "#666666",
      border: "#e4e4e4",
      accent: "#d7263d",
    },
    fonts: {
      heading: "'Noto Serif JP', 'Hiragino Mincho ProN', serif",
      body: "'Noto Serif JP', 'Hiragino Mincho ProN', serif",
      googleFamilies: ["Noto+Serif+JP:wght@400;700"],
    },
    radius: "0px",
    pattern: "lines",
    motion: { magnet: 0.15, stiffness: 150, damping: 26, duration: 0.9, distance: 16, ease: [0.4, 0, 0.2, 1] },
  },
  night: {
    id: "night",
    colors: {
      background: "#0d0f1e",
      surface: "#161a30",
      text: "#e8eaf6",
      subText: "#9aa0c3",
      border: "#272c4a",
      accent: "#6ff2cf",
    },
    fonts: {
      heading: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      body: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      googleFamilies: ["Noto+Sans+JP:wght@400;700"],
    },
    radius: "16px",
    pattern: "glow",
    motion: { magnet: 0.3, stiffness: 170, damping: 18, duration: 0.8, distance: 32, ease: [0.22, 1, 0.36, 1] },
  },
};

export const THEME_PRESET_IDS = Object.keys(THEME_PRESETS) as ThemePresetId[];

export const DEFAULT_THEME: UserTheme = { preset: "natural", accentColor: null };

/** 不正な値が入っていても必ず使えるテーマに直す */
export function normalizeTheme(theme: Partial<UserTheme> | null | undefined): UserTheme {
  const preset =
    theme?.preset && theme.preset in THEME_PRESETS ? theme.preset : DEFAULT_THEME.preset;
  const accentColor =
    typeof theme?.accentColor === "string" && HEX_COLOR_PATTERN.test(theme.accentColor)
      ? theme.accentColor.toLowerCase()
      : null;
  return { preset, accentColor };
}

/** 実際に使うメインカラー（微調整された色、なければプリセットの既定色） */
export function resolveAccent(theme: UserTheme): string {
  return theme.accentColor ?? THEME_PRESETS[theme.preset].colors.accent;
}

/**
 * テーマを CSS 変数のオブジェクトに変換する。
 * React の style 属性にそのまま渡せます： <div style={themeToCssVars(theme)}>
 */
export function themeToCssVars(theme: UserTheme): Record<string, string> {
  const preset = THEME_PRESETS[theme.preset];
  const accent = resolveAccent(theme);
  return {
    "--bg": preset.colors.background,
    "--surface": preset.colors.surface,
    "--fg": preset.colors.text,
    "--muted": preset.colors.subText,
    "--border": preset.colors.border,
    "--accent": accent,
    "--on-accent": readableTextColor(accent),
    "--font-heading": preset.fonts.heading,
    "--font-body": preset.fonts.body,
    "--radius": preset.radius,
    "--motion-duration": `${preset.motion.duration}s`,
    "--motion-distance": `${preset.motion.distance}px`,
    "--motion-ease": `cubic-bezier(${preset.motion.ease.join(", ")})`,
  };
}

/**
 * 指定したプリセットで使うフォントを読み込む Google Fonts の URL。
 * 日本語フォントは「使われている文字の範囲」だけがブラウザに読み込まれます。
 */
export function googleFontsUrl(presets: ThemePresetId[]): string {
  const families = [...new Set(presets.flatMap((id) => THEME_PRESETS[id].fonts.googleFamilies))];
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}
