/**
 * @file ButtonConfig.cpp
 * @brief ボタン設定管理クラスの実装
 */

#include "ButtonConfig.h"

ButtonConfig::ButtonConfig() : buttonCount(MAX_BUTTONS), ledEnabled(ENABLE_LED_FEEDBACK)
{
    loadDefaultConfig();
}

bool ButtonConfig::setButtonPin(int buttonIndex, int pin)
{
    if (buttonIndex < 0 || buttonIndex >= MAX_BUTTONS_COUNT)
    {
        return false;
    }
    if (pin < 0 || pin > 19)
    { // Arduino UNOは0-19ピン
        return false;
    }
    buttonPins[buttonIndex] = pin;
    return true;
}

bool ButtonConfig::setLedPin(int ledIndex, int pin)
{
    if (ledIndex < 0 || ledIndex >= MAX_BUTTONS_COUNT)
    {
        return false;
    }
    if (pin < 0 || pin > 19)
    {
        return false;
    }
    ledPins[ledIndex] = pin;
    return true;
}

int ButtonConfig::getButtonPin(int buttonIndex) const
{
    if (buttonIndex < 0 || buttonIndex >= MAX_BUTTONS_COUNT)
    {
        return -1;
    }
    return buttonPins[buttonIndex];
}

int ButtonConfig::getLedPin(int ledIndex) const
{
    if (ledIndex < 0 || ledIndex >= MAX_BUTTONS_COUNT)
    {
        return -1;
    }
    return ledPins[ledIndex];
}

int ButtonConfig::getButtonCount() const
{
    return buttonCount;
}

void ButtonConfig::setLedEnabled(bool enabled)
{
    ledEnabled = enabled;
}

bool ButtonConfig::isLedEnabled() const
{
    return ledEnabled;
}

void ButtonConfig::loadDefaultConfig()
{
    // デフォルトのボタンピン設定
    buttonPins[0] = BUTTON_1_PIN;
    buttonPins[1] = BUTTON_2_PIN;
    buttonPins[2] = BUTTON_3_PIN;
    buttonPins[3] = BUTTON_4_PIN;
    buttonPins[4] = BUTTON_5_PIN;
    buttonPins[5] = BUTTON_6_PIN;

    // デフォルトのLEDピン設定
    ledPins[0] = LED_1_PIN;
    ledPins[1] = LED_2_PIN;
    ledPins[2] = LED_3_PIN;
    ledPins[3] = LED_4_PIN;
    ledPins[4] = LED_5_PIN;
    ledPins[5] = LED_6_PIN;
}

bool ButtonConfig::validate() const
{
    // ピンの重複チェック
    for (int i = 0; i < buttonCount; i++)
    {
        for (int j = i + 1; j < buttonCount; j++)
        {
            if (buttonPins[i] == buttonPins[j])
            {
                return false; // ボタンピンが重複
            }
        }

        if (ledEnabled)
        {
            // ボタンピンとLEDピンの重複チェック
            if (buttonPins[i] == ledPins[i])
            {
                return false;
            }
        }
    }

    return true;
}

void ButtonConfig::printConfig() const
{
    Serial.println(F("=== Button Configuration ==="));
    Serial.print(F("Button Count: "));
    Serial.println(buttonCount);
    Serial.print(F("LED Enabled: "));
    Serial.println(ledEnabled ? F("Yes") : F("No"));

    for (int i = 0; i < buttonCount; i++)
    {
        Serial.print(F("Button "));
        Serial.print(i + 1);
        Serial.print(F(": Pin "));
        Serial.print(buttonPins[i]);

        if (ledEnabled)
        {
            Serial.print(F(", LED Pin "));
            Serial.print(ledPins[i]);
        }
        Serial.println();
    }

    Serial.print(F("Valid: "));
    Serial.println(validate() ? F("Yes") : F("No"));
    Serial.println(F("=========================="));
}
