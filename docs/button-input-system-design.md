# ボタン入力システム 詳細設計書

## 1. システム概要

Arduino UNOを使用してボタン入力を検出し、シリアル通信でPC側にJSON形式でデータを送信するシステム。
設定可能なピン管理クラスにより、後からボタンの配線を変更できる柔軟な設計とする。

---

## 2. ハードウェア仕様

### 対象マイコン
- Arduino UNO (ATmega328P)
- シリアル通信速度: 115,200 bps

### ボタン接続仕様
- 最大6個のボタンをサポート
- プルアップ抵抗使用（内蔵プルアップ使用可能）
- ボタン押下時：LOW（GND接続）
- ボタン開放時：HIGH（VCC接続）

### デフォルトピン配置（変更可能）
```
ボタン1: デジタルピン 2
ボタン2: デジタルピン 3
ボタン3: デジタルピン 4
ボタン4: デジタルピン 5
ボタン5: デジタルピン 6
ボタン6: デジタルピン 7
```

---

## 3. ソフトウェア設計

### 3.1 クラス構成

#### ButtonConfig クラス
ボタンのピン設定を管理するクラス

```cpp
class ButtonConfig {
private:
    static const int MAX_BUTTONS = 6;
    int buttonPins[MAX_BUTTONS];
    int resetPin;
    int buttonCount;

public:
    ButtonConfig();
    void setButtonPin(int buttonIndex, int pin);
    void setResetPin(int pin);
    int getButtonPin(int buttonIndex);
    int getResetPin();
    int getButtonCount();
    void loadDefaultConfig();
};
```

#### ButtonManager クラス
ボタン入力の検出とデバウンス処理を行うクラス

```cpp
class ButtonManager {
private:
    ButtonConfig* config;
    bool buttonStates[6];
    bool lastButtonStates[6];
    unsigned long lastDebounceTime[6];
    unsigned long debounceDelay;
    bool systemActive;

public:
    ButtonManager(ButtonConfig* buttonConfig);
    void init();
    void update();
    int checkButtonPress();
    void reset();
    bool isSystemActive();
};
```

#### SerialCommunicator クラス
JSON形式でのシリアル通信を管理するクラス

```cpp
class SerialCommunicator {
private:
    unsigned long getTimestamp();

public:
    SerialCommunicator();
    void init(int baudRate);
    void sendButtonPress(int buttonId);
    void sendSystemReset();
    void sendError(const char* errorMessage);
};
```

### 3.2 JSON通信プロトコル

#### ボタン押下イベント
```json
{
    "buttontype": "pressedButton",
    "buttonId": 1,
    "timestamp": 1234567890
}
```

#### エラーイベント
```json
{
    "buttontype": "error",
    "message": "Button configuration error",
    "timestamp": 1234567890
}
```

### 3.3 データ仕様

| フィールド | 型 | 説明 | 値の範囲 |
|-----------|-----|------|----------|
| buttontype | string | イベントタイプ | "pressedButton", "systemReset", "error" |
| buttonId | number | ボタン番号（pressedButtonのみ） | 1-6 |
| timestamp | number | タイムスタンプ（ミリ秒） | 0 - 4294967295 |
| message | string | エラーメッセージ（errorのみ） | 任意の文字列 |

---

## 4. 設定管理

### 4.1 ピン設定の変更方法

#### 方法1: ソースコードでの設定
```cpp
void setup() {
    ButtonConfig config;
    
    // カスタムピン設定
    config.setButtonPin(0, 10);  // ボタン1をピン10に
    config.setButtonPin(1, 11);  // ボタン2をピン11に
    config.setResetPin(12);      // リセットボタンをピン12に
    
    ButtonManager manager(&config);
    manager.init();
}
```

#### 方法2: 設定ヘッダーファイル
```cpp
// config.h
#ifndef CONFIG_H
#define CONFIG_H

// ボタンピン設定
#define BUTTON_1_PIN 2
#define BUTTON_2_PIN 3
#define BUTTON_3_PIN 4
#define BUTTON_4_PIN 5
#define BUTTON_5_PIN 6
#define BUTTON_6_PIN 7

// システム設定
#define DEBOUNCE_DELAY 50  // デバウンス時間（ミリ秒）
#define SERIAL_BAUD_RATE 115200

#endif
```

