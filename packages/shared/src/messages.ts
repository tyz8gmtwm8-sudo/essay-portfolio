// 画面の文言（翻訳ファイル）。日本語は ja.json、英語は en.json に書きます。
import en from "../messages/en.json";
import ja from "../messages/ja.json";
import type { Locale } from "./types";

export const MESSAGES = { ja, en } satisfies Record<Locale, unknown>;

export function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en";
}

/** ブラウザの言語設定（Accept-Language ヘッダー）から ja / en を選ぶ。どちらもなければ ja */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  const languages = (header ?? "")
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase() ?? "");
  for (const language of languages) {
    if (language.startsWith("ja")) return "ja";
    if (language.startsWith("en")) return "en";
  }
  return "ja";
}
