const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// システム状態
let gameState = {
    currentQuestion: "",
    players: [
        { id: 1, name: "プレイヤー1", score: 0, pressed: false, order: 0 },
        { id: 2, name: "プレイヤー2", score: 0, pressed: false, order: 0 },
        { id: 3, name: "プレイヤー3", score: 0, pressed: false, order: 0 },
        { id: 4, name: "プレイヤー4", score: 0, pressed: false, order: 0 },
        { id: 5, name: "プレイヤー5", score: 0, pressed: false, order: 0 },
        { id: 6, name: "プレイヤー6", score: 0, pressed: false, order: 0 },
    ],
    isQuestionActive: false,
    pressedOrder: [],
};

// Arduino接続
let port;
let parser;

// 利用可能なシリアルポートを検索
async function findArduinoPort() {
    try {
        const ports = await SerialPort.list();
        console.log("利用可能なシリアルポート:");
        ports.forEach((port) => {
            console.log(`- ${port.path} (${port.manufacturer || "Unknown"})`);
        });

        // Arduinoを自動検出（通常はUSB接続）
        const arduinoPort = ports.find(
            (port) =>
                port.manufacturer &&
                (port.manufacturer.includes("Arduino") ||
                    port.manufacturer.includes("CH340") ||
                    port.manufacturer.includes("FTDI"))
        );

        if (arduinoPort) {
            console.log(`Arduino検出: ${arduinoPort.path}`);
            return arduinoPort.path;
        } else if (ports.length > 0) {
            // 自動検出できない場合は最初のポートを使用
            console.log(`Arduino未検出、${ports[0].path}を使用します`);
            return ports[0].path;
        }

        return null;
    } catch (error) {
        console.error("シリアルポート検索エラー:", error);
        return null;
    }
}

async function initializeSerial() {
    const portPath = await findArduinoPort();

    if (!portPath) {
        console.log(
            "⚠️ Arduinoが見つかりません。シミュレーションモードで起動します。"
        );
        return;
    }

    try {
        port = new SerialPort({
            path: portPath,
            baudRate: 9600,
        });

        parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

        port.on("open", () => {
            console.log(`✅ Arduino接続成功: ${portPath}`);
        });

        port.on("error", (err) => {
            console.error("シリアルポートエラー:", err);
        });

        // Arduino からのデータを受信
        parser.on("data", (data) => {
            console.log("Arduino受信:", data);

            if (data.trim() === "RESET") {
                resetGame();
                return;
            }

            try {
                const buttonData = JSON.parse(data);
                handleButtonPress(buttonData);
            } catch (error) {
                console.log("データ解析エラー:", error, "データ:", data);
            }
        });
    } catch (error) {
        console.error("Arduino接続エラー:", error);
        console.log("⚠️ シミュレーションモードで起動します。");
    }
}

// ボタン押下処理
function handleButtonPress(buttonData) {
    const { player, order, timestamp } = buttonData;

    if (!gameState.isQuestionActive) {
        console.log(
            `問題が非アクティブのため、プレイヤー${player}の押下を無視`
        );
        return;
    }

    const playerIndex = player - 1;
    if (playerIndex >= 0 && playerIndex < 6) {
        gameState.players[playerIndex].pressed = true;
        gameState.players[playerIndex].order = order;
        gameState.pressedOrder.push({
            player: player,
            name: gameState.players[playerIndex].name,
            timestamp: timestamp,
        });

        console.log(
            `プレイヤー${player} (${gameState.players[playerIndex].name}) が ${order}番目に押下`
        );

        // 全クライアントに通知
        io.emit("buttonPressed", {
            player: player,
            playerName: gameState.players[playerIndex].name,
            order: order,
            timestamp: timestamp,
            gameState: gameState,
        });
    }
}

// ゲーム状態リセット
function resetGame() {
    gameState.players.forEach((player) => {
        player.pressed = false;
        player.order = 0;
    });
    gameState.pressedOrder = [];

    console.log("ゲーム状態リセット");
    io.emit("gameReset", { gameState: gameState });
}

// WebSocket接続処理
io.on("connection", (socket) => {
    console.log("クライアント接続:", socket.id);

    // 現在の状態を送信
    socket.emit("gameState", gameState);

    // 問題設定
    socket.on("setQuestion", (question) => {
        gameState.currentQuestion = question;
        gameState.isQuestionActive = true;
        resetGame(); // 新しい問題で状態をリセット
        console.log("問題設定:", question);
        io.emit("questionSet", { question: question, gameState: gameState });
    });

    // 手動リセット
    socket.on("resetGame", () => {
        resetGame();
    });

    // プレイヤー名変更
    socket.on("updatePlayerName", (data) => {
        const { playerId, name } = data;
        const playerIndex = playerId - 1;
        if (playerIndex >= 0 && playerIndex < 6) {
            gameState.players[playerIndex].name = name;
            io.emit("gameState", gameState);
            console.log(`プレイヤー${playerId}の名前を「${name}」に変更`);
        }
    });

    // スコア更新
    socket.on("updateScore", (data) => {
        const { playerId, scoreChange } = data;
        const playerIndex = playerId - 1;
        if (playerIndex >= 0 && playerIndex < 6) {
            gameState.players[playerIndex].score += scoreChange;
            io.emit("scoreUpdated", { gameState: gameState });
            console.log(
                `プレイヤー${playerId}のスコア変更: ${
                    scoreChange > 0 ? "+" : ""
                }${scoreChange}`
            );
        }
    });

    // 問題終了
    socket.on("endQuestion", () => {
        gameState.isQuestionActive = false;
        io.emit("questionEnded", { gameState: gameState });
        console.log("問題終了");
    });

    socket.on("disconnect", () => {
        console.log("クライアント切断:", socket.id);
    });
});

// REST API（オプション）
app.get("/api/status", (req, res) => {
    res.json({
        status: "running",
        gameState: gameState,
        arduinoConnected: !!port,
    });
});

// サーバー起動
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
    console.log(`🚀 クイズサーバー起動: http://localhost:${PORT}`);
    await initializeSerial();
});

// シミュレーション用（デバッグ時にキーボードでテスト）
if (process.env.NODE_ENV === "development") {
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("\n--- シミュレーションモード ---");
    console.log("1-6: プレイヤーボタン押下をシミュレート");
    console.log("r: リセット");
    console.log("q: 終了");

    rl.on("line", (input) => {
        const key = input.trim();
        if (key >= "1" && key <= "6") {
            const player = parseInt(key);
            const order = gameState.pressedOrder.length + 1;
            handleButtonPress({ player, order, timestamp: Date.now() });
        } else if (key === "r") {
            resetGame();
        } else if (key === "q") {
            process.exit(0);
        }
    });
}
