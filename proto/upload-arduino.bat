@echo off
echo Uploading Quiz System to Arduino...
cd arduino-platformio

echo.
echo [1/2] Building and uploading firmware...
pio run --target upload

echo.
echo [2/2] Opening serial monitor...
echo Press Ctrl+C to exit monitor
pio device monitor

pause