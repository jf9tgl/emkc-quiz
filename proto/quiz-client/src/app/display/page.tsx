"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import io, { Socket } from "socket.io-client";
import styles from "@/styles/Display.module.css";

type GameState = {
    currentQuestion: string;
    players: Player[];
    isQuestionActive: boolean;
    pressedOrder: { id: number; name: string }[];
};

type LastPressed = {
    playerId: number;
    playerName: string;
    order: number;
} | null;

type Player = {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
};

export default function Display() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        currentQuestion: "",
        players: [] as Player[],
        isQuestionActive: false,
        pressedOrder: [],
    });
    const [connected, setConnected] = useState(false);
    const [lastPressed, setLastPressed] = useState<LastPressed>(null);

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
            setLastPressed(null);
        });

        newSocket.on("buttonPressed", (data) => {
            setGameState(data.gameState);
            setLastPressed(data);

            // 効果音を再生（ブラウザの制限により、ユーザーの操作後のみ再生可能）
            playButtonSound(data.order);
        });

        newSocket.on("gameReset", (data) => {
            setGameState(data.gameState);
            setLastPressed(null);
        });

        newSocket.on("questionEnded", (data) => {
            setGameState(data.gameState);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const playButtonSound = (order: number | null) => {
        try {
            // Web Audio API を使用して効果音を生成
            const audioContext = new (window.AudioContext ||
                window.AudioContext)();

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 最初に押した人は高い音、2番目以降は低い音
            oscillator.frequency.setValueAtTime(
                order === 1 ? 800 : 400,
                audioContext.currentTime
            );
            oscillator.type = "square";

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.5
            );

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log("効果音再生エラー:", error);
        }
    };

    const getPlayerDisplayStyle = (player: Player) => {
        if (!player.pressed) return {};

        if (player.order === 1) {
            return {
                backgroundColor: "#ffeb3b",
                color: "#000",
                transform: "scale(1.1)",
                boxShadow: "0 0 30px rgba(255, 235, 59, 0.8)",
                animation: "pulse 1s ease-in-out infinite alternate",
            };
        } else {
            return {
                backgroundColor: "#f44336",
                color: "#fff",
                transform: "scale(1.05)",
                opacity: 0.8,
            };
        }
    };

    const getQuestionStatus = () => {
        if (!gameState.currentQuestion) {
            return "問題を待機中...";
        } else if (gameState.isQuestionActive) {
            return "回答受付中";
        } else {
            return "回答終了";
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>表示画面 - クイズシステム</title>
            </Head>

            <div className={styles.display}>
                {/* ヘッダー */}
                <header className={styles.header}>
                    <h1 className={styles.title}>尚美展クイズ大会</h1>
                    <div className={styles.status}>
                        {getQuestionStatus()} {!connected && "(切断中)"}
                    </div>
                </header>

                {/* 問題文表示 */}
                <section className={styles.questionSection}>
                    {gameState.currentQuestion ? (
                        <div className={styles.question}>
                            <h2 className={styles.questionLabel}>問題</h2>
                            <p className={styles.questionText}>
                                {gameState.currentQuestion}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.waitingMessage}>
                            <h2>問題の出題をお待ちください...</h2>
                        </div>
                    )}
                </section>

                {/* プレイヤー表示 */}
                <section className={styles.playersSection}>
                    <div className={styles.playersGrid}>
                        {gameState.players.map((player: Player) => (
                            <div
                                key={player.id}
                                className={styles.playerDisplay}
                                style={getPlayerDisplayStyle(player)}
                            >
                                <div className={styles.playerNumber}>
                                    {player.id}
                                </div>
                                <div className={styles.playerName}>
                                    {player.name || `プレイヤー${player.id}`}
                                </div>
                                <div className={styles.playerScore}>
                                    {player.score}pt
                                </div>
                                {player.pressed && (
                                    <div className={styles.playerOrder}>
                                        {player.order}番目!
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 最後の押下情報（アニメーション用） */}
                {lastPressed && (
                    <div className={styles.lastPressedAlert}>
                        <h3>
                            {lastPressed.playerName} が {lastPressed.order}
                            番目に回答！
                        </h3>
                    </div>
                )}

                {/* 回答順序 */}
                {gameState.pressedOrder.length > 0 && (
                    <section className={styles.orderSection}>
                        <h3 className={styles.orderTitle}>回答順序</h3>
                        <div className={styles.orderList}>
                            {gameState.pressedOrder.map((entry, index) => (
                                <div key={index} className={styles.orderItem}>
                                    <span className={styles.orderRank}>
                                        {index + 1}.
                                    </span>
                                    <span className={styles.orderPlayerName}>
                                        {entry.name}
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
