// エッセイごとの OGP 画像（SNSでURLを共有したときに表示される画像）を自動生成する。
// 題名・名前をテーマの色で描いた 1200×630 の画像になります。

import { ImageResponse } from "next/og";
import { THEME_PRESETS, readableTextColor, resolveAccent } from "@portfolio/shared";
import { getEssay, getProfile } from "@/lib/data";

export const alt = "Essay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 30;

/**
 * 日本語フォントを Google Fonts から「使う文字だけ」取得する。
 * （OGP画像の生成には日本語フォントのデータが必要なため）
 * 取得できなかった場合は undefined を返し、フォント指定なしで描画する。
 */
async function loadFont(text: string): Promise<ArrayBuffer | undefined> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!fontUrl) return undefined;
    const response = await fetch(fontUrl);
    return response.ok ? await response.arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const profile = await getProfile(username);
  const result = profile ? await getEssay(profile.uid, slug) : null;

  const title = result?.essay.title ?? "Essay Portfolio";
  const author = profile?.name ?? "";
  const preset = THEME_PRESETS[profile?.theme.preset ?? "natural"];
  const accent = profile ? resolveAccent(profile.theme) : preset.colors.accent;
  const font = await loadFont(`${title}${author}Essay`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: preset.colors.background,
          color: preset.colors.text,
          fontFamily: font ? "Noto Sans JP" : undefined,
        }}
      >
        <div style={{ display: "flex", width: 120, height: 12, background: accent, borderRadius: 6 }} />
        <div style={{ display: "flex", fontSize: title.length > 30 ? 56 : 72, fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 32 }}>
          <span style={{ color: preset.colors.subText }}>{author}</span>
          <span
            style={{
              background: accent,
              color: readableTextColor(accent),
              padding: "8px 24px",
              borderRadius: 999,
              fontSize: 24,
            }}
          >
            Essay
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
