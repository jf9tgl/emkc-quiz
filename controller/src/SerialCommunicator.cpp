/**
 * @file SerialCommunicator.cpp
 * @brief シリアル通信管理クラスの実装
 */

#include "SerialCommunicator.h"
#include "config.h"

SerialCommunicator::SerialCommunicator() : baudRate(9600)
{
}

void SerialCommunicator::init(int baud)
{
    baudRate = baud;
    Serial.begin(baudRate);

    // シリアルポートが接続されるまで待つ
    while (!Serial)
    {
        ; // Nanoやレオナルドでは必要
    }

    delay(100); // 安定化待ち
}

unsigned long SerialCommunicator::getTimestamp() const
{
    return millis();
}

void SerialCommunicator::sendButtonPress(int buttonId)
{
    // JSON ドキュメントを作成（スタック上に確保）
    JsonDocument doc;

    doc["type"] = "pressedButton";
    doc["buttonId"] = buttonId;
    doc["timestamp"] = getTimestamp();

    // シリアルに送信
    serializeJson(doc, Serial);
    Serial.println(); // 改行を追加

#if ENABLE_DEBUG_OUTPUT
    Serial.print(F("[DEBUG] Button "));
    Serial.print(buttonId);
    Serial.println(F(" pressed"));
#endif
}

void SerialCommunicator::sendSystemReset()
{
    JsonDocument doc;

    doc["type"] = "systemReset";
    doc["timestamp"] = getTimestamp();

    serializeJson(doc, Serial);
    Serial.println();

#if ENABLE_DEBUG_OUTPUT
    Serial.println(F("[DEBUG] System reset"));
#endif
}

void SerialCommunicator::sendError(const char *errorMessage)
{
    JsonDocument doc;

    doc["type"] = "error";
    doc["message"] = errorMessage;
    doc["timestamp"] = getTimestamp();

    serializeJson(doc, Serial);
    Serial.println();

#if ENABLE_DEBUG_OUTPUT
    Serial.print(F("[DEBUG] Error: "));
    Serial.println(errorMessage);
#endif
}

void SerialCommunicator::sendSystemReady()
{
    JsonDocument doc;

    doc["type"] = "systemReady";
    doc["timestamp"] = getTimestamp();
    doc["version"] = "1.0.0";

    serializeJson(doc, Serial);
    Serial.println();

#if ENABLE_DEBUG_OUTPUT
    Serial.println(F("[DEBUG] System ready"));
#endif
}

void SerialCommunicator::sendDebug(const char *message)
{
#if ENABLE_DEBUG_OUTPUT
    JsonDocument doc;

    doc["type"] = "debug";
    doc["message"] = message;
    doc["timestamp"] = getTimestamp();

    serializeJson(doc, Serial);
    Serial.println();
#endif
}
