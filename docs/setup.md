# セットアップ手順書

このアプリを動かす・公開するための手順です。
※ 画面の名前やボタンの位置は 2026年8月31日時点の各サービスを前提にしています。サービス側の変更で表記が違う場合があります。

---

## A. パソコンだけで試す（Firebase Emulator）

本物の Firebase を使わず、パソコン上の「練習用 Firebase」で動かします。

### 必要なもの
- Node.js（インストール済み）
- pnpm … `~/.local/bin/pnpm` に入っています
- Java 21 … `~/.local/jdk-21` に入っています

### 1. 環境変数ファイルを作る（初回だけ）

`apps/editor/.env.local` と `apps/portfolio/.env.local` を作り、次の内容を書きます。

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-portfolio
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-portfolio.firebaseapp.com
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3000
NEXT_PUBLIC_EDITOR_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Emulator を起動する（ターミナル1つ目・リポジトリのルートで）

```
export JAVA_HOME="$HOME/.local/jdk-21/Contents/Home" PATH="$HOME/.local/jdk-21/Contents/Home/bin:$PATH"
```

```
pnpm emulators
```

http://localhost:4000 で Emulator の管理画面が開けます。
**確認メールは実際には届きません。** 管理画面の「Authentication」タブ、またはターミナルに表示されるリンクを開くと確認済みになります。

### 3. アプリを起動する（ターミナル2つ目・リポジトリのルートで）

```
pnpm dev
```

- 編集サイト: http://localhost:3001
- ポートフォリオ: http://localhost:3000

### セキュリティルールのテスト

```
pnpm test:rules
```

---

## B. 本番の準備

### 1. Firebase プロジェクトを作る

1. https://console.firebase.google.com を開き「プロジェクトを作成」
2. 左メニュー「構築」→「Authentication」→「始める」
   - 「ログイン方法」タブで **メール/パスワード** と **Google** を有効にする
3. 左メニュー「構築」→「Firestore Database」→「データベースを作成」（本番モード・場所は `asia-northeast1`（東京）がおすすめ）
4. 歯車アイコン →「プロジェクトの設定」→「マイアプリ」で **ウェブアプリ（</>）** を追加
   - 表示された `apiKey` `authDomain` `projectId` `appId` を控える（公開してよい値）
5. 同じ画面の「サービスアカウント」タブ →「新しい秘密鍵を生成」
   - ダウンロードされた JSON は **秘密情報**。リポジトリのフォルダには置かず、GitHub に上げないこと

### 2. セキュリティルールを本番に反映する

```
cd firebase
```

```
pnpm exec firebase login
```

```
pnpm exec firebase deploy --only firestore:rules,firestore:indexes --project <あなたのプロジェクトID>
```

### 3. Cloudinary（画像保存）

1. https://cloudinary.com で無料アカウントを作成（カード登録不要）
2. ダッシュボードの「API Keys」で **Cloud name / API Key / API Secret** を控える
   - API Secret は **秘密情報**

---

## C. Vercel で公開する

Vercel にプロジェクトを **2つ** 作ります（同じ GitHub リポジトリから）。

| プロジェクト | Root Directory | 設定する環境変数 |
| --- | --- | --- |
| 編集サイト | `apps/editor` | `apps/editor/.env.example` の全項目 |
| ポートフォリオ | `apps/portfolio` | `apps/portfolio/.env.example` の全項目 |

- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` は `false`
- `FIREBASE_ADMIN_PRIVATE_KEY` はサービスアカウント JSON の `private_key` をそのまま貼る
- **ポートフォリオ側には firebase-admin・Cloudinary の秘密鍵を絶対に設定しない**

公開後、Firebase コンソール →「Authentication」→「設定」→「承認済みドメイン」に
編集サイトの Vercel のドメイン（例: `editor-xxxx.vercel.app`）を追加します。
（これをしないと Google ログインが失敗します）

---

## D. 公開前テスト

別の Google アカウントで2人分登録し、次を確認します。

- 自分のポートフォリオに、下書きが表示されないこと
- 相手のプロフィールやエッセイを編集できないこと（ルールのテストで自動確認済み）
- 退会すると、ポートフォリオが 404 になること
