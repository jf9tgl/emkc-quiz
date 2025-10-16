# プロジェクト再構成完了ガイド

## 📁 新しいプロジェクト構造

```
emkc-quiz/
├── admin/              # 管理画面 (ローカル実行)
│   ├── src/app/
│   │   ├── admin/      # 管理パネル
│   │   ├── display/    # 投影画面
│   │   └── button/     # (削除可能、client/に移行済み)
│   └── package.json
│
├── client/             # タブレット用クライアント (Vercel デプロイ)
│   ├── app/
│   │   └── page.tsx    # 早押しボタンページ
│   ├── lib/
│   │   └── socket.ts   # Socket.IO クライアント
│   ├── store/
│   │   └── quiz-store.ts  # Zustand ストア
│   └── package.json
│
├── server/             # バックエンド (Vercel デプロイ)
│   ├── server.ts
│   └── package.json
│
├── shared/             # 共通型定義
│   ├── types.ts        # Player, QuizState, SocketEvents 等
│   └── package.json
│
├── legacy/
│   └── controller/     # 旧 Arduino 版 (保存用)
│
└── docs/
```

## 🎯 各プロジェクトの役割

### 1. **admin/** - 管理画面

-   **実行環境**: 生徒会 PC (localhost)
-   **ポート**: 3000
-   **機能**:
    -   問題出題 (`/admin`)
    -   プレイヤー管理 (名前編集、スコア調整)
    -   投影画面 (`/display`)
-   **起動方法**:
    ```bash
    cd admin
    npm run dev  # または bun dev
    ```

### 2. **client/** - タブレット用クライアント

-   **実行環境**: Vercel (公開 URL)
-   **ポート**: 3002 (開発時)
-   **機能**:
    -   プレイヤー選択
    -   早押しボタン
    -   リアルタイム状態表示
-   **起動方法**:
    ```bash
    cd client
    npm run dev  # または bun dev
    ```
-   **デプロイ**:
    ```bash
    cd client
    vercel --prod
    ```

### 3. **server/** - バックエンド

-   **実行環境**: Vercel (WebSocket 対応)
-   **ポート**: 3001
-   **機能**:
    -   Socket.IO サーバー
    -   クイズ状態管理
    -   ボタン押下処理
    -   スコア計算
-   **起動方法**:
    ```bash
    cd server
    npm run dev  # または bun dev
    ```

### 4. **shared/** - 共通型定義

-   **役割**: TypeScript 型定義の共有
-   **使用方法**:
    ```typescript
    // admin または client から
    import type { QuizState, Player } from "@shared/types";
    ```

## 🔧 環境変数設定

### admin/.env.local

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
# デプロイ後
# NEXT_PUBLIC_SERVER_URL=https://quizserver-xxx.vercel.app
```

### client/.env.local

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
# デプロイ後
# NEXT_PUBLIC_SERVER_URL=https://quizserver-xxx.vercel.app
```

### server/.env (オプション)

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

## 🚀 開発環境セットアップ

### 1. 全プロジェクトの依存関係インストール

```bash
# admin
cd admin
npm install  # または bun install

# client
cd ../client
npm install  # または bun install

# server
cd ../server
npm install  # または bun install
```

### 2. 開発サーバー起動 (3 つのターミナル)

#### ターミナル 1: サーバー

```bash
cd server
npm run dev
# → http://localhost:3001
```

#### ターミナル 2: 管理画面

```bash
cd admin
npm run dev
# → http://localhost:3000
```

#### ターミナル 3: クライアント

```bash
cd client
npm run dev
# → http://localhost:3002
```

## 📱 使用方法

### 管理者 (生徒会 PC)

1. `http://localhost:3000/admin` - 問題管理
2. `http://localhost:3000/display` - プロジェクター投影

### 回答者 (タブレット)

1. クライアント URL にアクセス: `http://localhost:3002`
   (デプロイ後: `https://quizclient-xxx.vercel.app`)
2. プレイヤー番号 (1〜5) を選択
3. 大型ボタンで早押し

## 🎨 新機能

### スコア調整 (管理画面)

-   **±1 ボタン**: 各プレイヤーの横に表示
-   **全員リセット**: 右上の赤いボタン

### タブレットボタン (client/)

-   **プレイヤー選択**: 1〜5 から選択
-   **大型ボタン**: 画面いっぱいの早押しボタン
-   **視覚フィードバック**: 押下時に黄色フラッシュ + ⚡

## 🔄 次のステップ

1. [ ] admin/ の `/button` ページを削除 (client/ に移行済み)
2. [ ] admin/ と server/ で `@shared/types` からインポートするよう修正
3. [ ] 動作テスト (admin + client + server 連携)
4. [ ] Vercel デプロイ設定
5. [ ] 本番環境変数の設定

## 📝 削除可能なファイル

-   `admin/src/app/button/page.tsx` ← client/ に移行済み
-   `proto/` フォルダ (プロトタイプ、不要なら削除)

## 🐛 トラブルシューティング

### TypeScript エラー: モジュールが見つからない

```bash
# admin/ または client/ で
npm install
# tsconfig.json の paths 設定を確認
```

### Socket.IO 接続エラー

-   サーバーが起動しているか確認: `http://localhost:3001`
-   CORS 設定を確認: `server/server.ts`
-   環境変数を確認: `.env.local`

### ポート競合エラー

-   admin: 3000
-   server: 3001
-   client: 3002
-   既に使用中の場合はポート番号を変更

## ✅ 完了した作業

-   ✅ プロジェクト構造の再編成
-   ✅ shared/ パッケージの作成
-   ✅ client/ プロジェクトの新規作成
-   ✅ タブレットボタン UI 実装
-   ✅ スコア調整機能実装
-   ✅ Socket.IO イベント追加 (pressButton, adjustScore, resetAllScores)
-   ✅ Zustand ストアの更新

## 🚧 残りの作業

-   [ ] admin/ と server/ で shared/ からインポート
-   [ ] 統合テスト
-   [ ] デプロイ
