/**
 * @file Logger.hpp
 * @author 渡辺 拓海 (Watanabe Takumi) 電子機械工学部 R6年度生
 * @brief ロガークラスのヘッダーファイル
 * @version 0.1
 * @date 2025-07-09
 *
 * @copyright Copyright (c) 2025
 *
 * このファイルは、Arduino環境でのログ出力を管理するLoggerクラスのヘッダーファイルです。
 * ログレベルに応じて、情報、デバッグ、警告、エラー、致命的なエラーメッセージを出力します。
 * 使用するには、Loggerクラスのインスタンスを作成し、必要なログメソッドを呼び出します。
 */

#ifndef LOGGER_HPP
#define LOGGER_HPP

#include <ArduinoSTL.h>

// #define DEBUG // / 定義するとデバックメッセージが出力されます。

class Logger
{
public:
    Logger(const std::string &name = std::string("unknown"))
        : name(name) {};
    Logger(const char *name = "unknown")
        : name(std::string(name)) {};

    void setup();

    void info(const std::string &message);
    void info(const char *message);
    void debug(const std::string &message);
    void debug(const char *message);
    void warn(const std::string &message);
    void warn(const char *message);
    void error(const std::string &message);
    void error(const char *message);
    void fatal(const std::string &message);
    void fatal(const char *message);

    // 書式付きのログ出力
    template <typename... Args>
    void infof(const char *format, Args... args);

    template <typename... Args>
    void debugf(const char *format, Args... args);

    template <typename... Args>
    void warnf(const char *format, Args... args);

    template <typename... Args>
    void errorf(const char *format, Args... args);

    template <typename... Args>
    void fatalf(const char *format, Args... args);

private:
    std::string name = "unknown";

    void log(const char *message, const char *level);
    char *createPrefix(const char *level, const char *message);
};

/**
 * @brief 書式付き情報ログ出力
 *
 * @tparam Args 可変引数の型
 * @param format 書式文字列
 * @param args 書式引数
 */
template <typename... Args>
void Logger::infof(const char *format, Args... args)
{
    char buffer[256];
    snprintf(buffer, sizeof(buffer), format, args...);
    info(buffer);
}

/**
 * @brief 書式付きデバッグログ出力
 *
 * @tparam Args 可変引数の型
 * @param format 書式文字列
 * @param args 書式引数
 */
template <typename... Args>
void Logger::debugf(const char *format, Args... args)
{
#ifdef DEBUG
    char buffer[256];
    snprintf(buffer, sizeof(buffer), format, args...);
    debug(buffer);
#endif
}

/**
 * @brief 書式付き警告ログ出力
 *
 * @tparam Args 可変引数の型
 * @param format 書式文字列
 * @param args 書式引数
 */
template <typename... Args>
void Logger::warnf(const char *format, Args... args)
{
    char buffer[256];
    snprintf(buffer, sizeof(buffer), format, args...);
    warn(buffer);
}

/**
 * @brief 書式付きエラーログ出力
 *
 * @tparam Args 可変引数の型
 * @param format 書式文字列
 * @param args 書式引数
 */
template <typename... Args>
void Logger::errorf(const char *format, Args... args)
{
    char buffer[256];
    snprintf(buffer, sizeof(buffer), format, args...);
    error(buffer);
}

/**
 * @brief 書式付き致命的エラーログ出力
 *
 * @tparam Args 可変引数の型
 * @param format 書式文字列
 * @param args 書式引数
 */
template <typename... Args>
void Logger::fatalf(const char *format, Args... args)
{
    char buffer[256];
    snprintf(buffer, sizeof(buffer), format, args...);
    fatal(buffer);
}

// よく使用される型の明示的なインスタンス化
template void Logger::infof<int>(const char *, int);
template void Logger::infof<const char *>(const char *, const char *);
template void Logger::infof<int, int>(const char *, int, int);
template void Logger::infof<double>(const char *, double);

template void Logger::debugf<int>(const char *, int);
template void Logger::debugf<const char *>(const char *, const char *);
template void Logger::debugf<int, int>(const char *, int, int);
template void Logger::debugf<double>(const char *, double);

template void Logger::warnf<int>(const char *, int);
template void Logger::warnf<const char *>(const char *, const char *);

template void Logger::errorf<int>(const char *, int);
template void Logger::errorf<const char *>(const char *, const char *);

template void Logger::fatalf<int>(const char *, int);
template void Logger::fatalf<const char *>(const char *, const char *);

#endif // LOGGER_HPP