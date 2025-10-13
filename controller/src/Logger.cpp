/**
 * @file Logger.cpp
 * @brief ロガークラスの実装
 *
 * このファイルは、Arduino環境でのログ出力を管理するLoggerクラスの実装です。
 * ログレベルに応じて、情報、デバッグ、警告、エラー、致命的なエラーメッセージを出力します。
 */

#include "Logger.hpp"
#include <Arduino.h>

/**
 * @brief ロガーの初期化
 *
 * Serialポートを初期化します（まだ初期化されていない場合）
 */
void Logger::setup()
{
    // Serialが初期化されていない場合のみ初期化
    if (!Serial)
    {

    }
}

/**
 * @brief 情報レベルのログ出力（std::string版）
 *
 * @param message ログメッセージ
 */
void Logger::info(const std::string &message)
{
    log(message.c_str(), "INFO");
}

/**
 * @brief 情報レベルのログ出力（const char*版）
 *
 * @param message ログメッセージ
 */
void Logger::info(const char *message)
{
    log(message, "INFO");
}

/**
 * @brief デバッグレベルのログ出力（std::string版）
 *
 * @param message ログメッセージ
 */
void Logger::debug(const std::string &message)
{
#ifdef DEBUG
    log(message.c_str(), "DEBUG");
#endif
}

/**
 * @brief デバッグレベルのログ出力（const char*版）
 *
 * @param message ログメッセージ
 */
void Logger::debug(const char *message)
{
#ifdef DEBUG
    log(message, "DEBUG");
#endif
}

/**
 * @brief 警告レベルのログ出力（std::string版）
 *
 * @param message ログメッセージ
 */
void Logger::warn(const std::string &message)
{
    log(message.c_str(), "WARN");
}

/**
 * @brief 警告レベルのログ出力（const char*版）
 *
 * @param message ログメッセージ
 */
void Logger::warn(const char *message)
{
    log(message, "WARN");
}

/**
 * @brief エラーレベルのログ出力（std::string版）
 *
 * @param message ログメッセージ
 */
void Logger::error(const std::string &message)
{
    log(message.c_str(), "ERROR");
}

/**
 * @brief エラーレベルのログ出力（const char*版）
 *
 * @param message ログメッセージ
 */
void Logger::error(const char *message)
{
    log(message, "ERROR");
}

/**
 * @brief 致命的エラーレベルのログ出力（std::string版）
 *
 * @param message ログメッセージ
 */
void Logger::fatal(const std::string &message)
{
    log(message.c_str(), "FATAL");
}

/**
 * @brief 致命的エラーレベルのログ出力（const char*版）
 *
 * @param message ログメッセージ
 */
void Logger::fatal(const char *message)
{
    log(message, "FATAL");
}

/**
 * @brief 基本的なログ出力処理
 *
 * @param message ログメッセージ
 * @param level ログレベル
 */
void Logger::log(const char *message, const char *level)
{
    char *prefix = createPrefix(level, message);
    Serial.println(prefix);
    Serial.flush();
    delete[] prefix;
}

/**
 * @brief ログメッセージのプレフィックスを作成
 *
 * @param level ログレベル
 * @param message ログメッセージ
 * @return char* フォーマット済みのログメッセージ
 */
char *Logger::createPrefix(const char *level, const char *message)
{
    // タイムスタンプ、レベル、モジュール名、メッセージを含む形式
    // 例: "12345 [INFO] [ModuleName] Message"

    unsigned long timestamp = millis(); // size_t → unsigned long に変更

    // バッファサイズを正確に計算（余裕を持たせる）
    size_t timestampLen = 10; // 最大10桁
    size_t levelLen = strlen(level);
    size_t nameLen = name.length();
    size_t messageLen = strlen(message);

    // フォーマット文字列の固定部分: " [] [] " + null terminator
    size_t formatOverhead = 6 + 1;
    size_t bufferSize = timestampLen + levelLen + nameLen + messageLen + formatOverhead + 10; // 安全マージン

    char *buffer = new char[bufferSize];

    // バッファを初期化
    memset(buffer, 0, bufferSize);

    int written = snprintf(buffer, bufferSize, "%lu [%s] [%s] %s",
                           timestamp, level, name.c_str(), message);

    // 書き込みが正常に完了したか確認
    if (written < 0 || written >= (int)bufferSize)
    {
        // エラーの場合は安全なメッセージに置き換え
        delete[] buffer;
        const char *errorMsg = "LOG_FORMAT_ERROR";
        buffer = new char[strlen(errorMsg) + 1];
        strcpy(buffer, errorMsg);
    }

    return buffer;
}
