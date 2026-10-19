// 顔写真アップロード用の署名を発行する API。
// 1. リクエストの IDトークンでログイン中の本人を確認
// 2. 保存先を「avatars/<本人のuid>/avatar」に固定したパラメータに署名して返す
// ブラウザはこの署名を付けて Cloudinary に直接アップロードします。

import { NextResponse } from "next/server";
import { avatarPublicId, cloudinaryConfig, signParams } from "@/lib/cloudinary";
import { verifyRequestUser } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const user = await verifyRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!user.email_verified) {
    return NextResponse.json({ error: "email-not-verified" }, { status: 403 });
  }

  const config = cloudinaryConfig();
  if (!config) {
    return NextResponse.json({ error: "cloudinary-not-configured" }, { status: 500 });
  }

  // ここに含めたパラメータは、ブラウザ側で書き換えると署名が合わずに拒否されます
  const params = {
    public_id: avatarPublicId(user.uid),
    overwrite: "true",
    invalidate: "true",
    allowed_formats: "jpg,png,webp",
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  return NextResponse.json({
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    params,
    signature: signParams(params, config.apiSecret),
  });
}
