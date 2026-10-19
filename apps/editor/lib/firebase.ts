// ブラウザから Firebase（認証・データベース）に接続するための設定。
// ここで使う値（NEXT_PUBLIC_〜）は公開されても問題ない値です。
// 実際の安全性は Firestore のセキュリティルールで守っています。

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function firebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-portfolio",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  return app;
}

/** 認証（ログイン）機能。初めて呼ばれたときに準備します */
export function firebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(firebaseApp());
  if (useEmulator) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

/** データベース（Firestore）。初めて呼ばれたときに準備します */
export function firestore(): Firestore {
  if (db) return db;
  db = getFirestore(firebaseApp());
  if (useEmulator) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}
