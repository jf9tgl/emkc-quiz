# クイズシステム バックエンドサーバー

## 概要

Arduino を用いた早押しクイズシステムのバックエンドサーバーです。

## 使用方法

### 開発モード

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### EXE 化

```bash
npm run package
```

## コマンドラインオプション

### 基本的な使用方法

```bash
server.exe [オプション]
```

### オプション一覧

| オプション    | 短縮形 | 説明                         | デフォルト値 | 例            |
| ------------- | ------ | ---------------------------- | ------------ | ------------- |
| `--port`      | `-p`   | サーバーポート番号           | 3001         | `--port 3002` |
| `--com`       | `-c`   | COM ポート名                 | 自動検出     | `--com COM3`  |
| `--simulator` | `-s`   | Arduino シミュレーターを使用 | false        | `--simulator` |
| `--help`      | `-h`   | ヘルプを表示                 | -            | `--help`      |

### 使用例

#### 1. デフォルト設定で起動

```bash
server.exe
```

-   ポート: 3001
-   COM ポート: 自動検出

#### 2. カスタムポートで起動

```bash
server.exe --port 3002
```

#### 3. COM ポートを指定して起動

```bash
server.exe --com COM5
```

#### 4. ポートと COM ポートの両方を指定

```bash
server.exe --port 3002 --com COM5
```

#### 5. シミュレーターモードで起動

```bash
server.exe --simulator
```

## 環境変数

`.env`ファイルで設定可能：

```env
PORT=3001
COM_PORT=COM3
USE_SIMULATOR=false
```

**注意**: コマンドライン引数は環境変数より優先されます。

## 接続方法

### フロントエンド接続

サーバー起動後、以下の URL でフロントエンドと接続：

-   `http://localhost:3001` (デフォルト)
-   カスタムポートの場合: `http://localhost:<指定したポート>`

### Arduino 接続

-   **自動検出**: COM ポートを指定しない場合、自動的に Arduino を検出
-   **手動指定**: `--com`オプションで COM ポートを指定
-   **シミュレーター**: `--simulator`オプションで開発用シミュレーターを使用

## トラブルシューティング

### COM ポートが見つからない場合

```bash
# COMポートを手動で指定
server.exe --com COM3
```

### ポートが既に使用されている場合

```bash
# 別のポートを指定
server.exe --port 3002
```

### ヘルプの表示

```bash
server.exe --help
```

## 配布用パッケージ

EXE 化後、以下のファイルをまとめて配布：

1. `target/server.exe`
2. `.env` (オプション、設定が必要な場合)

## 開発者向け情報

-   **TypeScript**: `server.ts`
-   **ビルド出力**: `dist/server.js`
-   **EXE 出力**: `target/server.exe`
-   **ビルド設定**: `tsconfig.build.json`
