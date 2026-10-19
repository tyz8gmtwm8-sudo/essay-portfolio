// サーバー側（app/api）だけで使う Firebase の管理者機能。
// 秘密鍵を使うので、ブラウザ側のコードから import してはいけません。
// 先頭の "server-only" は、間違ってブラウザ側で読み込んだときにビルドエラーにしてくれます。
import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  if (useEmulator) {
    // Emulator 利用時は秘密鍵なしで動かせる
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-portfolio",
    });
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // 環境変数では改行が "\n" という文字になっているので、本物の改行に戻す
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("firebase-admin の環境変数（FIREBASE_ADMIN_*）が設定されていません");
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());

/**
 * リクエストの「Authorization: Bearer <IDトークン>」を確認し、ログイン中のユーザーを返す。
 * IDトークン = Firebase が発行する「この人は確かにログインしています」という証明書。
 * 確認できなければ null。
 */
export async function verifyRequestUser(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return null;
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}
