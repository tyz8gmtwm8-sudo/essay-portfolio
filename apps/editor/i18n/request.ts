// next-intl の設定：今のリクエストで使う言語と文言を決める。
// 優先順位：① Cookie（アカウント設定で選んだ言語）② ブラウザの言語設定
import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { MESSAGES, isLocale, localeFromAcceptLanguage } from "@portfolio/shared";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export default getRequestConfig(async () => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(fromCookie)
    ? fromCookie
    : localeFromAcceptLanguage((await headers()).get("accept-language"));
  return { locale, messages: MESSAGES[locale] };
});
