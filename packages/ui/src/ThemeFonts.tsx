// テーマで使う Google Fonts を読み込む部品。
// React 19 では <link rel="stylesheet" precedence="..."> をどこに書いても <head> にまとめてくれます。

import { preconnect } from "react-dom";
import { googleFontsUrl, type ThemePresetId } from "@portfolio/shared";

export function ThemeFonts({ presets }: { presets: ThemePresetId[] }) {
  // フォントの配信元へ先に接続しておき、表示を速くする
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });
  return <link rel="stylesheet" href={googleFontsUrl(presets)} precedence="default" />;
}
