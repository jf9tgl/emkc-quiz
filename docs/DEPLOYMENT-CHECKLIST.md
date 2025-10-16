# デプロイチェックリスト

## 📋 事前準備

-   [ ] GitHub リポジトリが最新の状態
-   [ ] ローカルで動作確認済み
-   [ ] 必要なアカウントを作成
    -   [ ] Render.com（Server ホスティング）
    -   [ ] Vercel.com（Client ホスティング）

---

## 🖥️ Server デプロイ（Render）

### ステップ 1: Render でデプロイ

-   [ ] Render.com にログイン
-   [ ] "New" → "Web Service"を選択
-   [ ] GitHub リポジトリを接続
-   [ ] 以下を設定:
    ```
    Name: emkc-quiz-server
    Region: Singapore
    Branch: main
    Root Directory: server
    Runtime: Node
    Build Command: npm install && npm run build
    Start Command: node dist/server.js
    ```

### ステップ 2: 環境変数を設定

-   [ ] 以下の環境変数を追加:
    ```
    SERVER_ONLY=true
    ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
    ```

### ステップ 3: デプロイ実行

-   [ ] "Create Web Service"をクリック
-   [ ] デプロイ完了を待つ（5-10 分）
-   [ ] URL をコピー（例: `https://emkc-quiz-server.onrender.com`）

### ステップ 4: 動作確認

-   [ ] URL にアクセスして動作確認
-   [ ] ログを確認してエラーがないことを確認

**Server URL:** `_______________________________`

---

## 🌐 Client デプロイ（Vercel）

### ステップ 1: Vercel でデプロイ

-   [ ] Vercel.com にログイン
-   [ ] "Add New" → "Project"を選択
-   [ ] GitHub リポジトリを選択
-   [ ] 以下を設定:
    ```
    Project Name: emkc-quiz-client
    Framework Preset: Next.js
    Root Directory: client
    ```

### ステップ 2: 環境変数を設定

-   [ ] "Environment Variables"セクションで追加:
    ```
    NEXT_PUBLIC_SERVER_URL=https://emkc-quiz-server.onrender.com
    ```
    ※上記の Server URL を使用

### ステップ 3: デプロイ実行

-   [ ] "Deploy"をクリック
-   [ ] デプロイ完了を待つ（2-3 分）
-   [ ] URL をコピー（例: `https://emkc-quiz-client.vercel.app`）

### ステップ 4: 動作確認

-   [ ] URL にアクセスしてページが表示されることを確認
-   [ ] 接続ステータスが"✓ 接続済み"になることを確認

**Client URL:** `_______________________________`

---

## 🔄 CORS 設定の更新

### Server の CORS 設定を更新

-   [ ] Render のダッシュボードで Server の環境変数を更新:

    ```
    ALLOWED_ORIGINS=https://emkc-quiz-client.vercel.app,http://localhost:3000
    ```

    ※上記の Client URL を使用

-   [ ] Render で"Manual Deploy" → "Clear build cache & deploy"を実行

-   [ ] デプロイ完了を待つ

---

## ✅ 最終確認

### Client 側

-   [ ] ブラウザで Client URL にアクセス
-   [ ] 右上の接続ステータスが緑色（✓ 接続済み）
-   [ ] プレイヤーを選択できる
-   [ ] ボタンが表示される

### Admin 側（ローカル）

-   [ ] `admin/.env.local`を作成:
    ```
    NEXT_PUBLIC_SERVER_URL=https://emkc-quiz-server.onrender.com
    ```
-   [ ] `cd admin && npm run dev`で起動
-   [ ] http://localhost:3000/admin にアクセス
-   [ ] 接続ステータスが緑色
-   [ ] 問題を設定できる

### 統合テスト

-   [ ] Admin で問題を設定
-   [ ] Client（デプロイ版）でボタンが有効になる
-   [ ] Client でボタンを押す
-   [ ] Admin で押下順が表示される
-   [ ] Admin で正解/不正解を判定
-   [ ] スコアが更新される

---

## 🐛 トラブルシューティング

### 問題: 接続ステータスが"✗ 未接続"

**原因:**

-   Server の CORS 設定に Client URL が含まれていない
-   Server がスリープ中（Render Free Plan）

**解決策:**

1. Server の ALLOWED_ORIGINS を確認
2. Server URL に直接アクセスしてスリープ解除
3. Client をリロード

### 問題: ビルドエラー

**原因:**

-   依存関係のインストール失敗
-   TypeScript のエラー

**解決策:**

1. ローカルで`npm run build`を実行して確認
2. エラーを修正して GitHub に push
3. 自動デプロイが実行される

### 問題: 環境変数が反映されない

**原因:**

-   デプロイ後に環境変数を変更した

**解決策:**

1. Vercel/Render のダッシュボードで環境変数を確認
2. "Redeploy"を実行

---

## 📝 メモ

### Server URL

```
https://emkc-quiz-server.onrender.com
```

### Client URL

```
https://emkc-quiz-client.vercel.app
```

### Admin（ローカル）

```
http://localhost:3000
```

---

## 🎉 完了！

すべてのチェックが完了したら、システムが本番環境で動作しています。

### 次のステップ

-   [ ] カスタムドメインの設定（オプション）
-   [ ] 監視とログの設定
-   [ ] バックアップ計画
-   [ ] パフォーマンスの最適化
