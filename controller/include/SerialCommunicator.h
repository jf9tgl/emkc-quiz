/**
 * @file SerialCommunicator.h
 * @brief シリアル通信管理クラス
 *
 * JSON形式でのデータ送受信を管理
 */

#ifndef SERIAL_COMMUNICATOR_H
#define SERIAL_COMMUNICATOR_H

#include <Arduino.h>
#include <ArduinoJson.h>

class SerialCommunicator
{
private:
    int baudRate;

    /**
     * @brief 現在のタイムスタンプを取得
     * @return タイムスタンプ（ミリ秒）
     */
    unsigned long getTimestamp() const;

public:
    /**
     * @brief コンストラクタ
     */
    SerialCommunicator();

    /**
     * @brief シリアル通信を初期化
     * @param baud ボーレート
     */
    void init(int baud);

    /**
     * @brief ボタン押下イベントを送信
     * @param buttonId ボタンID（1-6）
     */
    void sendButtonPress(int buttonId);

    /**
     * @brief システムリセットイベントを送信
     */
    void sendSystemReset();

    /**
     * @brief エラーメッセージを送信
     * @param errorMessage エラーメッセージ
     */
    void sendError(const char *errorMessage);

    /**
     * @brief システム準備完了メッセージを送信
     */
    void sendSystemReady();

    /**
     * @brief デバッグメッセージを送信
     * @param message デバッグメッセージ
     */
    void sendDebug(const char *message);
};

#endif // SERIAL_COMMUNICATOR_H
