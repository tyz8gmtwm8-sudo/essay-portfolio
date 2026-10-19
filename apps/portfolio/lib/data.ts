// ポートフォリオのデータ読み取り（読み取り専用）。
// firebase/firestore/lite は「読み書きの基本機能だけ」の軽量版 SDK です。
// ここでは公開データ（プロフィール・公開済みエッセイ）を読むだけで、書き込みは一切しません。
import "server-only";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
  type Firestore,
} from "firebase/firestore/lite";
import { cache } from "react";
import {
  LIMITS,
  checkUsername,
  isLocale,
  normalizeTheme,
  type EssayDoc,
  type Locale,
  type RichTextDoc,
  type UserDoc,
  type UserTheme,
} from "@portfolio/shared";

let db: Firestore | undefined;

function firestore(): Firestore {
  if (db) return db;
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-portfolio",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  db = getFirestore(app);
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}

/** 画面に渡すプロフィール（日時などを含まない、そのまま渡せる形） */
export interface PublicProfile {
  uid: string;
  username: string;
  name: string;
  comment: string;
  avatarUrl: string;
  theme: UserTheme;
  locale: Locale;
}

export interface EssaySummary {
  id: string;
  title: string;
  slug: string;
  /** 公開日（ミリ秒） */
  publishedAt: number;
}

export interface EssayDetail extends EssaySummary {
  body: RichTextDoc;
}

/**
 * ユーザー名からプロフィールを取得する。見つからなければ null。
 * cache() で包むと、1回の表示の中で同じ呼び出しが何度あっても通信は1回で済みます。
 */
export const getProfile = cache(async (username: string): Promise<PublicProfile | null> => {
  if (checkUsername(username) !== null) return null;
  const db = firestore();
  const owner = await getDoc(doc(db, "usernames", username));
  const uid = owner.data()?.uid;
  if (typeof uid !== "string") return null;

  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as UserDoc;
  if (data.username !== username) return null;

  return {
    uid,
    username,
    name: data.name || username,
    comment: data.comment ?? "",
    avatarUrl: data.avatarUrl ?? "",
    theme: normalizeTheme(data.theme),
    locale: isLocale(data.locale) ? data.locale : "ja",
  };
});

/** 公開済みエッセイの一覧（公開日の新しい順） */
export const getPublishedEssays = cache(async (uid: string): Promise<EssaySummary[]> => {
  const snapshot = await getDocs(
    query(
      collection(firestore(), "users", uid, "essays"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(LIMITS.essaysPerUser),
    ),
  );
  return snapshot.docs.map((d) => {
    const data = d.data() as EssayDoc;
    return {
      id: d.id,
      title: data.title,
      slug: data.slug,
      publishedAt: data.publishedAt?.toMillis() ?? 0,
    };
  });
});

/** slug から公開済みエッセイを1件取得。前後のエッセイ（新しい順で隣り合うもの）も返す */
export const getEssay = cache(async (uid: string, slug: string) => {
  const snapshot = await getDocs(
    query(
      collection(firestore(), "users", uid, "essays"),
      where("status", "==", "published"),
      where("slug", "==", slug),
      limit(1),
    ),
  );
  const found = snapshot.docs[0];
  if (!found) return null;
  const data = found.data() as EssayDoc;
  const essay: EssayDetail = {
    id: found.id,
    title: data.title,
    slug: data.slug,
    publishedAt: data.publishedAt?.toMillis() ?? 0,
    body: data.body,
  };

  const list = await getPublishedEssays(uid);
  const index = list.findIndex((item) => item.id === essay.id);
  return {
    essay,
    // 一覧は新しい順なので、「前のエッセイ」= 1つ古いもの、「次のエッセイ」= 1つ新しいもの
    previous: index >= 0 ? (list[index + 1] ?? null) : null,
    next: index > 0 ? (list[index - 1] ?? null) : null,
  };
});
