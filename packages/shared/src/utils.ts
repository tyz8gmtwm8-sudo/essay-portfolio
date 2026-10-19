// 小さな便利関数

/**
 * エッセイのURL用文字列（slug）を作る。
 * 例: "My First Essay" → "my-first-essay-k3x9q2"
 *     "はじめてのエッセイ" → "k3x9q2ab"（英数字がない題名はランダム文字列のみ）
 * 末尾にランダムな文字を付けるので、同じ題名でも重複しません。
 */
export function createSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const random = randomId(base ? 6 : 8);
  return base ? `${base}-${random}` : random;
}

function randomId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/**
 * Cloudinary の画像URLに「正方形トリミング・WebPなどへの自動変換・サイズ縮小」の指定を足す。
 * Cloudinary はURLの中の `/upload/` の後ろに変換指定を書くと、その通りに加工した画像を返してくれます。
 */
export function cloudinaryAvatar(url: string, size: number): string {
  if (!url.includes("/image/upload/")) return url;
  return url.replace(
    "/image/upload/",
    `/image/upload/c_fill,g_face,w_${size},h_${size},f_auto,q_auto/`,
  );
}

/** 公開日を表示するときのタイムゾーン（サーバーの場所によって日付がずれないように固定） */
export const DISPLAY_TIME_ZONE = "Asia/Tokyo";

/** 公開日の表示用文字列。例: 2026年10月19日 / October 19, 2026 */
export function formatDate(millis: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: DISPLAY_TIME_ZONE }).format(millis);
}
