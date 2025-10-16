/**
 * @file server.ts
 * @brief 尚美展用、クイズシステム、バックエンドサーバー
 * @author JF9TGL
 * @date 2024-10-13 (Updated)
 *
 * Arduinoを用いた早押しシステムのバックエンドサーバーです。
 * フロントエンドは Next.js で実装しています。
 *
 * Arduinoとの通信はシリアルポートを介したJSON通信で行います。
 * Next.jsとの通信はWebSocketを用いて行います。
 *
 * 設計書に基づいて6人プレーヤー対応、全クライアントブロードキャスト対応
 */
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { SerialPort } from "serialport";
import net from "net";
import dotenv from "dotenv";
import type {
    Player,
    QuestionData,
    QuizState,
    QuizSetting,
} from "@shared/types";
dotenv.config();

// コマンドライン引数の解析
function parseArgs() {
    const args = process.argv.slice(2);
    const options: {
        port?: number;
        comPort?: string;
        simulator?: boolean;
        serverOnly?: boolean;
    } = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--port" || arg === "-p") {
            const nextArg = args[i + 1];
            if (nextArg) {
                const portValue = parseInt(nextArg);
                if (!isNaN(portValue)) {
                    options.port = portValue;
                    i++;
                }
            }
        } else if (arg === "--com" || arg === "-c") {
            const nextArg = args[i + 1];
            if (nextArg) {
                options.comPort = nextArg;
                i++;
            }
        } else if (arg === "--simulator" || arg === "-s") {
            options.simulator = true;
        } else if (arg === "--server-only" || arg === "-so") {
            options.serverOnly = true;
        } else if (arg === "--help" || arg === "-h") {
            console.log(`
使用方法: server [オプション]

オプション:
  -p, --port <番号>       サーバーポート番号 (デフォルト: 3001)
  -c, --com <ポート>      COMポート名 (例: COM3)
  -s, --simulator         Arduinoシミュレーターを使用
  -so, --server-only      Arduinoなしでサーバーのみ起動（タブレット専用）
  -h, --help              このヘルプを表示

例:
  server --port 3002
  server --com COM5
  server --port 3002 --com COM5
  server --simulator
  server --server-only
            `);
            process.exit(0);
        }
    }

    return options;
}

const cmdOptions = parseArgs();
const PORT = cmdOptions.port || parseInt(process.env.PORT || "3001");
const COM_PORT = cmdOptions.comPort || process.env.COM_PORT;
const USE_SIMULATOR =
    cmdOptions.simulator || process.env.USE_SIMULATOR === "true";
const SERVER_ONLY = cmdOptions.serverOnly || process.env.SERVER_ONLY === "true";

console.log(`設定:
  - サーバーポート: ${PORT}
  - モード: ${
      SERVER_ONLY
          ? "サーバーのみ（タブレット専用）"
          : USE_SIMULATOR
          ? "シミュレーター"
          : "Arduino接続"
  }
  - COMポート: ${SERVER_ONLY ? "N/A" : COM_PORT || "自動検出"}
`);

// Arduino接続設定（開発時はシミュレーター使用）
let controller: SerialPort | net.Socket | null = null;

// 初期化関数
async function initializeArduino() {
    if (SERVER_ONLY) {
        console.log("⚙️  サーバーオンリーモード: Arduinoなしで起動します");
        console.log("📱 タブレットボタンのみ使用可能です");
        return; // Arduinoの初期化をスキップ
    }

    if (USE_SIMULATOR) {
        controller = net.connect(4000, "localhost");
        console.log("Using Arduino simulator at localhost:4000");
    } else {
        let portPath: string | null;

        if (COM_PORT) {
            // コマンドライン引数または環境変数で指定されたポートを使用
            portPath = COM_PORT;
            console.log(`指定されたCOMポートを使用: ${portPath}`);
        } else {
            // 自動検出
            portPath = await findArduinoPort();
            if (!portPath) {
                console.error("Arduino ポートが見つかりませんでした");
                console.log(
                    "ヒント: --com オプションでCOMポートを指定できます (例: --com COM3)"
                );
                process.exit(1);
            }
            console.log(`自動検出されたCOMポート: ${portPath}`);
        }

        controller = new SerialPort({
            path: portPath,
            baudRate: 9600,
        });
    }

    initializeSerial();
}

