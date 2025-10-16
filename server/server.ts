/**
 * @file server.ts
 * @brief 尚美展用、クイズシステム、バックエンドサーバー（タブレット専用版）
 * @author JF9TGL
 * @date 2025-10-17
 *
 * タブレットボタン専用のシンプルなWebSocketサーバーです。
 * Arduino関連のコードは完全に削除されています。
 */
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import type {
    Player,
    QuestionData,
    QuizState,
    QuizSetting,
} from "@shared/types";

dotenv.config();

// 環境変数の読み込み
const PORT = parseInt(process.env.PORT || "3001");
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
      ];

console.log(`🚀 タブレット専用クイズサーバー起動中...`);
console.log(`📡 ポート: ${PORT}`);
console.log(`🌐 CORS許可: ${allowedOrigins.join(", ")}`);

// Express & Socket.IO セットアップ
const app = express();
const server = http.createServer(app);
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

// ヘルスチェックエンドポイント
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "EMKC Quiz Server (Tablet Edition)",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    });
});

// UISettings 型定義
type UISettings = {
    showHint: boolean;
    showAnswer: boolean;
};

// 初期状態（5人プレーヤー）
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
        console.warn("⚠️  正解処理: ボタンが押されていません");
        return;
    }

    const firstPlayerId = quizState.pressedOrder[0];
    if (!firstPlayerId) {
        console.warn("⚠️  正解処理: プレイヤーIDが無効です");
        return;
    }

    const playerIndex = firstPlayerId - 1;
    const player = quizState.players[playerIndex];

    if (player) {
        player.score += quizSetting.correctPoints;
        console.log(
            `✅ Player ${firstPlayerId} (${player.name}) が正解！ +${quizSetting.correctPoints}pt → ${player.score}pt`
        );
    }

    endCurrentQuiz();
    io.emit("correctAnswer", { playerId: firstPlayerId });
    broadcastState();
}

