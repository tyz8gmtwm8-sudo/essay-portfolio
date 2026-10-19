// Cloudinary（画像保存サービス）の署名を作るサーバー側の処理。
// 署名 = 「このパラメータでのアップロードを許可します」という証明。
// 秘密鍵（API Secret）を使って作るので、ブラウザ側では作れません。
// これにより、保存先を「本人のフォルダ」に固定したアップロードしか受け付けられなくなります。
import "server-only";

import { createHash } from "node:crypto";

export function cloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

/**
 * Cloudinary の署名方式：パラメータを名前順に「key=value」で & つなぎにし、
 * 最後に API Secret を付けて SHA-1 でハッシュ化する。
 */
export function signParams(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

/** 1人1枚：顔写真は必ずこの場所に上書き保存する */
export function avatarPublicId(uid: string): string {
  return `avatars/${uid}/avatar`;
}
