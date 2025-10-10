#include <Arduino.h>
#include <ArduinoJson.h>

// ===== 設定 =====
const int MAX_BUTTONS = 6;
const int BUTTON_PINS[MAX_BUTTONS] = {2, 3, 4, 5, 6, 7}; // 後から変更可能
const unsigned long DEBOUNCE_DELAY = 50;                 // デバウンス時間（ミリ秒）
const int SERIAL_BAUD_RATE = 115200;

// ===== グローバル変数 =====
bool buttonStates[MAX_BUTTONS];              // 現在のボタン状態
bool lastButtonStates[MAX_BUTTONS];          // 前回のボタン状態
unsigned long lastDebounceTime[MAX_BUTTONS]; // 最後のデバウンス時間
bool systemActive = true;                    // システムが有効かどうか

// ===== 関数プロトタイプ =====
void initializeButtons();
void updateButtons();
int checkButtonPress();
void sendButtonPress(int buttonId);
void sendSystemReset();
void sendError(const char *errorMessage);
unsigned long getTimestamp();

// ===== セットアップ =====
void setup()
{
    // シリアル通信初期化
    Serial.begin(SERIAL_BAUD_RATE);

    // 接続されるまで待機
    while (!Serial)
    {
        ; // シリアルポートが接続されるのを待つ
    }

    // ボタン初期化
    initializeButtons();

    delay(100); // 安定化のための短い待機
}

// ===== メインループ =====
void loop()
{
    updateButtons();

    if (systemActive)
    {
        int pressedButton = checkButtonPress();
        if (pressedButton >= 0)
        {
            sendButtonPress(pressedButton + 1); // 1ベースのボタン番号で送信
            systemActive = false;               // 最初のボタンが押されたらシステムを無効化
        }
    }

    delay(10); // CPU負荷軽減
}

// ===== ボタン初期化 =====
void initializeButtons()
{
    for (int i = 0; i < MAX_BUTTONS; i++)
    {
        pinMode(BUTTON_PINS[i], INPUT_PULLUP);
        buttonStates[i] = HIGH;
        lastButtonStates[i] = HIGH;
        lastDebounceTime[i] = 0;
    }
}

// ===== ボタン状態更新（デバウンス処理込み） =====
void updateButtons()
{
    unsigned long currentTime = millis();

    for (int i = 0; i < MAX_BUTTONS; i++)
    {
        int reading = digitalRead(BUTTON_PINS[i]);

        // 状態が変化した場合、デバウンスタイマーをリセット
        if (reading != lastButtonStates[i])
        {
            lastDebounceTime[i] = currentTime;
        }

        // デバウンス時間が経過した場合、状態を更新
        if ((currentTime - lastDebounceTime[i]) > DEBOUNCE_DELAY)
        {
            if (reading != buttonStates[i])
            {
                buttonStates[i] = reading;
            }
        }

        lastButtonStates[i] = reading;
    }
}

// ===== ボタン押下チェック =====
int checkButtonPress()
{
    for (int i = 0; i < MAX_BUTTONS; i++)
    {
        if (buttonStates[i] == LOW)
        {             // ボタンが押された（プルアップなのでLOW）
            return i; // 最初に見つかったボタンのインデックスを返す
        }
    }
    return -1; // ボタンが押されていない
}

// ===== ボタン押下JSON送信 =====
void sendButtonPress(int buttonId)
{
    // JSONオブジェクト作成
    StaticJsonDocument<128> doc;
    doc["buttontype"] = "pressedButton";
    doc["buttonId"] = buttonId;
    doc["timestamp"] = getTimestamp();

    // JSON文字列として送信
    serializeJson(doc, Serial);
    Serial.println(); // 改行を追加
}

// ===== システムリセットJSON送信 =====
void sendSystemReset()
{
    StaticJsonDocument<128> doc;
    doc["buttontype"] = "systemReset";
    doc["timestamp"] = getTimestamp();

    serializeJson(doc, Serial);
    Serial.println();

    // システムをリセット
    systemActive = true;

    // ボタン状態をクリア
    for (int i = 0; i < MAX_BUTTONS; i++)
    {
        buttonStates[i] = HIGH;
        lastButtonStates[i] = HIGH;
    }
}

// ===== エラーメッセージJSON送信 =====
void sendError(const char *errorMessage)
{
    StaticJsonDocument<256> doc;
    doc["buttontype"] = "error";
    doc["message"] = errorMessage;
    doc["timestamp"] = getTimestamp();

    serializeJson(doc, Serial);
    Serial.println();
}

// ===== タイムスタンプ取得 =====
unsigned long getTimestamp()
{
    return millis();
}

// ===== シリアルコマンド処理（オプション） =====
void serialEvent()
{
    if (Serial.available())
    {
        String command = Serial.readStringUntil('\n');
        command.trim();

        if (command == "RESET")
        {
            sendSystemReset();
        }
        else if (command == "STATUS")
        {
            // システム状態を送信
            StaticJsonDocument<128> doc;
            doc["buttontype"] = "status";
            doc["systemActive"] = systemActive;
            doc["timestamp"] = getTimestamp();

            serializeJson(doc, Serial);
            Serial.println();
        }
    }
}
