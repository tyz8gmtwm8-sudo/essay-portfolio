// Firestore セキュリティルールのテスト。
// Firebase Emulator（パソコン上で動く偽の Firestore）に対して、
// 「できるべき操作は成功し、できてはいけない操作は拒否される」ことを確かめます。
// 実行方法（リポジトリのルートで）: pnpm test:rules

import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-portfolio",
    firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

// ---------- テスト用の便利関数 ----------

/** メール確認済みでログインしたユーザーとして Firestore を使う */
function verifiedDb(uid: string): Firestore {
  return env.authenticatedContext(uid, { email_verified: true }).firestore() as unknown as Firestore;
}

/** メール未確認のユーザー */
function unverifiedDb(uid: string): Firestore {
  return env.authenticatedContext(uid, { email_verified: false }).firestore() as unknown as Firestore;
}

/** ログインしていない訪問者 */
function guestDb(): Firestore {
  return env.unauthenticatedContext().firestore() as unknown as Firestore;
}

function newUserData(username: string) {
  return {
    username,
    name: "",
    comment: "",
    avatarUrl: "",
    theme: { preset: "natural", accentColor: null },
    locale: "ja",
    essayCount: 0,
    lastDeletedEssayId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function essayData(overrides: Record<string, unknown> = {}) {
  return {
    title: "はじめてのエッセイ",
    slug: "abc12345",
    body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "こんにちは" }] }] },
    status: "draft",
    publishedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

/** 初回設定（ユーザー名とプロフィールを同時に作成） */
function onboard(db: Firestore, uid: string, username: string) {
  const batch = writeBatch(db);
  batch.set(doc(db, "usernames", username), { uid });
  batch.set(doc(db, "users", uid), newUserData(username));
  return batch.commit();
}

/** エッセイ作成（カウンター +1 と同時に） */
function createEssay(db: Firestore, uid: string, essayId: string, overrides = {}) {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid, "essays", essayId), essayData(overrides));
  batch.update(doc(db, "users", uid), { essayCount: increment(1), updatedAt: serverTimestamp() });
  return batch.commit();
}

/** ルールを無視してデータを用意する（テストの準備用） */
async function seed(fn: (db: Firestore) => Promise<unknown>) {
  await env.withSecurityRulesDisabled(async (context) => {
    await fn(context.firestore() as unknown as Firestore);
  });
}

// ---------- テスト本体 ----------

describe("初回設定（users + usernames）", () => {
  it("メール確認済みの本人は、ユーザー名とプロフィールを作れる", async () => {
    await assertSucceeds(onboard(verifiedDb("alice"), "alice", "alice"));
  });

  it("メール未確認だと作れない", async () => {
    await assertFails(onboard(unverifiedDb("alice"), "alice", "alice"));
  });

  it("他人の uid でプロフィールを作れない", async () => {
    const db = verifiedDb("mallory");
    const batch = writeBatch(db);
    batch.set(doc(db, "usernames", "alice"), { uid: "alice" });
    batch.set(doc(db, "users", "alice"), newUserData("alice"));
    await assertFails(batch.commit());
  });

  it("すでに使われているユーザー名は取れない", async () => {
    await onboard(verifiedDb("alice"), "alice", "taken");
    await assertFails(onboard(verifiedDb("bob"), "bob", "taken"));
  });

  it("予約語・形式違反のユーザー名は使えない", async () => {
    await assertFails(onboard(verifiedDb("alice"), "alice", "admin"));
    await assertFails(onboard(verifiedDb("alice"), "alice", "Alice"));
    await assertFails(onboard(verifiedDb("alice"), "alice", "ab"));
    await assertFails(onboard(verifiedDb("alice"), "alice", "a".repeat(21)));
  });

  it("2つ目のユーザー名は取れない", async () => {
    const db = verifiedDb("alice");
    await onboard(db, "alice", "alice");
    await assertFails(setDoc(doc(db, "usernames", "alice2"), { uid: "alice" }));
  });

  it("ユーザー名の付け替え（更新）はできない", async () => {
    const db = verifiedDb("alice");
    await onboard(db, "alice", "alice");
    await assertFails(setDoc(doc(db, "usernames", "alice"), { uid: "bob" }));
  });
});

