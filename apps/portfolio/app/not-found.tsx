// サイト全体の 404（存在しないユーザーなど）
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { DEFAULT_THEME, localeFromAcceptLanguage } from "@portfolio/shared";
import { ThemeFonts, ThemeScope } from "@portfolio/ui";
import { NotFoundView } from "@/components/NotFoundView";

export default async function NotFound() {
  const locale = localeFromAcceptLanguage((await headers()).get("accept-language"));
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return (
    <ThemeScope theme={DEFAULT_THEME} lang={locale}>
      <ThemeFonts presets={[DEFAULT_THEME.preset]} />
      <NotFoundView title={t("notFoundTitle")} body={t("notFoundBody")} homeHref="/" homeLabel={t("goHome")} />
    </ThemeScope>
  );
}
