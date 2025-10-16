"use client";

import { useQuizStore } from "@/store/quiz-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { socketManager } from "@/lib/socket";

export default function ButtonPage() {
    const { players, isActive, pressedOrder, connectionStatus } =
        useQuizStore();
    const [pressedButtonId, setPressedButtonId] = useState<number | null>(null);

    // プレイヤーがボタンを押したときの処理
    const handleButtonPress = (playerId: number) => {
        // クイズがアクティブでない場合は無視
        if (!isActive) {
            console.log("クイズがアクティブではありません");
            return;
        }

        // 既に押されている場合は無視
        const player = players.find((p) => p.id === playerId);
        if (player?.pressed) {
            console.log(`Player ${playerId} は既に押下済み`);
            return;
        }

        // ボタン押下をサーバーに送信
        const timestamp = Date.now();
        console.log(`Player ${playerId} がボタンを押しました`);
        socketManager.emit("pressButton", { buttonId: playerId, timestamp });

        // 視覚的フィードバック
        setPressedButtonId(playerId);
        setTimeout(() => setPressedButtonId(null), 300);
    };

    // ボタンの色を決定
    const getButtonColor = (playerId: number) => {
        const colors = [
            "from-red-500 to-red-700",
            "from-blue-500 to-blue-700",
            "from-green-500 to-green-700",
            "from-yellow-500 to-yellow-700",
            "from-purple-500 to-purple-700",
            "from-pink-500 to-pink-700",
        ];
        return colors[(playerId - 1) % colors.length];
    };

    // プレイヤーがボタンを押したかどうか
    const isPlayerPressed = (playerId: number) => {
        const player = players.find((p) => p.id === playerId);
        return player?.pressed || false;
    };

    // プレイヤーの順位を取得
    const getPlayerOrder = (playerId: number) => {
        const player = players.find((p) => p.id === playerId);
        return player?.order;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
            {/* 接続状態表示 */}
            <div className="fixed top-4 right-4 z-50">
                <ConnectionStatus />
            </div>

            {/* ヘッダー */}
            <div className="text-center mb-8 pt-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    早押しボタン
                </h1>
                <p className="text-lg text-gray-400">
                    {isActive
                        ? "問題が出題されています！ボタンを押してください"
                        : "問題の出題を待っています..."}
                </p>
            </div>

            {/* ボタングリッド */}
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {players.map((player) => {
                        const isPressed = isPlayerPressed(player.id);
                        const order = getPlayerOrder(player.id);
                        const isJustPressed = pressedButtonId === player.id;

                        return (
                            <motion.button
                                key={player.id}
                                onClick={() => handleButtonPress(player.id)}
                                disabled={!isActive || isPressed}
                                className={`
                                    relative h-48 md:h-64 rounded-2xl
                                    bg-gradient-to-br ${getButtonColor(player.id)}
                                    shadow-2xl
                                    transition-all duration-200
                                    ${
                                        !isActive || isPressed
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:scale-105 active:scale-95 cursor-pointer"
                                    }
                                    ${isJustPressed ? "scale-95" : ""}
                                `}
                                whileTap={
                                    isActive && !isPressed
                                        ? { scale: 0.95 }
                                        : {}
                                }
                                animate={
                                    isJustPressed
                                        ? {
                                              scale: [1, 0.95, 1],
                                              transition: { duration: 0.3 },
                                          }
                                        : {}
                                }
                            >
                                {/* プレイヤー情報 */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                    <div className="text-6xl md:text-7xl font-bold mb-2">
                                        {player.id}
                                    </div>
                                    <div className="text-xl md:text-2xl font-semibold">
                                        {player.name}
                                    </div>
                                    <div className="text-lg md:text-xl mt-2 opacity-80">
                                        {player.score}pt
                                    </div>
                                </div>

                                {/* 押下済みインジケーター */}
                                <AnimatePresence>
                                    {isPressed && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-2xl"
                                        >
                                            <div className="text-center">
                                                <div className="text-5xl md:text-6xl font-bold mb-2">
                                                    {order}位
                                                </div>
                                                <div className="text-xl md:text-2xl">
                                                    押下済み
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* リップルエフェクト */}
                                {isJustPressed && (
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl bg-white"
                                        initial={{ opacity: 0.3, scale: 0.8 }}
                                        animate={{
                                            opacity: 0,
                                            scale: 1.2,
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* 状態表示 */}
            <div className="fixed bottom-4 left-4 right-4 text-center">
                {connectionStatus !== "connected" && (
                    <div className="bg-red-500 bg-opacity-90 text-white px-4 py-2 rounded-lg inline-block">
                        サーバーに接続していません
                    </div>
                )}
                {isActive && pressedOrder.length > 0 && (
                    <div className="bg-blue-500 bg-opacity-90 text-white px-4 py-2 rounded-lg inline-block">
                        {pressedOrder.length}人が回答しています
                    </div>
                )}
            </div>
        </div>
    );
}