describe("プロフィール（users）", () => {
  beforeEach(async () => {
    await onboard(verifiedDb("alice"), "alice", "alice");
  });

  it("誰でも読める（ログインなしでも）", async () => {
    await assertSucceeds(getDoc(doc(guestDb(), "users", "alice")));
  });

  it("本人は名前・コメントを更新できる", async () => {
    await assertSucceeds(
      updateDoc(doc(verifiedDb("alice"), "users", "alice"), {
        name: "アリス",
        comment: "よろしく",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("他人のプロフィールは更新できない", async () => {
    await assertFails(
      updateDoc(doc(verifiedDb("mallory"), "users", "alice"), {
        name: "乗っ取り",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("ログインしていない人は更新できない", async () => {
    await assertFails(
      updateDoc(doc(guestDb(), "users", "alice"), { name: "x", updatedAt: serverTimestamp() }),
    );
  });

  it("文字数の上限を超えると拒否される", async () => {
    const db = verifiedDb("alice");
    await assertFails(
      updateDoc(doc(db, "users", "alice"), { name: "あ".repeat(31), updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "alice"), { comment: "あ".repeat(101), updatedAt: serverTimestamp() }),
    );
  });

  it("ユーザー名は変更できない", async () => {
    await assertFails(
      updateDoc(doc(verifiedDb("alice"), "users", "alice"), {
        username: "alice-new",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("不正なテーマ・カラーは拒否される", async () => {
    const db = verifiedDb("alice");
    await assertFails(
      updateDoc(doc(db, "users", "alice"), {
        theme: { preset: "unknown", accentColor: null },
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "alice"), {
        theme: { preset: "pop", accentColor: "red" },
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(
      updateDoc(doc(db, "users", "alice"), {
        theme: { preset: "pop", accentColor: "#12ab9f" },
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("顔写真のURLは本人フォルダの Cloudinary 画像だけ", async () => {
    const db = verifiedDb("alice");
    await assertSucceeds(
      updateDoc(doc(db, "users", "alice"), {
        avatarUrl: "https://res.cloudinary.com/demo/image/upload/v123/avatars/alice/avatar.jpg",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "alice"), {
        avatarUrl: "https://res.cloudinary.com/demo/image/upload/v123/avatars/bob/avatar.jpg",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "alice"), {
        avatarUrl: "https://evil.example.com/a.jpg",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("カウンターを勝手に減らせない", async () => {
    const db = verifiedDb("alice");
    await createEssay(db, "alice", "e1");
    await assertFails(
      updateDoc(doc(db, "users", "alice"), {
        essayCount: 0,
        lastDeletedEssayId: "e1",
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("エッセイ（users/{uid}/essays）", () => {
  beforeEach(async () => {
    await onboard(verifiedDb("alice"), "alice", "alice");
  });

  it("本人は作成できる（カウンター +1 と同時）", async () => {
    await assertSucceeds(createEssay(verifiedDb("alice"), "alice", "e1"));
  });

  it("カウンターを増やさずに作成はできない", async () => {
    const db = verifiedDb("alice");
    await assertFails(setDoc(doc(db, "users", "alice", "essays", "e1"), essayData()));
  });

  it("他人のエッセイは作成・更新・削除できない", async () => {
    await createEssay(verifiedDb("alice"), "alice", "e1");
    await onboard(verifiedDb("mallory"), "mallory", "mallory");
    const db = verifiedDb("mallory");

    await assertFails(createEssay(db, "alice", "e2"));
    await assertFails(
      updateDoc(doc(db, "users", "alice", "essays", "e1"), {
        title: "乗っ取り",
        updatedAt: serverTimestamp(),
      }),
    );
    const batch = writeBatch(db);
    batch.delete(doc(db, "users", "alice", "essays", "e1"));
    batch.update(doc(db, "users", "alice"), {
      essayCount: increment(-1),
      lastDeletedEssayId: "e1",
      updatedAt: serverTimestamp(),
    });
    await assertFails(batch.commit());
  });

  it("本人はカウンター -1 と同時に削除できる", async () => {
    const db = verifiedDb("alice");
    await createEssay(db, "alice", "e1");
    const batch = writeBatch(db);
    batch.delete(doc(db, "users", "alice", "essays", "e1"));
    batch.update(doc(db, "users", "alice"), {
      essayCount: increment(-1),
      lastDeletedEssayId: "e1",
      updatedAt: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
  });

  it("カウンターを減らさずに削除はできない", async () => {
    const db = verifiedDb("alice");
    await createEssay(db, "alice", "e1");
    await assertFails(deleteDoc(doc(db, "users", "alice", "essays", "e1")));
  });

  it("下書きは本人しか読めず、公開済みは誰でも読める", async () => {
    const db = verifiedDb("alice");
    await createEssay(db, "alice", "draft1");
    await createEssay(db, "alice", "pub1", {
      slug: "pub1",
      status: "published",
      publishedAt: serverTimestamp(),
    });

    await assertSucceeds(getDoc(doc(db, "users", "alice", "essays", "draft1")));
    await assertFails(getDoc(doc(guestDb(), "users", "alice", "essays", "draft1")));
    await assertSucceeds(getDoc(doc(guestDb(), "users", "alice", "essays", "pub1")));

    // 訪問者は「公開済みだけ」に絞った一覧なら読める
    const published = query(
      collection(guestDb(), "users", "alice", "essays"),
      where("status", "==", "published"),
    );
    await assertSucceeds(getDocs(published));
    // 絞り込みなしの一覧は読めない（下書きが含まれる可能性があるため）
    await assertFails(getDocs(collection(guestDb(), "users", "alice", "essays")));
  });

  it("題名が空・60文字超・不正な状態は拒否される", async () => {
    const db = verifiedDb("alice");
    await assertFails(createEssay(db, "alice", "e1", { title: "" }));
    await assertFails(createEssay(db, "alice", "e1", { title: "あ".repeat(61) }));
    await assertFails(createEssay(db, "alice", "e1", { status: "secret" }));
    // 公開日なしで公開はできない
    await assertFails(createEssay(db, "alice", "e1", { status: "published", publishedAt: null }));
  });

  it("slug は後から変更できない", async () => {
    const db = verifiedDb("alice");
    await createEssay(db, "alice", "e1");
    await assertFails(
      updateDoc(doc(db, "users", "alice", "essays", "e1"), {
        slug: "changed",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("エッセイは200件まで", async () => {
    await seed(async (db) => {
      await updateDoc(doc(db, "users", "alice"), { essayCount: 200 });
    });
    await assertFails(createEssay(verifiedDb("alice"), "alice", "e201"));
  });
});
