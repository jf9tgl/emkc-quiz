/**
 * @file ButtonManager.cpp
 * @brief ボタン入力管理クラスの実装
 */

#include "ButtonManager.h"
#include "config.h"

ButtonManager::ButtonManager(ButtonConfig *buttonConfig, SerialCommunicator *serialComm)
    : config(buttonConfig),
      communicator(serialComm),
      debounceDelay(DEBOUNCE_DELAY),
      systemActive(true),
      buttonPressed(false),
      firstPressedButton(0)
{

    // 配列の初期化
    for (int i = 0; i < MAX_BUTTONS; i++)
    {
        buttonStates[i] = false;
        lastButtonStates[i] = false;
        lastDebounceTime[i] = 0;
    }
}

void ButtonManager::init()
{
    // 設定の検証
    if (!config->validate())
    {
        communicator->sendError("Invalid button configuration");
        return;
    }

    // ボタンピンを入力モードで初期化（プルアップ抵抗有効）
    for (int i = 0; i < config->getButtonCount(); i++)
    {
        int pin = config->getButtonPin(i);
        if (pin >= 0)
        {
            pinMode(pin, INPUT_PULLUP);
        }
    }

    // LEDピンを出力モードで初期化
    if (config->isLedEnabled())
    {
        for (int i = 0; i < config->getButtonCount(); i++)
        {
            int ledPin = config->getLedPin(i);
            if (ledPin >= 0)
            {
                pinMode(ledPin, OUTPUT);
                digitalWrite(ledPin, LOW); // 初期状態はOFF
            }
        }
    }

#if ENABLE_DEBUG_OUTPUT
    config->printConfig();
    communicator->sendDebug("ButtonManager initialized");
#endif
}

bool ButtonManager::readButtonWithDebounce(int buttonIndex)
{
    int pin = config->getButtonPin(buttonIndex);
    if (pin < 0)
    {
        return false;
    }

    // ボタンの現在の物理状態を読み取る（LOW = 押下）
    bool reading = (digitalRead(pin) == LOW);

    // 状態が変化した場合
    if (reading != lastButtonStates[buttonIndex])
    {
        lastDebounceTime[buttonIndex] = millis();
        lastButtonStates[buttonIndex] = reading;
    }

    // デバウンス期間が経過したか確認
    if ((millis() - lastDebounceTime[buttonIndex]) > debounceDelay)
    {
        // デバウンス後の安定した状態を返す
        return reading;
    }

    // デバウンス中は前回の状態を維持
    return buttonStates[buttonIndex];
}

void ButtonManager::controlLed(int ledIndex, bool state)
{
    if (!config->isLedEnabled())
    {
        return;
    }

    int ledPin = config->getLedPin(ledIndex);
    if (ledPin >= 0)
    {
        digitalWrite(ledPin, state ? HIGH : LOW);
    }
}

void ButtonManager::update()
{
    // 各ボタンの状態をチェック
    for (int i = 0; i < config->getButtonCount(); i++)
    {
        bool currentState = readButtonWithDebounce(i);

        // 状態が変化し、かつ押下された場合
        if (currentState && !buttonStates[i])
        {
            firstPressedButton = i + 1; // 1-6のボタンID

            // イベントを送信
            communicator->sendButtonPress(firstPressedButton);

            // LEDを点灯
            controlLed(i, true);

#if ENABLE_DEBUG_OUTPUT
            communicator->sendDebug("First button pressed");
#endif
        }

        buttonStates[i] = currentState;
    }
}

void ButtonManager::reset()
{
    // 全てのボタン状態をリセット
    for (int i = 0; i < MAX_BUTTONS; i++)
    {
        buttonStates[i] = false;
        lastButtonStates[i] = false;

        // LEDを消灯
        controlLed(i, false);
    }

    buttonPressed = false;
    firstPressedButton = 0;
    systemActive = true;

    communicator->sendSystemReset();

#if ENABLE_DEBUG_OUTPUT
    communicator->sendDebug("System reset complete");
#endif
}

bool ButtonManager::isSystemActive() const
{
    return systemActive;
}

bool ButtonManager::isButtonPressed() const
{
    return buttonPressed;
}

int ButtonManager::getFirstPressedButton() const
{
    return firstPressedButton;
}

void ButtonManager::setDebounceDelay(unsigned long delay)
{
    debounceDelay = delay;
}
