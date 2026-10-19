// 入力チェックのルールと上限値。
// ※ 同じ値を firebase/firestore.rules でもチェックしています。変更するときは両方を直してください。

export const LIMITS = {
  usernameMin: 3,
  usernameMax: 20,
  name: 30,
  comment: 100,
  title: 60,
  essaysPerUser: 200,
  /** 本文の最上位ブロック（段落・見出しなど）の数 */
  bodyBlocks: 2000,
  /** 本文 JSON の文字数（Firestore の 1MB 上限より十分小さくする） */
  bodyJsonChars: 200_000,
  avatarBytes: 5 * 1024 * 1024,
} as const;

export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** 半角英小文字・数字・ハイフンで3〜20文字 */
export const USERNAME_PATTERN = /^[a-z0-9-]{3,20}$/;

/**
 * ユーザー名として使えない言葉（予約語）。
 * ポートフォリオのURL（/<ユーザー名>）と衝突しそうな名前を含めています。
 */
export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "api",
  "about",
  "account",
  "app",
  "auth",
  "editor",
  "essay",
  "essays",
  "help",
  "home",
  "icon",
  "apple-icon",
  "login",
  "logout",
  "signin",
  "signup",
  "register",
  "onboarding",
  "opengraph-image",
  "twitter-image",
  "portfolio",
  "privacy",
  "profile",
  "robots",
  "root",
  "settings",
  "sitemap",
  "static",
  "support",
  "system",
  "terms",
  "theme",
  "user",
  "users",
  "www",
  "null",
  "undefined",
] as const;

export type UsernameError = "format" | "reserved";

/** ユーザー名をチェックし、問題があればエラーの種類を返す（問題なければ null） */
export function checkUsername(username: string): UsernameError | null {
  if (!USERNAME_PATTERN.test(username)) return "format";
  if ((RESERVED_USERNAMES as readonly string[]).includes(username)) return "reserved";
  return null;
}

/** #RRGGBB 形式か */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** 本文の文字サイズ（「標準」は指定なし） */
export const FONT_SIZES = ["small", "large", "xlarge"] as const;
export type FontSize = (typeof FONT_SIZES)[number];

/** 見出しのレベル（h2・h3 のみ使う。h1 はエッセイの題名） */
export const HEADING_LEVELS = [2, 3] as const;
