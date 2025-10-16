# server

## インストール

```bash
npm install
```

## 起動方法

### サーバーオンリーモード（推奨）

Arduino なしで、タブレットボタンのみで動作します。

```bash
npm run dev:server-only
```

または

```bash
npm run dev -- --server-only
```

### Arduino シミュレーターモード

Wokwi シミュレーター（ポート 4000）に接続します。

```bash
npm run dev -- --simulator
```

### Arduino 接続モード

実際の Arduino デバイスに接続します。

```bash
npm run dev -- --com COM3
```

COM ポートを指定しない場合は自動検出を試みます。

## コマンドラインオプション

-   `-p, --port <番号>` - サーバーポート番号（デフォルト: 3001）
-   `-c, --com <ポート>` - COM ポート名（例: COM3）
-   `-s, --simulator` - Arduino シミュレーターを使用
-   `-so, --server-only` - **Arduino なしでサーバーのみ起動（タブレット専用）**
-   `-h, --help` - ヘルプを表示

## 環境変数

`.env`ファイルで設定可能：

-   `PORT` - サーバーポート番号
-   `COM_PORT` - COM ポート名
-   `USE_SIMULATOR` - シミュレーター使用フラグ（true/false）
-   `SERVER_ONLY` - サーバーオンリーモード（true/false）

## 使用例

```bash
# サーバーオンリーモード（タブレットのみ）
npm run dev:server-only

# ポート指定
npm run dev -- --port 3002

# COMポート指定
npm run dev -- --com COM5

# シミュレーター使用
npm run dev -- --simulator

# 複数オプション組み合わせ
npm run dev -- --port 3002 --server-only
```
