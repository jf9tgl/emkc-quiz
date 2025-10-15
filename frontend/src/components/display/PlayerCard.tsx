"use client";

import { motion } from "framer-motion";

interface Player {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
}

interface PlayerCardProps {
    player: Player;
    rankIndex: number;
}

export function PlayerCard({ player, rankIndex }: PlayerCardProps) {
    const isPressed = player.pressed;
    const order = player.order;
    const isFirst = order === 1;

    return (
        <motion.div
            animate={{
                scale: isPressed ? 1.05 : 1,
                rotateY: isPressed ? 5 : 0,
            }}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isPressed
                    ? isFirst
                        ? "bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-400/30"
                        : "bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-400/30"
                    : "bg-white/10 border-white/20"
                }`}
        >
            {/* Ranking Badge */}
            {rankIndex < 3 && (
                <div
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rankIndex === 0
                            ? "bg-yellow-400 text-black"
                            : rankIndex === 1
                                ? "bg-gray-300 text-black"
                                : "bg-orange-400 text-black"
                        }`}
                >
                    {rankIndex + 1}
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
                    <span className="text-sm ml-1 opacity-70">pt</span>
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
}
