# Server - タブレット専用クイズサーバー# server



Arduino不要のシンプルなWebSocketサーバーです。タブレットボタンのみで動作します。## インストール



## 特徴```bash

npm install

✅ **Arduino不要** - タブレットブラウザのみで完結  ```

✅ **シンプル** - 不要なコードを完全に削除  

✅ **Vercel以外にデプロイ可能** - Render/Railway/Flyなど  ## 起動方法

✅ **WebSocket対応** - Socket.IOでリアルタイム通信

### サーバーオンリーモード（推奨）

## セットアップ

Arduino なしで、タブレットボタンのみで動作します。

### 1. 依存関係のインストール

```bash

```bashnpm run dev:server-only

npm install```

```

または

### 2. 環境変数の設定

```bash

`.env`ファイルを作成：npm run dev -- --server-only

```

```bash

PORT=3001### Arduino シミュレーターモード

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

```Wokwi シミュレーター（ポート 4000）に接続します。



### 3. 開発サーバーの起動```bash

npm run dev -- --simulator

```bash```

npm run dev

```### Arduino 接続モード



サーバーが起動します: `http://localhost:3001`実際の Arduino デバイスに接続します。



## コマンド```bash

npm run dev -- --com COM3

```bash```

# 開発モード（ホットリロード）

npm run devCOM ポートを指定しない場合は自動検出を試みます。



# ビルド## コマンドラインオプション

npm run build

-   `-p, --port <番号>` - サーバーポート番号（デフォルト: 3001）

# 本番起動（ビルド後）-   `-c, --com <ポート>` - COM ポート名（例: COM3）

npm start-   `-s, --simulator` - Arduino シミュレーターを使用

```-   `-so, --server-only` - **Arduino なしでサーバーのみ起動（タブレット専用）**

-   `-h, --help` - ヘルプを表示

## エンドポイント

## 環境変数

### HTTP

`.env`ファイルで設定可能：

- `GET /` - サーバー情報

- `GET /health` - ヘルスチェック-   `PORT` - サーバーポート番号

-   `COM_PORT` - COM ポート名

### WebSocket (Socket.IO)-   `USE_SIMULATOR` - シミュレーター使用フラグ（true/false）

-   `SERVER_ONLY` - サーバーオンリーモード（true/false）

#### クライアント → サーバー

## 使用例

- `setQuestion` - 問題を設定

- `updatePlayerName` - プレイヤー名を更新```bash

- `setQuizSetting` - クイズ設定を更新# サーバーオンリーモード（タブレットのみ）

- `correctAnswer` - 正解判定npm run dev:server-only

- `incorrectAnswer` - 不正解判定

- `endQuiz` - クイズ終了# ポート指定

- `setShowHint` - ヒント表示切替npm run dev -- --port 3002

- `setShowAnswer` - 答え表示切替

- **`pressButton`** - **タブレットボタン押下**# COMポート指定

- `adjustScore` - スコア調整（±1など）npm run dev -- --com COM5

- `setScore` - スコア直接設定

- `resetAllScores` - 全スコアリセット# シミュレーター使用

npm run dev -- --simulator

#### サーバー → クライアント

# 複数オプション組み合わせ

- `state` - 全体状態のブロードキャストnpm run dev -- --port 3002 --server-only

- `buttonPressed` - ボタン押下通知```

- `correctAnswer` - 正解通知
- `incorrectAnswer` - 不正解通知
- `scoreUpdated` - スコア更新通知

## デプロイ

詳細は [DEPLOYMENT-GUIDE.md](../docs/DEPLOYMENT-GUIDE.md) を参照してください。

### Render（推奨）

```
Name: emkc-quiz-server
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start

環境変数:
PORT=10000
ALLOWED_ORIGINS=https://your-client.vercel.app,http://localhost:3000
```

### Railway

```
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start
```

## 旧バージョン（Arduino対応）

Arduino対応の旧サーバーは `legacy/server/` に移動されました。

## 技術スタック

- Node.js 20+
- Express.js
- Socket.IO
- TypeScript
- dotenv

## ライセンス

Private
