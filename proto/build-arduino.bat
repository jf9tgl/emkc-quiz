@echo off
echo Building Quiz System with PlatformIO...
cd arduino-platformio

echo.
echo [1/3] Installing dependencies...
pio lib install

echo.
echo [2/3] Building firmware...
pio run

echo.
echo [3/3] Build complete!
echo.
echo Available commands:
echo   pio run --target upload  : Upload to Arduino
echo   pio device monitor       : Open serial monitor
echo   pio run -t clean         : Clean build files
echo.

pause