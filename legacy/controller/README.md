# 早押しボタンシステム - Controller ディレクトリ

## 概要

Arduino UNO を使用した 6 人対応の早押しボタンシステムのファームウェアです。
PlatformIO を使用して開発されており、詳細設計書に基づいて実装されています。

## 機能

-   **6 人同時対応**: 最大 6 個のボタン入力を監視
-   **デバウンス処理**: 50ms のデバウンス処理で誤検出を防止
-   **JSON 通信**: シリアル通信で JSON 形式のイベントを送信
-   **LED 表示**: 各ボタンに対応した LED でフィードバック（オプション）
-   **設定可能**: ピン配置を簡単にカスタマイズ可能
-   **コマンド対応**: シリアル経由でリセット・状態確認が可能

## プロジェクト構造

````
controller/
├── include/              # ヘッダーファイル
│   ├── config.h         # システム設定
│   ├── ButtonConfig.h   # ボタン設定クラス
│   ├── ButtonManager.h  # ボタン管理クラス
│   └── SerialCommunicator.h  # シリアル通信クラス
├── src/                 # ソースファイル
│   ├── main.cpp         # メイン処理
│   ├── ButtonConfig.cpp
│   ├── ButtonManager.cpp
│   └── SerialCommunicator.cpp
├── lib/                 # ライブラリ
├── test/                # テストコード
├── platformio.ini       # PlatformIO設定
└── wokwi.toml          # Wokwiシミュレーション設定

## ビルド・アップロード

### PlatformIO CLIを使用

```bash
# ビルド
pio run

# アップロード
pio run --target upload

# シリアルモニター
pio device monitor
````

### VS Code を使用

1. PlatformIO 拡張機能をインストール
2. プロジェクトを開く
3. 下部のツールバーから「Build」「Upload」を実行

## 設定のカスタマイズ

### ピン配置の変更

`include/config.h` を編集:

```cpp
// ボタンピン設定
#define BUTTON_1_PIN 2
#define BUTTON_2_PIN 3
// ... 以下同様

// LEDピン設定
#define LED_1_PIN 8
#define LED_2_PIN 9
// ... 以下同様
```

### デバウンス時間の変更

```cpp
#define DEBOUNCE_DELAY 50  // ミリ秒
```

### デバッグ出力の有効化

```cpp
#define ENABLE_DEBUG_OUTPUT true
```

## JSON 通信プロトコル

### ボタン押下イベント（Arduino → PC）

```json
{
    "type": "pressedButton",
    "buttonId": 1,
    "timestamp": 1234567890
}
```

### システムリセットイベント（Arduino → PC）

```json
{
    "type": "systemReset",
    "timestamp": 1234567890
}
```

### エラーイベント（Arduino → PC）

```json
{
    "type": "error",
    "message": "Error description",
    "timestamp": 1234567890
}
```

### システム準備完了（Arduino → PC）

```json
{
    "type": "systemReady",
    "timestamp": 1234567890,
    "version": "1.0.0"
}
```

## シリアルコマンド（PC → Arduino）

Arduino 側で以下のコマンドを受け付けます:

-   `RESET`: システムをリセット
-   `STATUS`: 現在の状態を返す
-   `CONFIG`: 設定情報を返す

### 使用例

```bash
# シリアルモニターで
RESET

# レスポンス
{"type":"systemReset","timestamp":12345}
```

## 配線図

### 標準構成

```
Arduino UNO
├─ D2  ← ボタン1 (10kΩプルアップ)
├─ D3  ← ボタン2 (10kΩプルアップ)
├─ D4  ← ボタン3 (10kΩプルアップ)
├─ D5  ← ボタン4 (10kΩプルアップ)
├─ D6  ← ボタン5 (10kΩプルアップ)
├─ D7  ← ボタン6 (10kΩプルアップ)
├─ D8  → LED1 (330Ω抵抗)
├─ D9  → LED2 (330Ω抵抗)
├─ D10 → LED3 (330Ω抵抗)
├─ D11 → LED4 (330Ω抵抗)
├─ D12 → LED5 (330Ω抵抗)
└─ D13 → LED6 (330Ω抵抗)
```

### ボタンの配線方法

各ボタンは以下のように配線:

```
         +5V
          |
         10kΩ
          |
          ├─── Arduinoピン
          |
        Button
          |
         GND
```

内蔵プルアップ抵抗を使用するため、外部抵抗は不要です。

## トラブルシューティング

### ボタンが反応しない

1. 配線を確認
2. `CONFIG`コマンドで設定を確認
3. デバッグ出力を有効にして詳細を確認

### シリアル通信ができない

1. ボーレートを確認（115200）
2. USB ケーブルを確認
3. デバイスマネージャーで COM ポートを確認

### 複数のボタンが同時に反応する

1. デバウンス時間を調整
2. 配線の接触を確認
3. プルアップ抵抗を確認

## 開発情報

-   **Platform**: PlatformIO
-   **Framework**: Arduino
-   **Board**: Arduino UNO (ATmega328P)
-   **Language**: C++
-   **Dependencies**: ArduinoJson v7.4.2

## ライセンス

MIT License

## 参考資料

-   [詳細設計書](../docs/button-input-system-design.md)
-   [PlatformIO Documentation](https://docs.platformio.org/)
-   [ArduinoJson Documentation](https://arduinojson.org/)
