// next-intl の設定（ポートフォリオ用）。
// ページごとに「そのユーザーが選んだ言語」を getTranslations({ locale }) で明示して使います。
// ここでヘッダーや Cookie を読まないのは、ページをキャッシュ（高速表示）できるようにするためです。
import { getRequestConfig } from "next-intl/server";
import { MESSAGES, isLocale } from "@portfolio/shared";

export default getRequestConfig(async ({ locale }) => {
  const resolved = isLocale(locale) ? locale : "ja";
  return { locale: resolved, messages: MESSAGES[resolved] };
});
