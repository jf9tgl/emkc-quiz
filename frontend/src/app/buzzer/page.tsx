"use client";

import { useQuizStore } from "@/store/quiz-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { SoundManager } from "@/components/audio/SoundManager";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export default function BuzzerPage() {
    const { isActive, players, sendButtonPress } = useQuizStore();

    const handleBuzzerPress = (playerId: number) => {
        const player = players.find((p) => p.id === playerId);
        if (!isActive) {
            console.log("クイズがアクティブではありません");
            return;
        }
        if (player?.pressed) {
            console.log("既に押下済みです");
            return;
        }
        sendButtonPress(playerId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* 音響効果マネージャー */}
            <SoundManager />

            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative z-10 min-h-screen p-6">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Bell className="text-yellow-400" size={32} />
                        <h1 className="text-3xl font-bold text-white">
                            早押しボタン
                        </h1>
                    </div>
                    <ConnectionStatus />
                </div>

                {/* Status Message */}
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-2xl font-bold px-6 py-4 rounded-lg ${
                            isActive
                                ? "bg-green-600/30 text-green-100 border-2 border-green-400"
                                : "bg-gray-600/30 text-gray-300 border-2 border-gray-500"
                        }`}
                    >
                        {isActive ? "🟢 問題進行中 - ボタンを押せます！" : "⏸️ 待機中..."}
                    </motion.div>
                </div>

                {/* Buzzer Buttons Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {players.map((player) => (
                        <motion.button
                            key={player.id}
                            onClick={() => handleBuzzerPress(player.id)}
                            disabled={!isActive || player.pressed}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            className={`
                                relative p-8 rounded-2xl text-white font-bold text-xl
                                transition-all duration-200 shadow-lg
                                ${
                                    player.pressed
                                        ? "bg-yellow-500 border-4 border-yellow-300 cursor-not-allowed"
                                        : isActive
                                        ? "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-4 border-white/50 cursor-pointer"
                                        : "bg-gray-600 border-4 border-gray-500 cursor-not-allowed opacity-50"
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="text-4xl">
                                    {player.pressed ? "✓" : "🔴"}
                                </div>
                                <div className="text-2xl font-bold">
                                    {player.name}
                                </div>
                                <div className="text-lg">
                                    {player.score} pt
                                </div>
                                {player.order && (
                                    <div className="absolute top-2 right-2 bg-white text-purple-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                                        {player.order}
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Instructions */}
                <div className="mt-12 max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                    <h2 className="text-xl font-bold mb-4 text-center">
                        使い方
                    </h2>
                    <ul className="space-y-2 text-lg">
                        <li>
                            ✅ 問題が開始されたらボタンが有効になります
                        </li>
                        <li>
                            🔴 自分のボタンをタップして早押しできます
                        </li>
                        <li>
                            ⚡ 一度押すと、その問題では再度押せません
                        </li>
                        <li>
                            🏆 正解すると得点が加算されます
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
