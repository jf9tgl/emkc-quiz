/**
 * @file main.cpp
 * @brief 早押しボタンシステム メインプログラム
 *
 * Arduino UNOを使用した6人対応の早押しボタンシステム
 * 設計書に基づき、クラスベースで実装
 *
 * @author Quiz System Team
 * @date 2025-10-10
 * @version 1.0.0
 */

#include <Arduino.h>
#include "config.h"
#include "ButtonConfig.h"
#include "ButtonManager.h"
#include "SerialCommunicator.h"
#include "Logger.hpp"

// ===== グローバルオブジェクト =====
ButtonConfig buttonConfig;
SerialCommunicator serialComm;
ButtonManager buttonManager(&buttonConfig, &serialComm);
Logger logger = Logger("Main");

// ===== リセット用の変数 =====
unsigned long lastResetCheck = 0;
const unsigned long RESET_CHECK_INTERVAL = 100; // リセットチェック間隔（ミリ秒）

// ===== シリアルコマンド処理用バッファ =====
String inputBuffer = "";

/**
 * @brief シリアルコマンドを処理
 *
 * PCからのコマンドを受信して処理
 * - "RESET": システムをリセット
 * - "STATUS": 現在の状態を送信
 * - "CONFIG": 設定情報を送信
 */
void processSerialCommand()
{
    if (Serial.available() > 0)
    {
        char receivedChar = Serial.read();

        if (receivedChar == '\n' || receivedChar == '\r')
        {
            if (inputBuffer.length() > 0)
            {
                // コマンド処理
                inputBuffer.trim();

                if (inputBuffer.equals("RESET"))
                {
                    buttonManager.reset();
                }
                else if (inputBuffer.equals("STATUS"))
                {
                    JsonDocument doc;
                    doc["type"] = "status";
                    doc["active"] = buttonManager.isSystemActive();
                    doc["pressed"] = buttonManager.isButtonPressed();
                    doc["firstButton"] = buttonManager.getFirstPressedButton();
                    doc["timestamp"] = millis();

                    serializeJson(doc, Serial);
                    logger.debug("Sent status update");
                }
                else if (inputBuffer.equals("CONFIG"))
                {
#if ENABLE_DEBUG_OUTPUT
                    buttonConfig.printConfig();
#else
                    JsonDocument doc;
                    doc["type"] = "config";
                    doc["buttonCount"] = buttonConfig.getButtonCount();
                    doc["ledEnabled"] = buttonConfig.isLedEnabled();
                    doc["timestamp"] = millis();

                    serializeJson(doc, Serial);
                    logger.debug("Sent config update");
#endif
                }
                else
                {
                    serialComm.sendError("Unknown command");
                }

                inputBuffer = "";
            }
        }
        else
        {
            inputBuffer += receivedChar;
        }
    }
}

/**
 * @brief 初期化処理
 *
 * システム起動時に1回だけ実行される
 * - シリアル通信の初期化
 * - ボタン設定の読み込み
 * - ボタンマネージャーの初期化
 */
void setup()
{
    // シリアル通信初期化
    serialComm.init(9600);

    // 起動メッセージ
    logger.debug("");
    logger.debug("====================================");
    logger.debug("  Quiz Button System v1.0.0");
    logger.debug("  Based on detailed design spec");
    logger.debug("====================================");
    logger.debug("");

    // デフォルト設定を読み込み
    buttonConfig.loadDefaultConfig();

    // カスタム設定がある場合はここで設定
    // 例: buttonConfig.setButtonPin(0, 10);

    // 設定の検証
    if (!buttonConfig.validate())
    {
        serialComm.sendError("Configuration validation failed");
        logger.debug("[ERROR] Invalid configuration detected!");
        while (1)
        {
            // 設定エラーの場合は停止
            delay(1000);
        }
    }

    // ボタンマネージャー初期化
    buttonManager.init();

    // システム準備完了を通知
    serialComm.sendSystemReady();

    logger.debug("System ready. Waiting for button press...");
    logger.debug("Commands: RESET, STATUS, CONFIG");
}

/**
 * @brief メインループ
 *
 * 繰り返し実行される処理
 * - ボタン状態の監視
 * - シリアルコマンドの処理
 */
void loop()
{
    // ボタン状態を更新
    buttonManager.update();

    // シリアルコマンドを処理
    processSerialCommand();

    // CPU負荷軽減のため少し待機
    delay(10);
}
