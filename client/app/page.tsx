"use client";

import { useEffect, useState } from "react";
import { useQuizStore, setupSocketListeners } from "@/store/quiz-store";
import { motion, press } from "framer-motion";

export default function ButtonPage() {
    const {
        players,
        connectionStatus,
        isActive,
        pressedOrder,
        questionData,
        sendPressButton,
    } = useQuizStore();

    const [pressedButton, setPressedButton] = useState<number | null>(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(
        null
    );

    useEffect(() => {
        setupSocketListeners();
        console.log("Button page loaded, connection:", connectionStatus);
    }, [connectionStatus]);

    const handleButtonPress = () => {
        if (!selectedPlayerId) {
            alert("プレイヤーを選択してください");
            return;
        }

        const answeredPlayerId =
            pressedOrder.length > 0 ? pressedOrder[0] : null;

        if (!isActive) {
            console.log("Button press ignored:", {
                isActive,
                answeredPlayerId,
            });
            return;
        }

        console.log(`Player ${selectedPlayerId} button pressed`);
        setPressedButton(selectedPlayerId);
        sendPressButton(selectedPlayerId);

        setTimeout(() => setPressedButton(null), 2000);
    };

    const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
    const answeredPlayerId = pressedOrder.length > 0 ? pressedOrder[0] : null;
    const isInAnswerPlayer = pressedOrder.includes(selectedPlayerId!);
    const isPressed = pressedButton === selectedPlayerId;
    const isAnswered = isInAnswerPlayer;
    const isDisabled = !isActive || isAnswered;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 p-4">
            <div className="fixed top-4 right-4 z-50">
                <div
                    className={`px-4 py-2 rounded-full text-white font-bold ${
                        connectionStatus === "connected"
                            ? "bg-green-500"
                            : connectionStatus === "connecting"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                >
                    {connectionStatus === "connected"
                        ? "✓ 接続済み"
                        : connectionStatus === "connecting"
                        ? "接続中..."
                        : "✗ 未接続"}
                </div>
            </div>
            <div className="fixed top-4 left-4 z-50">
                <div
                    className={`px-4 py-2 rounded-full text-white font-bold ${
                        isActive ? "bg-blue-500" : "bg-gray-500"
                    }`}
                >
                    {isActive ? "🔴 クイズ進行中" : "⏸️ 待機中"}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
                {!selectedPlayerId && (
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            プレイヤーを選択
                        </h1>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl text-black">
                            {players.slice(0, 5).map((player) => (
                                <button
                                    key={player.id}
                                    onClick={() =>
                                        setSelectedPlayerId(player.id)
                                    }
                                    className="h-32 md:h-40 rounded-xl bg-white text-black font-bold text-3xl md:text-4xl shadow-2xl transition-all hover:scale-105"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-5xl md:text-6xl">
                                            {player.id}
                                        </div>
                                        <div className="text-sm md:text-base opacity-80">
                                            {player.name}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {selectedPlayerId && selectedPlayer && (
                    <div className="text-center space-y-6 w-full max-w-2xl px-4">
                        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-2 text-black">
                            <div className="text-xl font-bold mb-2">
                                {selectedPlayer.name}
                            </div>
                            <div className="text-xl md:text-2xl">
                                {selectedPlayer.score}pt
                            </div>
                        </div>

                        {/* 問題文表示 */}
                        {isActive && questionData && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-6 shadow-2xl"
                            >
                                <div className="text-gray-900">
                                    <div className="text-lg md:text-xl font-bold mb-4 text-purple-600">
                                        📝 問題
                                    </div>
                                    <div className="text-xl md:text-2xl font-bold leading-relaxed">
                                        {questionData.question}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <motion.button
                            onClick={handleButtonPress}
                            disabled={isDisabled}
                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            whileHover={!isDisabled ? { scale: 1.05 } : {}}
                            className={`relative w-full h-96 md:h-[500px] rounded-3xl font-black text-6xl md:text-8xl transition-all duration-300 shadow-2xl ${
                                isDisabled
                                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                                    : isPressed
                                    ? "bg-yellow-400 text-gray-900"
                                    : isAnswered
                                    ? "bg-green-500 text-white"
                                    : "bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white hover:from-red-400 hover:via-pink-400 hover:to-purple-500"
                            }`}
                        >
                            <div className="flex items-center justify-center h-full">
                                {isAnswered ? "✓ 押下済み" : "PUSH!"}
                            </div>
                            {isPressed && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center bg-yellow-300 bg-opacity-50 rounded-3xl"
                                >
                                    <span className="text-9xl">⚡</span>
                                </motion.div>
                            )}
                        </motion.button>
                        <button
                            onClick={() => setSelectedPlayerId(null)}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors"
                        >
                            プレイヤーを変更
                        </button>
                    </div>
                )}
                {!isActive && selectedPlayerId && (
                    <div className="text-white text-xl md:text-2xl font-bold text-center">
                        クイズが開始されるまでお待ちください
                    </div>
                )}
            </div>
        </div>
    );
}
