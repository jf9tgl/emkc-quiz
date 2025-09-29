# 🎤 文化祭クイズシステム

文化祭の体育館ステージで使用する**6 人対応早押しクイズシステム**です。
Arduino 早押しボタンと Web アプリケーションを連携させた本格的なクイズ番組風システムです。

## ✨ 特徴

-   **6 人同時対応**: 早押しボタンで最大 6 人まで同時参加可能
-   **リアルタイム表示**: 押した瞬間に画面に反映、効果音付き
-   **2 画面対応**: コントロール画面（PC）と表示画面（プロジェクター）
-   **スコア管理**: 加点・減点機能でゲーム進行をサポート
-   **押し順記録**: 誰が何番目に押したかを正確に記録
-   **カスタマイズ可能**: プレイヤー名変更、スタイル調整が簡単

## 🎯 システム構成

```
Arduino (早押しボタン)
    ↓ USB Serial
Node.js サーバー
    ↓ WebSocket
Next.js クライアント
    ├─ /control  (司会者用)
    └─ /display  (観客用大画面)
```

## 🚀 クイックスタート

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd emkc-quiz
```

### 2. サーバー起動

```bash
cd server
npm install
npm start
```

### 3. クライアント起動

```bash
cd client
npm install
npm run dev
```

### 4. ブラウザで確認

-   コントロール画面: http://localhost:3000/control
-   表示画面: http://localhost:3000/display

詳細な設定手順は [SETUP.md](./SETUP.md) をご覧ください。

## 📱 画面説明

### コントロール画面 (`/control`)

司会者が操作する画面です：

-   問題文の入力・出題
-   プレイヤー名の変更
-   スコアの調整（±10 点）
-   ゲーム状態のリセット
-   回答順序の確認

### 表示画面 (`/display`)

観客・参加者向けの大画面表示です：

-   問題文の大きな表示
-   プレイヤー情報（名前・スコア）
-   早押し結果のリアルタイム表示
-   視覚的効果（色変化・アニメーション）
-   効果音再生

## 🔧 Arduino 配線図

```
Arduino Uno
├─ D2  ← プレイヤー1ボタン (10kΩプルアップ)
├─ D3  ← プレイヤー2ボタン (10kΩプルアップ)
├─ D4  ← プレイヤー3ボタン (10kΩプルアップ)
├─ D5  ← プレイヤー4ボタン (10kΩプルアップ)
├─ D6  ← プレイヤー5ボタン (10kΩプルアップ)
├─ D7  ← プレイヤー6ボタン (10kΩプルアップ)
├─ D8  ← リセットボタン   (10kΩプルアップ)
├─ D9  → LED1 (オプション)
├─ D10 → LED2 (オプション)
├─ D11 → LED3 (オプション)
├─ D12 → LED4 (オプション)
├─ A0  → LED5 (オプション)
└─ A1  → LED6 (オプション)
```

## 🛠️ 技術スタック

-   **Frontend**: Next.js, React, CSS Modules
-   **Backend**: Node.js, Express, Socket.io
-   **Communication**: WebSocket (リアルタイム通信)
-   **Hardware**: Arduino Uno, Serial Communication
-   **Styling**: CSS3, Animations, Responsive Design

## 📂 プロジェクト構造

```
emkc-quiz/
├── arduino/           # Arduino スケッチ
│   └── quiz_button.ino
├── server/           # Node.js サーバー
│   ├── package.json
│   └── server.js
├── client/           # Next.js クライアント
│   ├── package.json
│   ├── pages/
│   │   ├── index.js     # ホーム
│   │   ├── control.js   # コントロール画面
│   │   └── display.js   # 表示画面
│   └── styles/
├── docs/
│   └── sekkeisyo.md    # 設計書
├── SETUP.md           # セットアップ手順
└── README.md
```

## 🎨 カスタマイズ

### プレイヤー名の変更

コントロール画面で直接編集可能

### スタイルの変更

`client/styles/` 内の CSS ファイルを編集

### 効果音の調整

`client/pages/display.js` の `playButtonSound` 関数をカスタマイズ

## 🐛 トラブルシューティング

よくある問題と解決方法は [SETUP.md](./SETUP.md) のトラブルシューティング項目をご確認ください。

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

バグ報告や機能要望は Issue でお知らせください。
プルリクエストも歓迎です！

---

**文化祭クイズ大会を盛り上げましょう！** 🎉
