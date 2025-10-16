# タブレット早押しシステム 設計書

## 概要

物理 Arduino 早押しボタンからタブレットベースの早押しシステムへの移行設計

## システム構成図

```
┌─────────────────┐
│  生徒会PC       │
│  (管理画面)     │ ← セルフホスト (localhost)
│  Admin/Display  │
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  サーバー       │
│  (Node.js)      │ ← デプロイ (Render/Railway/Vercel等)
│  Socket.IO      │
│  状態管理       │
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  クライアント   │
│  (Next.js)      │ ← デプロイ (Vercel/Netlify等)
│  早押しボタン   │
└────────┬────────┘
         │ タッチ操作
         ↓
┌─────────────────┐
│  回答者         │
│  (タブレット)   │ ← 各プレイヤーのデバイス
│  5台            │
└─────────────────┘
```

## プロジェクト構成

```
emkc-quiz/
├── packages/
│   ├── server/          # バックエンド（デプロイ可能）(サブモジュール)
│   ├── admin/           # 管理画面（生徒会PC用）
│   ├── client/          # 早押しクライアント（タブレット用・デプロイ）(サブモジュール)
│   └── shared/          # 共通型定義 (サブモジュール)
├── legacy/
│   └── arduino-controller/  # 旧Arduino版（保存用）
└── docs/
```

## 各コンポーネント詳細

### 1. サーバー (packages/server)

#### 機能

-   WebSocket 通信（Socket.IO）
-   クイズ状態管理
-   プレイヤー管理
-   ボタン押下の受付と順序管理
-   スコア計算

#### デプロイ

Vercel (個人でやります)

