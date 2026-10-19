// 色の計算（コントラスト比のチェックなど）。
// コントラスト比 = 2色の「明るさの差」の指標。WCAG というアクセシビリティの基準で使われます。
// 目安：本文は 4.5 以上、大きな文字やボタンは 3 以上が望ましい。

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

/** 色の相対輝度（0=黒 〜 1=白） */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 2色のコントラスト比（1〜21） */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** 背景色の上に置く文字色として、黒と白のどちらが読みやすいか */
export function readableTextColor(backgroundHex: string): string {
  return contrastRatio(backgroundHex, "#111111") >= contrastRatio(backgroundHex, "#ffffff")
    ? "#111111"
    : "#ffffff";
}

/** これを下回るとテーマ設定画面で警告を出す */
export const MIN_ACCENT_CONTRAST = 3;
