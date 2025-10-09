/**
 * @file server.ts
 * @brief 尚美展用、クイズシステム、バックエンドサーバー
 * @author JF9TGL
 * @date 2024-10-01
 *
 * Arduinoを用いた早押しシステムのバックエンドサーバーです。
 * フロントエンドは Next.js で実装しています。
 *
 * Arduinoとの通信はシリアルポートを介したOSCライクな通信で行います。
 * 数十秒に一度、ヒートビートを送信し、接続が維持されているか確認します。
 *
 * Next.jsとの通信はWebSocketを用いて行います。
 */
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { SerialPort } from "serialport";

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => connection(socket));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

type Player = {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
};

type QuestionData = {
    question: string;
    answer: string;
    hint: string | null;
};

type QuizState = {
    questionData: QuestionData | null;
    isActive: boolean;
    players: Player[];
    pressedOrder: number[]; // プレーヤーID
};

type QuizSetting = {
    maxPlayers: number;
    hintTime: number; // ヒント表示までの時間（秒）
    answerTime: number; // 解答受付時間（秒）
    correctPoints: number; // 正解時の加点
    incorrectPoints: number; // 不正解時の減点
    answerBreakPenalty: number; // 何問休みのペナルティ 0は無効
};

const quizState: QuizState = {
    questionData: null,
    isActive: false,
    players: [
        { id: 1, name: "Player 1", score: 0, pressed: false, order: null },
    ],
    pressedOrder: [],
};

const quizSetting: QuizSetting = {
    maxPlayers: 4,
    hintTime: 10,
    answerTime: 20,
    correctPoints: 10,
    incorrectPoints: -5,
    answerBreakPenalty: 1,
};

function correctAnswer() {
    // oserder 1 のプレーヤーにポイントを加算
    if (quizState.pressedOrder.length === 0) return;
    const firstPlayerId = quizState.pressedOrder[0];
    const playerIndex = firstPlayerId! - 1;
    quizState.players[playerIndex]!.score += quizSetting.correctPoints;
    quizState.isActive = false; // クイズ終了
    quizState.pressedOrder = [];
    quizState.players.forEach((player) => {
        player.pressed = false;
        player.order = null;
    });

    console.log(`Player ${firstPlayerId} が正解しました！`);
}

function incorrectAnswer() {
    // オーダーが最初のプレーヤーのポイントを減算
    if (quizState.pressedOrder.length === 0) return;
    const firstPlayerId = quizState.pressedOrder[0];
    const playerIndex = firstPlayerId! - 1;
    quizState.players[playerIndex]!.score += quizSetting.incorrectPoints;
    // オーダーから削除
    quizState.pressedOrder.shift();
    quizState.players[playerIndex]!.pressed = false;
    quizState.players[playerIndex]!.order = null;
    // オーダーを更新
    quizState.pressedOrder.forEach((playerId, index) => {
        const idx = playerId - 1;
        quizState.players[idx]!.order = index + 1;
    });

    console.log(`Player ${firstPlayerId} が不正解しました！`);
}

function connection(socket: Socket) {
    console.log("クライアント接続:", socket.id);

    // クライアントに現在の状態を送信
    socket.emit("state", quizState);
    // クライアントからのメッセージを受信
    socket.on("setQuestion", (data) => {
        quizState.questionData = data;
        quizState.isActive = true;
        quizState.pressedOrder = [];
    });

    socket.on("updatePlayerName", (data) => {
        const { playerId, name } = data;
        const playerIndex = playerId - 1;
        if (playerIndex >= 0 && playerIndex < quizState.players.length) {
            // @ts-ignore
            quizState.players[playerIndex].name = name;
            socket.emit("state", quizState);
        }
    });

    socket.on("correctAnswer", () => {
        correctAnswer();
        socket.emit("state", quizState);
    });

    socket.on("incorrectAnswer", () => {
        incorrectAnswer();
        socket.emit("state", quizState);
    });

    socket.on("endQuiz", () => {
        quizState.isActive = false;
        quizState.pressedOrder = [];
        quizState.players.forEach((player) => {
            player.pressed = false;
            player.order = null;
        });
        socket.emit("state", quizState);
    });
}

async function findArduinoPort(): Promise<string | null> {
    const ports = await SerialPort.list();
    ports.forEach((port) => {
        console.log(`- ${port.path} (${port.manufacturer || "Unknown"})`);
    });

    // envに指定されたポートを優先
    if (process.env.ARDUINO_PORT) {
        const envPort = ports.find(
            (port) => port.path === process.env.ARDUINO_PORT
        );
        if (envPort) {
            console.log(`ARDUINO_PORTより${envPort.path}を使用`);
            return envPort.path;
        }
        console.warn(
            `指定されたARDUINO_PORT ${process.env.ARDUINO_PORT} が見つかりません`
        );
    }

    const arduinoPort = ports.find(
        (port) => port.manufacturer && port.manufacturer.includes("Arduino")
    );

    if (arduinoPort) {
        console.log(`Arduino ポートが見つかりました: ${arduinoPort.path}`);
    } else {
        console.warn(`Arduino ポートが見つかりませんでした`);
    }

    return arduinoPort ? arduinoPort.path : null;
}

async function initializeSerial() {
    const portPath = await findArduinoPort();
    if (!portPath) {
        console.error("Arduino ポートが見つかりませんでした");
        return;
    }

    const port = new SerialPort({
        path: portPath,
        baudRate: 9600,
    });

    port.on("open", () => {
        console.log("Arduino接続完了!");
    });

    port.on("error", (err) => {
        console.error("シリアルポートエラー:", err);
    });

    port.on("data", (data) => {
        console.log("Arduino からのデータ:", data.toString());

        try {
            const buttonData = JSON.parse(data.toString());
        } catch (error) {
            console.error("データの解析エラー:", error);
        }
    });
}

type ArduinoData = {
    dataType: string;
    playerId?: number;
};

function handleButtonPress(data: ArduinoData) {
    if (data.dataType === "buttonPress" && data.playerId) {
        const playerId = data.playerId;
        const playerIndex = playerId - 1;

        if (quizState.isActive === false) {
            console.log(
                `クイズがアクティブではないので: ${playerId} の押下を無視`
            );
            return;
        }

        if (playerIndex >= 0 && playerIndex < quizState.players.length) {
            if (quizState.players[playerIndex]!.pressed) {
                console.log(`Player ${playerId} は既に押下済み`);
                return;
            }

            quizState.players[playerIndex]!.pressed = true;
            quizState.players[playerIndex]!.order =
                quizState.pressedOrder.length + 1;
            quizState.pressedOrder.push(playerId);
            console.log(`プレイヤー ${playerId} がボタンを押しました`);

            io.emit("state", quizState);
        }
    }
}
