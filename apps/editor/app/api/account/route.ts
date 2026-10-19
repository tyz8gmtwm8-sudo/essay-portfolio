// 退会 API：本人のデータをすべて削除する。
// 削除するもの：Cloudinary の顔写真、Firestore のプロフィール・エッセイ・ユーザー名、ログイン用アカウント

import { NextResponse } from "next/server";
import { avatarPublicId, cloudinaryConfig, signParams } from "@/lib/cloudinary";
import { adminAuth, adminDb, verifyRequestUser } from "@/lib/firebase-admin";

export async function DELETE(request: Request) {
  const user = await verifyRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const uid = user.uid;

  // 1. 顔写真（Cloudinary）を削除。設定がない・画像がない場合は飛ばす
  const config = cloudinaryConfig();
  if (config) {
    const params = {
      public_id: avatarPublicId(uid),
      invalidate: "true",
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };
    const body = new URLSearchParams({
      ...params,
      api_key: config.apiKey,
      signature: signParams(params, config.apiSecret),
    });
    await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
      method: "POST",
      body,
    }).catch((error) => console.error("Cloudinary の削除に失敗しました", error));
  }

  // 2. Firestore のデータを削除（エッセイなどのサブコレクションもまとめて消える）
  const db = adminDb();
  const userRef = db.doc(`users/${uid}`);
  const snapshot = await userRef.get();
  const username = snapshot.get("username");
  await db.recursiveDelete(userRef);
  if (typeof username === "string") {
    const usernameRef = db.doc(`usernames/${username}`);
    const owner = await usernameRef.get();
    if (owner.get("uid") === uid) await usernameRef.delete();
  }

  // 3. ログイン用アカウントを削除
  await adminAuth().deleteUser(uid);

  return NextResponse.json({ ok: true });
}