### 4.2 設定検証機能

```cpp
class ConfigValidator {
public:
    static bool validatePinConfig(ButtonConfig* config);
    static bool isPinAvailable(int pin);
    static void printConfigStatus(ButtonConfig* config);
};
```

---

## 5. エラーハンドリング

### 5.1 エラータイプ

1. **ピン競合エラー**: 同じピンが複数のボタンに割り当てられている
2. **無効ピンエラー**: 存在しないピン番号が指定されている
3. **通信エラー**: シリアル通信の初期化に失敗
4. **ハードウェアエラー**: ボタンの読み取りに異常がある

### 5.2 エラー処理フロー

```
エラー検出 → エラーメッセージ生成 → シリアル送信 → LED点滅（オプション）
```

---

## 6. 動作フロー

### 6.1 初期化フロー
```
1. シリアル通信初期化
2. ピン設定読み込み
3. 設定検証
4. ボタンピン初期化（INPUT_PULLUP）
5. システム準備完了通知
```

### 6.2 メインループフロー
```
1. 各ボタンの状態読み取り
2. デバウンス処理
3. 状態変化検出
4. 最初に押されたボタンを記録
5. JSON形式でシリアル送信
6. リセットボタンチェック
7. システムリセット処理（必要に応じて）
```

---

## 7. パフォーマンス要件

- **応答時間**: ボタン押下から送信まで50ms以内
- **デバウンス時間**: 50ms（設定可能）
- **同時押し対応**: 最初に押されたボタンのみを有効とする
- **メモリ使用量**: SRAM 512バイト以内

---

## 8. テスト仕様

### 8.1 単体テスト項目

1. ボタン設定クラスのピン設定・取得
2. デバウンス処理の動作確認
3. JSON形式の正確性確認
4. エラーハンドリングの動作確認

### 8.2 統合テスト項目

1. 複数ボタンの同時押し処理
2. リセット機能の動作確認
3. 長時間動作での安定性確認
4. PC側との通信確認

---

## 9. 実装上の注意点

### 9.1 タイミング考慮事項

- `millis()`関数を使用してタイムスタンプを取得
- オーバーフローは約49日後（運用上問題なし）
- デバウンス処理で`delay()`関数は使用しない

### 9.2 メモリ管理

- 文字列リテラルは`F()`マクロでFLASHメモリに格納
- 動的メモリ確保は避ける
- グローバル変数の使用を最小限に抑える

### 9.3 拡張性

- ボタン数の変更が容易な設計
- 新しいイベントタイプの追加が可能
- 設定方法の追加が容易

---

## 10. 推奨する追加機能

### 10.1 実装を推奨する機能

1. **LED表示機能**: ボタン押下時の視覚的フィードバック
2. **ブザー機能**: 音声フィードバック
3. **設定保存機能**: EEPROMを使用した設定の永続化
4. **診断機能**: ボタンの動作確認モード

### 10.2 将来的な拡張案

1. **有線/無線切り替え**: ESP32等への移植対応
2. **複数チーム対応**: より多くのボタンセットの管理
3. **ログ機能**: SDカードへのイベントログ保存
4. **Web設定画面**: ブラウザからの設定変更

---

## 付録: サンプルコード構成

```
controller/
├── src/
│   ├── main.cpp              # メイン処理
│   ├── ButtonConfig.cpp      # ボタン設定クラス
│   ├── ButtonManager.cpp     # ボタン管理クラス
│   └── SerialCommunicator.cpp # シリアル通信クラス
├── include/
│   ├── ButtonConfig.h
│   ├── ButtonManager.h
│   ├── SerialCommunicator.h
│   └── config.h              # 設定定義
└── platformio.ini            # PlatformIO設定
```

この設計書に基づいて実装することで、保守性が高く拡張可能なボタン入力システムを構築できます。