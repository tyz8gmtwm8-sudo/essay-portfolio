// Firebase のエラーコードを、翻訳ファイル（errors.〜）のキーに変換する
import { FirebaseError } from "firebase/app";

const KNOWN_CODES = [
  "auth/invalid-credential",
  "auth/invalid-email",
  "auth/email-already-in-use",
  "auth/weak-password",
  "auth/too-many-requests",
  "auth/popup-closed-by-user",
  "auth/requires-recent-login",
  "auth/network-request-failed",
  "permission-denied",
] as const;

export type ErrorKey = "unknown" | (typeof KNOWN_CODES)[number];

export function errorKey(error: unknown): ErrorKey {
  if (error instanceof FirebaseError) {
    // 「メールアドレスまたはパスワードが違う」系のエラーはまとめる
    if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
      return "auth/invalid-credential";
    }
    if ((KNOWN_CODES as readonly string[]).includes(error.code)) return error.code as ErrorKey;
  }
  console.error(error);
  return "unknown";
}
