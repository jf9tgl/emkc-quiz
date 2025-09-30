"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import io, { Socket } from "socket.io-client";
import styles from "@/styles/Control.module.css";

type GameState = {
    currentQuestion: string;
    players: Player[];
    isQuestionActive: boolean;
    pressedOrder: { id: number; name: string; timestamp: number }[];
};

type Player = {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
};

export default function Control() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        currentQuestion: "",
        players: [],
        isQuestionActive: false,
        pressedOrder: [],
    });
    const [questionInput, setQuestionInput] = useState("");
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // WebSocket接続
        const newSocket = io("http://localhost:3001");

        newSocket.on("connect", () => {
            console.log("サーバー接続成功");
            setConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("サーバー切断");
            setConnected(false);
        });

        newSocket.on("gameState", (state) => {
            setGameState(state);
        });

        newSocket.on("questionSet", (data) => {
            setGameState(data.gameState);
        });

        newSocket.on("buttonPressed", (data) => {
            setGameState(data.gameState);
        });

        newSocket.on("gameReset", (data) => {
            setGameState(data.gameState);
        });

        newSocket.on("scoreUpdated", (data) => {
            setGameState(data.gameState);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const setQuestion = () => {
        if (socket && questionInput.trim()) {
            socket.emit("setQuestion", questionInput.trim());
            setQuestionInput("");
        }
    };

    const resetGame = () => {
        if (socket) {
            socket.emit("resetGame");
        }
    };

    const endQuestion = () => {
        if (socket) {
            socket.emit("endQuestion");
        }
    };

    const updatePlayerName = (playerId: number, name: string) => {
        if (socket) {
            socket.emit("updatePlayerName", { playerId, name });
        }
    };

    const updateScore = (playerId: number, scoreChange: number) => {
        if (socket) {
            socket.emit("updateScore", { playerId, scoreChange });
        }
    };

    const getPlayerStyle = (player: Player) => {
        if (player.pressed && player.order === 1) {
            return { backgroundColor: "#ffeb3b", color: "#000" }; // 最初に押した人は黄色
        } else if (player.pressed) {
            return { backgroundColor: "#f44336", color: "#fff" }; // 2番目以降は赤
        }
        return {};
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>コントロール画面 - クイズシステム</title>
            </Head>

            <header className={styles.header}>
                <h1>🎮 コントロール画面</h1>
                <div className={styles.status}>
                    ステータス: {connected ? "🟢 接続中" : "🔴 切断"}
                </div>
            </header>

            <div className={styles.content}>
                {/* 問題設定セクション */}
                <section className={styles.section}>
                    <h2>📝 問題設定</h2>
                    <div className={styles.questionInput}>
                        <textarea
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            placeholder="問題文を入力してください..."
                            rows={3}
                            className={styles.textarea}
                        />
                        <div className={styles.questionButtons}>
                            <button
                                onClick={setQuestion}
                                disabled={!connected || !questionInput.trim()}
                                className={styles.primaryButton}
                            >
                                🎯 出題開始
                            </button>
                            <button
                                onClick={endQuestion}
                                disabled={!connected}
                                className={styles.secondaryButton}
                            >
                                ⏹️ 問題終了
                            </button>
                        </div>
                    </div>

                    {gameState.currentQuestion && (
                        <div className={styles.currentQuestion}>
                            <strong>現在の問題:</strong>{" "}
                            {gameState.currentQuestion}
                        </div>
                    )}
                </section>

                {/* プレイヤー管理セクション */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>👥 プレイヤー管理</h2>
                        <button
                            onClick={resetGame}
                            disabled={!connected}
                            className={styles.resetButton}
                        >
                            🔄 リセット
                        </button>
                    </div>

                    <div className={styles.playersGrid}>
                        {gameState.players.map((player) => (
                            <div
                                key={player.id}
                                className={styles.playerCard}
                                style={getPlayerStyle(player)}
                            >
                                <div className={styles.playerHeader}>
                                    <span className={styles.playerNumber}>
                                        #{player.id}
                                    </span>
                                    {player.pressed && (
                                        <span className={styles.pressOrder}>
                                            {player.order}番目
                                        </span>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={(e) =>
                                        updatePlayerName(
                                            player.id,
                                            e.target.value
                                        )
                                    }
                                    className={styles.nameInput}
                                    placeholder={`プレイヤー${player.id}`}
                                />

                                <div className={styles.scoreSection}>
                                    <span className={styles.score}>
                                        スコア: {player.score}
                                    </span>
                                    <div className={styles.scoreButtons}>
                                        <button
                                            onClick={() =>
                                                updateScore(player.id, 10)
                                            }
                                            className={styles.addButton}
                                        >
                                            +10
                                        </button>
                                        <button
                                            onClick={() =>
                                                updateScore(player.id, -10)
                                            }
                                            className={styles.subtractButton}
                                        >
                                            -10
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 押し順表示セクション */}
                {gameState.pressedOrder.length > 0 && (
                    <section className={styles.section}>
                        <h2>🏁 回答順序</h2>
                        <div className={styles.pressedOrder}>
                            {gameState.pressedOrder.map((entry, index) => (
                                <div key={index} className={styles.orderEntry}>
                                    <span className={styles.orderNumber}>
                                        {index + 1}.
                                    </span>
                                    <span className={styles.playerName}>
                                        {entry.name}
                                    </span>
                                    <span className={styles.timestamp}>
                                        (
                                        {new Date(
                                            entry.timestamp
                                        ).toLocaleTimeString()}
                                        )
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
