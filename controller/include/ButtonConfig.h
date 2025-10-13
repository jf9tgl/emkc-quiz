/**
 * @file ButtonConfig.h
 * @brief ボタン設定管理クラス
 *
 * ボタンのピン配置を管理し、設定の変更・取得機能を提供
 */

#ifndef BUTTON_CONFIG_H
#define BUTTON_CONFIG_H

#include <Arduino.h>
#include "config.h"

class ButtonConfig
{
private:
    static const int MAX_BUTTONS_COUNT = MAX_BUTTONS;
    int buttonPins[MAX_BUTTONS_COUNT];
    int ledPins[MAX_BUTTONS_COUNT];
    int buttonCount;
    bool ledEnabled;

public:
    /**
     * @brief コンストラクタ - デフォルト設定で初期化
     */
    ButtonConfig();

    /**
     * @brief 指定されたボタンのピン番号を設定
     * @param buttonIndex ボタンのインデックス（0-5）
     * @param pin ピン番号
     * @return 設定成功: true, 失敗: false
     */
    bool setButtonPin(int buttonIndex, int pin);

    /**
     * @brief 指定されたLEDのピン番号を設定
     * @param ledIndex LEDのインデックス（0-5）
     * @param pin ピン番号
     * @return 設定成功: true, 失敗: false
     */
    bool setLedPin(int ledIndex, int pin);

    /**
     * @brief 指定されたボタンのピン番号を取得
     * @param buttonIndex ボタンのインデックス（0-5）
     * @return ピン番号（無効な場合は-1）
     */
    int getButtonPin(int buttonIndex) const;

    /**
     * @brief 指定されたLEDのピン番号を取得
     * @param ledIndex LEDのインデックス（0-5）
     * @return ピン番号（無効な場合は-1）
     */
    int getLedPin(int ledIndex) const;

    /**
     * @brief ボタン数を取得
     * @return ボタン数
     */
    int getButtonCount() const;

    /**
     * @brief LED機能の有効/無効を設定
     * @param enabled true: 有効, false: 無効
     */
    void setLedEnabled(bool enabled);

    /**
     * @brief LED機能が有効かどうかを取得
     * @return true: 有効, false: 無効
     */
    bool isLedEnabled() const;

    /**
     * @brief デフォルト設定を読み込み
     */
    void loadDefaultConfig();

    /**
     * @brief ピン設定が有効かどうかを検証
     * @return true: 有効, false: 無効
     */
    bool validate() const;

    /**
     * @brief 設定情報をシリアルに出力（デバッグ用）
     */
    void printConfig() const;
};

#endif // BUTTON_CONFIG_H
