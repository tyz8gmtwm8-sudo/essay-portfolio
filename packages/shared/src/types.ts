// Firestore に保存するデータの「形」を定義するファイル。
// 編集サイトとポートフォリオの両方がこの型を使うので、項目名のズレを防げます。

export type Locale = "ja" | "en";
export const LOCALES: readonly Locale[] = ["ja", "en"];

export type ThemePresetId = "pop" | "natural" | "mono" | "night";

export type EssayStatus = "draft" | "published";

/**
 * Firestore の Timestamp。
 * 通常版SDKと lite 版SDKで別のクラスになるため、共通で使うメソッドだけを型にしています。
 */
export interface TimestampLike {
  toMillis(): number;
  toDate(): Date;
}

/** ユーザーが選んだテーマ（プリセット1つ＋メインカラー1色） */
export interface UserTheme {
  preset: ThemePresetId;
  /** #RRGGBB。null ならプリセットの既定色を使う */
  accentColor: string | null;
}

/** users/{uid} */
export interface UserDoc {
  username: string;
  name: string;
  comment: string;
  avatarUrl: string;
  theme: UserTheme;
  locale: Locale;
  /** エッセイの件数（200件上限をセキュリティルールで守るためのカウンター） */
  essayCount: number;
  /** 直前に削除したエッセイのID（カウンターを減らすときにルールが確認する） */
  lastDeletedEssayId: string | null;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

/** usernames/{username} */
export interface UsernameDoc {
  uid: string;
}

/** Tiptap が出力する JSON の1ノード */
export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

/** 本文全体（type が "doc" のノード） */
export interface RichTextDoc extends RichTextNode {
  type: "doc";
  content?: RichTextNode[];
}

/** users/{uid}/essays/{essayId} */
export interface EssayDoc {
  title: string;
  slug: string;
  body: RichTextDoc;
  status: EssayStatus;
  publishedAt: TimestampLike | null;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}