function incorrectAnswer() {
    if (quizState.pressedOrder.length === 0) {
        console.warn("⚠️  不正解処理: ボタンが押されていません");
        return;
    }

    const firstPlayerId = quizState.pressedOrder[0];
    if (!firstPlayerId) {
        console.warn("⚠️  不正解処理: プレイヤーIDが無効です");
        return;
    }

    const playerIndex = firstPlayerId - 1;
    const player = quizState.players[playerIndex];

    if (player) {
        player.score += quizSetting.incorrectPoints;
        console.log(
            `❌ Player ${firstPlayerId} (${player.name}) が不正解 ${
                quizSetting.incorrectPoints
            }pt → ${player.score}pt`
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

    io.emit("incorrectAnswer", { playerId: firstPlayerId });
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
    console.log("🏁 クイズが終了されました");
    broadcastState();
}

// ボタン押下処理（タブレットからのみ）
function handleButtonPress(playerId: number, timestamp: number) {
    if (!quizState.isActive) {
        console.log(`⏸️  Player ${playerId} のボタン押下を無視（クイズ非アクティブ）`);
        return;
    }

    const playerIndex = playerId - 1;
    const player = quizState.players[playerIndex];

    if (!player) {
        console.warn(`⚠️  無効なプレイヤーID: ${playerId}`);
        return;
    }

    if (player.pressed) {
        console.log(`⏸️  Player ${playerId} は既にボタンを押しています`);
        return;
    }

    // ボタン押下を記録
    player.pressed = true;
    player.order = quizState.pressedOrder.length + 1;
    quizState.pressedOrder.push(playerId);

    console.log(
        `🔘 Player ${playerId} (${player.name}) がボタンを押しました！ (${player.order}番目)`
    );

    // ボタン押下イベントをブロードキャスト
    io.emit("buttonPressed", { buttonId: playerId, timestamp });

    // 更新された状態を全クライアントにブロードキャスト
    broadcastState();
}

// Socket.IO接続処理
io.on("connection", (socket: Socket) => {
    console.log(`🔌 クライアント接続: ${socket.id}`);

    // 接続直後に現在の状態を送信
    const fullState = {
        ...quizState,
        ...uiSettings,
    };
    socket.emit("state", fullState);

    // 問題設定
    socket.on("setQuestion", (data: QuestionData) => {
        console.log(`📝 問題が設定されました: ${data.question}`);
        quizState.questionData = data;
        quizState.isActive = true;
        quizState.pressedOrder = [];

        // 押下状態をリセット
        quizState.players.forEach((player) => {
            player.pressed = false;
            player.order = null;
        });

        // UI設定をリセット
        uiSettings.showHint = false;
        uiSettings.showAnswer = false;

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
                    `✏️  Player ${playerId} の名前を '${name}' に変更`
                );
                broadcastState();
            } else {
                console.warn(`⚠️  無効なプレイヤーID: ${playerId}`);
            }
        }
    );

    // クイズ設定更新
    socket.on("setQuizSetting", (data: Partial<QuizSetting>) => {
        Object.assign(quizSetting, data);
        console.log("⚙️  クイズ設定が更新されました:", quizSetting);
        broadcastState();
    });

    // 正解処理
    socket.on("correctAnswer", () => {
        console.log("✅ 正解ボタンが押されました");
        correctAnswer();
    });

    // 不正解処理
    socket.on("incorrectAnswer", () => {
        console.log("❌ 不正解ボタンが押されました");
        incorrectAnswer();
    });

    // クイズ終了
    socket.on("endQuiz", () => {
        console.log("🏁 クイズ終了ボタンが押されました");
        endQuiz();
    });

    // ヒント表示/非表示
    socket.on("setShowHint", (show: boolean) => {
        uiSettings.showHint = show;
        console.log(`💡 ヒント表示設定: ${show}`);
        broadcastState();
    });

    // 答え表示/非表示
    socket.on("setShowAnswer", (show: boolean) => {
        uiSettings.showAnswer = show;
        console.log(`📖 答え表示設定: ${show}`);
        broadcastState();
    });

    // タブレットからのボタン押下
    socket.on(
        "pressButton",
        (data: { playerId: number; timestamp: number }) => {
            console.log(`📱 タブレットボタン押下: Player ${data.playerId}`);
            handleButtonPress(data.playerId, data.timestamp);
        }
    );

    // スコア調整（増減）
    socket.on("adjustScore", (data: { playerId: number; delta: number }) => {
        const player = quizState.players.find((p) => p.id === data.playerId);
        if (player) {
            player.score += data.delta;
            console.log(
                `🔢 Player ${data.playerId} (${player.name}) のスコアを ${
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

    // スコア直接設定
    socket.on("setScore", (data: { playerId: number; score: number }) => {
        const player = quizState.players.find((p) => p.id === data.playerId);
        if (player) {
            player.score = data.score;
            console.log(
                `🔢 Player ${data.playerId} (${player.name}) のスコアを ${data.score}pt に設定`
            );
            io.emit("scoreUpdated", {
                playerId: data.playerId,
                newScore: player.score,
            });
            broadcastState();
        }
    });

    // 全スコアリセット
    socket.on("resetAllScores", () => {
        quizState.players.forEach((player) => {
            player.score = 0;
        });
        console.log("🔄 全プレイヤーのスコアをリセット");
        broadcastState();
    });

    // 切断処理
    socket.on("disconnect", () => {
        console.log(`🔌 クライアント切断: ${socket.id}`);
    });
});

// サーバー起動
server.listen(PORT, () => {
    console.log(`\n✨ サーバー起動完了！`);
    console.log(`📡 ポート: ${PORT}`);
    console.log(`👥 プレイヤー数: ${quizState.players.length}人`);
    console.log(`🌐 接続可能なオリジン:`);
    allowedOrigins.forEach((origin) => console.log(`   - ${origin}`));
    console.log(`\n💻 管理画面: http://localhost:3000/admin`);
    console.log(`📱 タブレット: http://localhost:3002`);
    console.log(`\n✅ タブレット専用モード（Arduino不要）\n`);
});

// エラーハンドリング
process.on("uncaughtException", (error) => {
    console.error("❌ 未処理の例外:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ 未処理のPromise拒否:", reason);
});

// 終了処理
process.on("SIGTERM", () => {
    console.log("\n👋 SIGTERMを受信、サーバーを終了します...");
    server.close(() => {
        console.log("✅ サーバーが正常に終了しました");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("\n👋 SIGINTを受信、サーバーを終了します...");
    server.close(() => {
        console.log("✅ サーバーが正常に終了しました");
        process.exit(0);
    });
});
