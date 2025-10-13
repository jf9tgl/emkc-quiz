/**
 * @file ButtonManager.h
 * @brief ボタン入力管理クラス
 *
 * ボタンの状態監視、デバウンス処理、イベント検出を行う
 */

#ifndef BUTTON_MANAGER_H
#define BUTTON_MANAGER_H

#include <Arduino.h>
#include "ButtonConfig.h"
#include "SerialCommunicator.h"

class ButtonManager
{
private:
    ButtonConfig *config;
    SerialCommunicator *communicator;

    bool buttonStates[MAX_BUTTONS];              // 現在のボタン状態
    bool lastButtonStates[MAX_BUTTONS];          // 前回のボタン状態
    unsigned long lastDebounceTime[MAX_BUTTONS]; // 最後のデバウンス時刻
    unsigned long debounceDelay;                 // デバウンス遅延時間

    bool systemActive;      // システムアクティブ状態
    bool buttonPressed;     // いずれかのボタンが押されたか
    int firstPressedButton; // 最初に押されたボタンID

    /**
     * @brief デバウンス処理を行いながらボタン状態を読み取る
     * @param buttonIndex ボタンのインデックス
     * @return デバウンス後のボタン状態
     */
    bool readButtonWithDebounce(int buttonIndex);

    /**
     * @brief LEDを制御
     * @param ledIndex LEDのインデックス
     * @param state LEDの状態（HIGH/LOW）
     */
    void controlLed(int ledIndex, bool state);

public:
    /**
     * @brief コンストラクタ
     * @param buttonConfig ボタン設定
     * @param serialComm シリアル通信管理
     */
    ButtonManager(ButtonConfig *buttonConfig, SerialCommunicator *serialComm);

    /**
     * @brief 初期化処理
     */
    void init();

    /**
     * @brief メインループで呼び出す更新処理
     */
    void update();

    /**
     * @brief システムをリセット
     */
    void reset();

    /**
     * @brief システムがアクティブかどうかを取得
     * @return true: アクティブ, false: 非アクティブ
     */
    bool isSystemActive() const;

    /**
     * @brief いずれかのボタンが押されているかを取得
     * @return true: 押されている, false: 押されていない
     */
    bool isButtonPressed() const;

    /**
     * @brief 最初に押されたボタンIDを取得
     * @return ボタンID（1-6）、押されていない場合は0
     */
    int getFirstPressedButton() const;

    /**
     * @brief デバウンス時間を設定
     * @param delay デバウンス時間（ミリ秒）
     */
    void setDebounceDelay(unsigned long delay);
};

#endif // BUTTON_MANAGER_H