#### 環境変数

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://quizclient.jf9tgl.net,http://localhost:3000
```

#### 新機能追加

-   ポイント操作 API
    -   `POST /api/player/:id/score/add` - ポイント加算
    -   `POST /api/player/:id/score/subtract` - ポイント減算
    -   `POST /api/players/reset-scores` - 全員リセット

### 2. 管理画面 (packages/admin)

#### 機能

-   問題出題
-   プレイヤー管理（名前編集）
-   **新機能**: 個別ポイント調整
-   **新機能**: 全員ポイントリセット
-   ヒント/答え表示制御
-   リアルタイム状態表示

#### デプロイ

-   **ローカルのみ**: 生徒会 PC で npm run dev またはビルド版を実行
-   環境変数でサーバー URL 指定

#### 環境変数

```env
NEXT_PUBLIC_SERVER_URL=https://quizserver.jf9tgl.net
```

### 3. クライアント (packages/client)

#### 機能

-   **早押しボタン表示**（大きなタッチ可能ボタン）
-   プレイヤー ID 選択（1-6）
-   接続状態表示
-   ボタン押下フィードバック
-   順位表示（オプション）

#### UI 設計

```
┌──────────────────────────┐
│  プレイヤー選択          │
│  [1] [2] [3] [4] [5] [6] │
└──────────────────────────┘
┌──────────────────────────┐
│                          │
│                          │
│      早押しボタン        │
│      [  PUSH!  ]         │
│                          │
│                          │
└──────────────────────────┘
│  状態: 待機中            │
│  順位: -                 │
└──────────────────────────┘
```

#### デプロイ先

Vercel (個人でやります)

#### 環境変数

```env
NEXT_PUBLIC_SERVER_URL=https://quizserver.jf9tgl.net
```

### 4. 共通型定義 (packages/shared)

#### 内容

```typescript
// Player型
// QuizState型
// SocketEvents型
// 等々
```

## データフロー

### ボタン押下フロー

```
1. タブレット(Client) → ボタンタップ
2. Client → Server: Socket.IO emit('buttonPress', { playerId })
3. Server → 状態更新（順序記録）
4. Server → All Clients: broadcast('state', newState)
5. Admin/Display → 状態表示更新
6. Client → フィードバック表示
```

### ポイント操作フロー

```
1. Admin → ポイント調整ボタンクリック
2. Admin → Server: emit('adjustScore', { playerId, delta })
3. Server → スコア更新
4. Server → All Clients: broadcast('state', newState)
5. 全画面で更新表示
```

## Socket.IO イベント定義

### クライアント → サーバー

```typescript
{
  // 既存
  'setQuestion': QuestionData,
  'correctAnswer': void,
  'incorrectAnswer': void,
  'endQuiz': void,

  // 新規
  'buttonPress': { playerId: number },
  'adjustScore': { playerId: number, delta: number },
  'resetAllScores': void,
  'updatePlayerName': { playerId: number, name: string }
}
```

### サーバー → クライアント

```typescript
{
  'state': QuizState,
  'buttonPressed': { playerId: number, order: number, timestamp: number },
  'correctAnswer': { playerId: number },
  'incorrectAnswer': { playerId: number },
  'scoreUpdated': { playerId: number, newScore: number }
}
```

## 技術スタック

### サーバー

-   **Runtime**: Node.js 20
-   **Framework**: Express
-   **WebSocket**: Socket.IO
-   **Language**: TypeScript

### フロントエンド（Admin & Client）

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **State**: Zustand
-   **WebSocket**: Socket.IO Client

## セキュリティ考慮事項

### CORS 設定

```typescript
const allowedOrigins = [
    "http://localhost:3000",
    "https://quizadmin.jf9tgl.net",
    "https://quizclient.jf9tgl.net",
];
```

### 認証（オプション）

-   管理画面: 簡易パスワード認証
-   クライアント: 公開 OK（回答者用）

## デプロイ手順

サーバー&クライアントは前日でデプロイ

### 1. サーバー (Vercel)

```bash
cd packages/server
npm run build
# Vercelで自動デプロイ
```

### 2. クライアント (Vercel)

```bash
cd packages/client
vercel --prod
```

### 3. 管理画面（ローカル）

```bash
cd packages/admin
npm run build
npm start
# または
npm run dev
```

## 移行計画

### フェーズ 1: プロジェクト再構成

1. モノレポ構造作成
2. 既存コードの分離
3. 共通型定義の抽出

### フェーズ 2: サーバー改修

1. Arduino 通信削除
2. タブレットボタン押下受付追加
3. ポイント操作 API 実装
4. デプロイ準備

### フェーズ 3: クライアント作成

1. 新規 Next.js プロジェクト作成
2. 早押しボタン UI 実装
3. WebSocket 接続実装
4. デプロイ

### フェーズ 4: 管理画面改修

1. ポイント操作 UI 追加
2. サーバー URL 設定対応
3. デプロイ済みサーバーへの接続

### フェーズ 5: テスト & デプロイ

1. ローカル統合テスト
2. サーバーデプロイ
3. クライアントデプロイ
4. 本番環境テスト

## 質問・確認事項

### 1. プロジェクト構成

-   モノレポ（案 1）と分離プロジェクト（案 2）、どちらが良いですか？
-   **推奨**: モノレポ（共通型定義の管理が容易）

案 1

### 2. デプロイ先

-   サーバー: Render で問題ないですか？（無料枠、WebSocket 対応）
-   クライアント: Vercel で問題ないですか？（Next.js 最適化）

両方とも Vercel

### 3. クライアント UI

-   各タブレットに 1 人のプレイヤーを割り当てますか？
-   それとも、1 台のタブレットで複数プレイヤー切り替え可能にしますか？
-   **推奨**: 1 台 1 人（シンプル、押し間違い防止）

1 人 1 台

### 4. ポイント操作

-   ポイント調整は ±1 ずつ？それとも任意の値？
-   **推奨**: ±1 ボタンと任意入力の両方

両方

### 5. Arduino 版の扱い

-   legacy/フォルダに保存して将来的に削除？
-   それとも並行運用可能にする？
-   **推奨**: legacy 保存のみ（メンテナンス負荷軽減）

legacy 保存のみ

### 6. 認証

-   管理画面にパスワード保護は必要ですか？
-   クライアントは誰でもアクセス可能で問題ないですか？

管理画面は生徒会 PC のみでしかアクセスしない想定なのでパスワード認証は不要
クライアントは公開 OK (管理画面で QR コード表示)

### 7. その他

-   プレイヤー数は 6 人固定？それとも可変にする？
-   ボタンの二重押し防止機能は必要？
-   オフライン対応は必要？

プレイヤー数は 5 人固定(変更された)
防止機能は不要(タブレットなので)
オフライン対応は不要(リアルタイム性重視)
