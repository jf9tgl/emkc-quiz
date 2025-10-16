# Client - タブレット用ボタン UI

クイズシステムのタブレット用インターフェースです。プレイヤーが問題を見て、早押しボタンを押すために使用します。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成：

```bash
# ローカル開発
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3002](http://localhost:3002) を開きます。

## Vercel へのデプロイ

詳細は [DEPLOYMENT-GUIDE.md](../docs/DEPLOYMENT-GUIDE.md) を参照してください。

### クイックスタート

1. **Vercel アカウント作成**

    - https://vercel.com でサインアップ

2. **プロジェクトをインポート**

    - "New Project" → GitHub リポジトリを選択
    - Root Directory: `client`

3. **環境変数を設定**

    ```
    NEXT_PUBLIC_SERVER_URL=https://your-server-url.onrender.com
    ```

4. **デプロイ**
    - "Deploy"をクリック

## ビルド

```bash
npm run build
```

## 使用方法

1. プレイヤー選択画面で自分の番号を選択
2. 問題が表示されたら"PUSH!"ボタンをタップ
3. 押下順が記録され、管理画面に反映されます

## 技術スタック

-   Next.js 15.5.5
-   TypeScript
-   Tailwind CSS
-   Socket.IO Client
-   Zustand (状態管理)
-   Framer Motion (アニメーション)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
