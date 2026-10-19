// エッセイの読み書きの処理をまとめたファイル。
// 作成・削除のときは、セキュリティルールに合わせて件数カウンター（essayCount）も同時に更新します。

import {
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type FieldValue,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { createSlug, type EssayDoc, type EssayStatus, type RichTextDoc } from "@portfolio/shared";
import { firestore } from "./firebase";

export interface EssayListItem {
  id: string;
  title: string;
  slug: string;
  status: EssayStatus;
  publishedAt: Date | null;
  updatedAt: Date | null;
}

/** 自分のエッセイ一覧をリアルタイムで受け取る。並び順は「公開日（なければ更新日）の新しい順」 */
export function useMyEssays(uid: string) {
  const [essays, setEssays] = useState<EssayListItem[] | null>(null);

  useEffect(() => {
    return onSnapshot(collection(firestore(), "users", uid, "essays"), (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: "estimate" }) as EssayDoc;
        return {
          id: d.id,
          title: data.title,
          slug: data.slug,
          status: data.status,
          publishedAt: data.publishedAt?.toDate() ?? null,
          updatedAt: data.updatedAt?.toDate() ?? null,
        };
      });
      const sortKey = (e: EssayListItem) => (e.publishedAt ?? e.updatedAt)?.getTime() ?? Date.now();
      setEssays(items.sort((a, b) => sortKey(b) - sortKey(a)));
    });
  }, [uid]);

  return essays;
}

export interface EssayInput {
  title: string;
  body: RichTextDoc;
  status: EssayStatus;
}

/** 新しいエッセイを作る。作ったエッセイの ID を返す */
export async function createEssay(uid: string, input: EssayInput): Promise<{ id: string; slug: string }> {
  const db = firestore();
  const essayRef = doc(collection(db, "users", uid, "essays"));
  const slug = createSlug(input.title);
  const batch = writeBatch(db);
  batch.set(essayRef, {
    title: input.title,
    slug,
    body: input.body,
    status: input.status,
    publishedAt: input.status === "published" ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, "users", uid), { essayCount: increment(1), updatedAt: serverTimestamp() });
  await batch.commit();
  return { id: essayRef.id, slug };
}

/**
 * エッセイを更新する。
 * publishedAt：初めて公開するときだけ「今」を入れ、一度入った公開日は残す（下書きに戻しても消さない）
 */
export async function updateEssay(uid: string, id: string, input: EssayInput, hasPublishedAt: boolean) {
  const data: Record<string, unknown | FieldValue> = {
    title: input.title,
    body: input.body,
    status: input.status,
    updatedAt: serverTimestamp(),
  };
  if (input.status === "published" && !hasPublishedAt) {
    data.publishedAt = serverTimestamp();
  }
  await updateDoc(doc(firestore(), "users", uid, "essays", id), data);
}

/** エッセイを削除する（カウンターを同時に -1） */
export async function deleteEssay(uid: string, id: string) {
  const db = firestore();
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", uid, "essays", id));
  batch.update(doc(db, "users", uid), {
    essayCount: increment(-1),
    lastDeletedEssayId: id,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}
