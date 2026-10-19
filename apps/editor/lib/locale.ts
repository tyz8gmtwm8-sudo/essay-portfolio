// 表示言語を Cookie に保存する（ブラウザ側で使う）。
// Cookie に入れておくと、次のページ表示からサーバー側でもその言語で文言を出せます。
import type { Locale } from "@portfolio/shared";

export function saveLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