// サーバー起動時にArduinoを初期化
initializeArduino().catch((error) => {
    console.error("Arduino初期化エラー:", error);
    process.exit(1);
});

const app = express();
const server = http.createServer(app);

// CORS設定（環境変数から取得、デフォルトはlocalhost）
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(express.json());

// UISettings 型定義（サーバー専用）
type UISettings = {
    showHint: boolean;
    showAnswer: boolean;
};

type ArduinoData = {
    type: string;
    buttonId?: number;
    message?: string;
    timestamp: number;
};

// 初期状態(5人プレーヤー対応)
const quizState: QuizState = {
    questionData: null,
    isActive: false,
    players: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Player ${i + 1}`,
        score: 0,
        pressed: false,
        order: null,
    })),
    pressedOrder: [],
};

const quizSetting: QuizSetting = {
    maxPlayers: 5,
    hintTime: 10,
    answerTime: 20,
    correctPoints: 10,
    incorrectPoints: 0,
    answerBreakPenalty: 1,
};

const uiSettings: UISettings = {
    showHint: false,
    showAnswer: false,
};

// 状態ブロードキャスト関数
function broadcastState() {
    const fullState = {
        ...quizState,
        ...uiSettings,
    };
    io.emit("state", fullState);
}

// ゲームロジック関数
function correctAnswer() {
    if (quizState.pressedOrder.length === 0) {
        console.warn("No players pressed buttons");
        return;
    }

    const firstPlayerId = quizState.pressedOrder[0];
    if (!firstPlayerId) {
        console.warn("Invalid first player ID");
        return;
    }

    const playerIndex = firstPlayerId - 1;
    const player = quizState.players[playerIndex];

    if (player) {
        player.score += quizSetting.correctPoints;
        console.log(
            `Player ${firstPlayerId} が正解しました！ (${quizSetting.correctPoints}pt獲得)`
        );
    }

    // クイズ終了処理
    endCurrentQuiz();

    // 正解イベントを送信
    io.emit("correctAnswer", { playerId: firstPlayerId });

    // 全クライアントに状態をブロードキャスト
    broadcastState();
}

function incorrectAnswer() {
    if (quizState.pressedOrder.length === 0) {
        console.warn("No players pressed buttons");
        return;
    }

    const firstPlayerId = quizState.pressedOrder[0];
    if (!firstPlayerId) {
        console.warn("Invalid first player ID");
        return;
    }

    const playerIndex = firstPlayerId - 1;
    const player = quizState.players[playerIndex];

    if (player) {
        player.score += quizSetting.incorrectPoints;
        console.log(
            `Player ${firstPlayerId} が不正解しました！ (${Math.abs(
                quizSetting.incorrectPoints
            )}pt減点)`
        );

        // プレーヤーをオーダーから削除
        quizState.pressedOrder.shift();
        player.pressed = false;
        player.order = null;

        // 残りのプレーヤーのオーダーを更新
        quizState.pressedOrder.forEach((playerId, index) => {
            const idx = playerId - 1;
            const updatePlayer = quizState.players[idx];
            if (updatePlayer) {
                updatePlayer.order = index + 1;
            }
        });
    }

    // 不正解イベントを送信
    io.emit("incorrectAnswer", { playerId: firstPlayerId });

    // 全クライアントに状態をブロードキャスト
    broadcastState();
}

function endCurrentQuiz() {
    quizState.isActive = false;
    quizState.pressedOrder = [];
    quizState.players.forEach((player) => {
        player.pressed = false;
        player.order = null;
    });
}

function endQuiz() {
    endCurrentQuiz();
    console.log("クイズが終了されました");

    // 全クライアントに状態をブロードキャスト
    broadcastState();
}

// Socket.IO接続処理
function connection(socket: Socket) {
    console.log("クライアント接続:", socket.id);

    // 接続直後に現在の状態を送信
    const fullState = {
        ...quizState,
        ...uiSettings,
    };
    socket.emit("state", fullState);

    // 問題設定
    socket.on("setQuestion", (data: QuestionData) => {
        console.log("問題が設定されました:", data.question);
        quizState.questionData = data;
        quizState.isActive = true;
        quizState.pressedOrder = [];

        // 押下状態をリセット（UI設定はリセットしない）
        quizState.players.forEach((player) => {
            player.pressed = false;
            player.order = null;
        });

        // UI設定をリセット
        uiSettings.showHint = false;
        uiSettings.showAnswer = false;

        // 全クライアントに新しい状態をブロードキャスト
        broadcastState();
    });

    // プレーヤー名更新
    socket.on(
        "updatePlayerName",
        (data: { playerId: number; name: string }) => {
            const { playerId, name } = data;
            const playerIndex = playerId - 1;
            const player = quizState.players[playerIndex];

            if (player) {
                player.name = name;
                console.log(
                    `Player ${playerId} の名前が '${name}' に変更されました`
                );

                // 全クライアントに状態をブロードキャスト
                broadcastState();
            } else {
                console.warn(`無効なプレーヤーID: ${playerId}`);
            }
        }
    );

    socket.on("setQuizSetting", (data: Partial<QuizSetting>) => {
        Object.assign(quizSetting, data);
        console.log("クイズ設定が更新されました:", quizSetting);
        // 必要に応じて全クライアントに状態をブロードキャスト
        broadcastState();
    });

    // 正解処理
    socket.on("correctAnswer", () => {
        console.log("正解ボタンが押されました");
        correctAnswer();
    });

    // 不正解処理
    socket.on("incorrectAnswer", () => {
        console.log("不正解ボタンが押されました");
        incorrectAnswer();
    });

    // クイズ終了
    socket.on("endQuiz", () => {
        console.log("クイズ終了ボタンが押されました");
        endQuiz();
    });

    // ヒント表示/非表示
    socket.on("setShowHint", (show: boolean) => {
        uiSettings.showHint = show;
        console.log(`ヒント表示設定: ${show}`);
        broadcastState();
    });

    // 答え表示/非表示
    socket.on("setShowAnswer", (show: boolean) => {
        uiSettings.showAnswer = show;
        console.log(`答え表示設定: ${show}`);
        broadcastState();
    });

    // タブレットからのボタン押下
    socket.on(
        "pressButton",
        (data: { playerId: number; timestamp: number }) => {
            console.log(`タブレットボタン押下: Player ${data.playerId}`);
            handleButtonPress({
                type: "pressedButton",
                buttonId: data.playerId,
                timestamp: data.timestamp,
            });
        }
    );

    // スコア調整（増減）
    socket.on("adjustScore", (data: { playerId: number; delta: number }) => {
        const player = quizState.players.find((p) => p.id === data.playerId);
        if (player) {
            player.score += data.delta;
            console.log(
                `Player ${data.playerId} のスコアを ${
                    data.delta > 0 ? "+" : ""
                }${data.delta} 調整 → ${player.score}pt`
            );
            io.emit("scoreUpdated", {
                playerId: data.playerId,
                newScore: player.score,
            });
            broadcastState();
        }
    });

    // スコア設定（直接指定）
    socket.on("setScore", (data: { playerId: number; score: number }) => {
        const player = quizState.players.find((p) => p.id === data.playerId);
        if (player) {
            player.score = data.score;
            console.log(
                `Player ${data.playerId} のスコアを ${data.score}pt に設定`
            );
            io.emit("scoreUpdated", {
                playerId: data.playerId,
                newScore: player.score,
            });
            broadcastState();
        }
    });

    // 全員のスコアをリセット
    socket.on("resetAllScores", () => {
        console.log("全プレイヤーのスコアをリセット");
        quizState.players.forEach((player) => {
            player.score = 0;
        });
        broadcastState();
    });

    // 切断処理
    socket.on("disconnect", (reason) => {
        console.log("クライアント切断:", socket.id, "理由:", reason);
    });
}

// Arduino通信処理
function handleButtonPress(data: ArduinoData) {
    if (data.type === "pressedButton" && data.buttonId) {
        const buttonId = data.buttonId;
        const playerIndex = buttonId - 1;

        // クイズがアクティブでない場合は無視
        if (!quizState.isActive) {
            console.log(
                `クイズがアクティブではないので Player ${buttonId} の押下を無視`
            );
            return;
        }

        // プレーヤーIDの範囲チェック
        if (playerIndex < 0 || playerIndex >= quizState.players.length) {
            console.warn(`無効なボタンID: ${buttonId} (有効範囲: 1-6)`);
            return;
        }

        const player = quizState.players[playerIndex];
        if (!player) {
            console.warn(`Player not found for button ${buttonId}`);
            return;
        }

        // 既に押されている場合は無視
        if (player.pressed) {
            console.log(`Player ${buttonId} は既に押下済み`);
            return;
        }

        // ボタン押下を記録
        player.pressed = true;
        player.order = quizState.pressedOrder.length + 1;
        quizState.pressedOrder.push(buttonId);

        console.log(
            `Player ${buttonId} がボタンを押しました (${player.order}番目)`
        );

        // ボタン押下イベントをブロードキャスト
        io.emit("buttonPressed", { buttonId, timestamp: data.timestamp });

        // 更新された状態を全クライアントにブロードキャスト
        broadcastState();
    }
}

// グローバルバッファでデータを蓄積
let dataBuffer = "";

// シリアル通信初期化
async function initializeSerial() {
    if (!controller) {
        console.log(
            "⚠️  Arduinoコントローラーが初期化されていません（サーバーオンリーモード）"
        );
        return;
    }

    controller.on("data", (data: Buffer) => {
        // 受信データをバッファに追加
        dataBuffer += data.toString();

        // 改行文字で区切ってメッセージを分割
        const lines = dataBuffer.split("\n");

        // 最後の要素（未完成の可能性がある）をバッファに残す
        dataBuffer = lines.pop() || "";

        // 完成したメッセージを処理
        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                console.log("Arduino からのデータ:", trimmedLine);

                try {
                    const buttonData = JSON.parse(trimmedLine) as ArduinoData;
                    handleButtonPress(buttonData);
                } catch (error) {
                    console.error(
                        "データの解析エラー:",
                        error,
                        "受信データ:",
                        trimmedLine
                    );
                    // 不正なJSONの場合は無視して継続
                }
            }
        });
    });

    if (controller instanceof SerialPort) {
        controller.on("open", () => {
            console.log("Arduino接続完了!");
        });

        controller.on("error", (err) => {
            console.error("シリアルポートエラー:", err);
        });
    } else {
        controller.on("connect", () => {
            console.log("Arduino シミュレーター接続完了!");
        });

        controller.on("error", (err) => {
            console.error("シミュレーター接続エラー:", err);
        });
    }
}

// Arduino ポート検索
async function findArduinoPort(): Promise<string | null> {
    const ports = await SerialPort.list();

    console.log("利用可能なシリアルポート:");
    ports.forEach((port) => {
        console.log(`- ${port.path} (${port.manufacturer || "Unknown"})`);
    });

    // 環境変数で指定されたポートを優先
    if (process.env.ARDUINO_PORT) {
        const envPort = process.env.ARDUINO_PORT;
        const portExists = ports.some((port) => port.path === envPort);

        if (portExists) {
            console.log(`環境変数ARDUINO_PORTより ${envPort} を使用`);
            return envPort;
        } else {
            console.warn(`指定されたARDUINO_PORT ${envPort} が見つかりません`);
        }
    }

    // Arduino製造元のポートを検索
    const arduinoPort = ports.find(
        (port) =>
            port.manufacturer &&
            (port.manufacturer.includes("Arduino") ||
                port.manufacturer.includes("Arduino LLC"))
    );

    if (arduinoPort) {
        console.log(`Arduino ポートを検出: ${arduinoPort.path}`);
        return arduinoPort.path;
    } else {
        console.warn("Arduino ポートが見つかりませんでした");
        return null;
    }
}

// Socket.IO接続イベント
io.on("connection", connection);

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend URL: http://localhost:3000`);
    console.log(`Players: ${quizState.players.length} initialized`);
});
