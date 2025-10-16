/**
 * @file config.h
 * @brief システム設定定義ファイル
 *
 * ボタンピン配置やシステムパラメータを定義
 */

#ifndef CONFIG_H
#define CONFIG_H

// ===== ボタンピン設定 =====
#define BUTTON_1_PIN A2
#define BUTTON_2_PIN A4
#define BUTTON_3_PIN A1
#define BUTTON_4_PIN A3
#define BUTTON_5_PIN A5
#define BUTTON_6_PIN A0

// ===== システム設定 =====
#define MAX_BUTTONS 6     // 最大ボタン数
#define DEBOUNCE_DELAY 50 // デバウンス時間（ミリ秒）

// ===== LED設定（オプション） =====
#define LED_1_PIN 2
#define LED_2_PIN 3
#define LED_3_PIN 4
#define LED_4_PIN 5
#define LED_5_PIN 2
#define LED_6_PIN 3

// ===== 機能フラグ =====
#define ENABLE_LED_FEEDBACK true  // LED表示を有効化
#define ENABLE_DEBUG_OUTPUT false // デバッグ出力を有効化

#endif // CONFIG_H
