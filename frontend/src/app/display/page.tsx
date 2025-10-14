"use client";

import { useQuizStore } from "@/store/quiz-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { SoundManager } from "@/components/audio/SoundManager";
import { Trophy, Clock, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function DisplayPage() {
    const [isClicked, setIsClicked] = useState(false);

    const {
        questionData,
        isActive,
        players,
        pressedOrder,
        showHint,
        showAnswer,
    } = useQuizStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
            {/* 音響効果マネージャー */}
            <SoundManager />

            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {!isClicked && (
                <button
                    onClick={() => setIsClicked(true)}
                    className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold bg-black bg-opacity-50"
                >
                    クリックをして、有効化
                </button>
            )}
            {isClicked && (
                <div className="relative z-10 flex flex-col h-screen">
                    {/* Header */}
                    <div className="p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Trophy className="text-yellow-400" size={32} />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                                クイズ大会
                            </h1>
                            {/* デバッグ用表示 */}
                            <div className="text-sm text-white/50">
                                ヒント: {showHint ? "表示" : "非表示"} | 答え: {showAnswer ? "表示" : "非表示"}
                            </div>
                        </div>
                        <ConnectionStatus />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Question Section */}
                        <div className="flex-1 flex items-center justify-center p-8">
                            <AnimatePresence mode="wait">
                                {questionData && isActive ? (
                                    <motion.div
                                        key="question"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center max-w-4xl"
                                    >
                                        {/* Question */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20">
                                            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                                {questionData.question}
                                            </h2>
                                        </div>

                                        {/* Hint */}
                                        <AnimatePresence>
                                            {showHint && questionData.hint && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    className="bg-orange-500/20 backdrop-blur-md rounded-xl p-6 mb-6 border border-orange-400/30"
                                                >
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <Eye
                                                            className="text-orange-400"
                                                            size={24}
                                                        />
                                                        <span className="text-xl font-semibold text-orange-300">
                                                            ヒント
                                                        </span>
                                                    </div>
                                                    <p className="text-2xl text-orange-100">
                                                        {questionData.hint}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Answer */}
                                        <AnimatePresence>
                                            {showAnswer && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.9,
                                                    }}
                                                    className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border border-green-400/30"
                                                >
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <Trophy
                                                            className="text-green-400"
                                                            size={24}
                                                        />
                                                        <span className="text-xl font-semibold text-green-300">
                                                            正解
                                                        </span>
                                                    </div>
                                                    <p className="text-3xl font-bold text-green-200">
                                                        {questionData.answer}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="waiting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center"
                                    >
                                        <Clock
                                            className="mx-auto mb-4 text-white/50"
                                            size={64}
                                        />
                                        <h2 className="text-4xl font-bold text-white/70">
                                            問題を待機中...
                                        </h2>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Players Section */}
                        <div className="p-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                <h3 className="text-2xl font-bold mb-6 text-center">
                                    プレーヤー
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {players.map((player, index) => {
                                        const isPressed = player.pressed;
                                        const order = player.order;
                                        const isFirst = order === 1;

                                        return (
                                            <motion.div
                                                key={player.id}
                                                animate={{
                                                    scale: isPressed ? 1.05 : 1,
                                                    rotateY: isPressed ? 5 : 0,
                                                }}
                                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                                    isPressed
                                                        ? isFirst
                                                            ? "bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-400/30"
                                                            : "bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-400/30"
                                                        : "bg-white/10 border-white/20"
                                                }`}
                                            >
                                                {/* Ranking Badge */}
                                                {index < 3 && (
                                                    <div
                                                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            index === 0
                                                                ? "bg-yellow-400 text-black"
                                                                : index === 1
                                                                ? "bg-gray-300 text-black"
                                                                : "bg-orange-400 text-black"
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                )}

                                                {/* Press Order Badge */}
                                                {order && (
                                                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {order}
                                                    </div>
                                                )}

                                                <div className="text-center">
                                                    <h4 className="font-semibold text-lg mb-1 truncate">
                                                        {player.name}
                                                    </h4>
                                                    <div className="text-2xl font-bold">
                                                        {player.score}
                                                        <span className="text-sm ml-1 opacity-70">
                                                            pt
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Pressed Animation */}
                                                {isPressed && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{
                                                            scale: [0, 1.2, 1],
                                                        }}
                                                        className="absolute inset-0 rounded-xl border-2 border-white/50"
                                                    />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Press Order Display */}
                                {pressedOrder.length > 0 && (
                                    <div className="mt-6 text-center">
                                        <h4 className="text-lg font-semibold mb-3 text-white/80">
                                            押下順序
                                        </h4>
                                        <div className="flex justify-center gap-3 flex-wrap">
                                            {pressedOrder.map(
                                                (playerId, index) => {
                                                    const player = players.find(
                                                        (p) => p.id === playerId
                                                    );
                                                    return (
                                                        <motion.span
                                                            key={playerId}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index * 0.1,
                                                            }}
                                                            className={`px-4 py-2 rounded-full font-semibold ${
                                                                index === 0
                                                                    ? "bg-yellow-400 text-black"
                                                                    : "bg-white/20 text-white"
                                                            }`}
                                                        >
                                                            {index + 1}.{" "}
                                                            {player?.name}
                                                        </motion.span>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>powered by 電子機械工学部</div>
                </div>
            )}
        </div>
    );
}
