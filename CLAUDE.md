# エッセイ・ポートフォリオ（モノレポ）

要件の詳細は必ず [docs/requirements.md](docs/requirements.md) を参照すること。

## 構成

- `apps/editor` … 編集サイト（ログイン必須・noindex）。書き込み処理はここだけ
- `apps/portfolio` … ポートフォリオサイト（閲覧専用）
- `packages/shared` … 型定義・テーマプリセット・入力チェック・翻訳ファイル
- `packages/ui` … エッセイ本文の表示部品など両アプリ共通のUI
- `firebase/` … Firestoreセキュリティルールとそのテスト

## 絶対に守るルール

- **apps/portfolio には書き込み処理・ログイン機能・firebase-admin・秘密鍵（Cloudinary の API Secret など）を絶対に追加しない。**
  ポートフォリオは `firebase/firestore/lite` による公開データの読み取りだけを行う。
- firebase-admin と Cloudinary の秘密鍵は apps/editor のサーバー側（`app/api/**`）だけで使う。
- 秘密情報は `.env.local` に置き、リポジトリにコミットしない。
- エッセイ本文は Tiptap JSON から React 要素として描画し、生の HTML を埋め込まない（`dangerouslySetInnerHTML` 禁止）。
- セキュリティルールを変更したら `firebase/tests` に「他人のデータに書き込めないこと」のテストも追加し、`pnpm test:rules` で確認する。

## よく使うコマンド（リポジトリのルートで実行）

- `pnpm install` … 依存ライブラリのインストール
- `pnpm dev` … 2つのアプリを同時に起動（editor: 3001 / portfolio: 3000）
- `pnpm emulators` … Firebase Emulator を起動（Java が必要）
- `pnpm test:rules` … セキュリティルールのテスト（Java が必要）
- `pnpm typecheck` / `pnpm build`
