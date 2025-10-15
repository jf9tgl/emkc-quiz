"use client";

import { motion } from "framer-motion";

interface Player {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
}

interface PressOrderDisplayProps {
    pressedOrder: number[];
    players: Player[];
}

export function PressOrderDisplay({
    pressedOrder,
    players,
}: PressOrderDisplayProps) {
    if (pressedOrder.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 text-center">
            <h4 className="text-lg font-semibold mb-3 text-white/80">
                押下順序
            </h4>
            <div className="flex justify-center gap-3 flex-wrap">
                {pressedOrder.map((playerId, index) => {
                    const player = players.find((p) => p.id === playerId);
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
                                delay: index * 0.1,
                            }}
                            className={`px-4 py-2 rounded-full font-semibold ${index === 0
                                    ? "bg-yellow-400 text-black"
                                    : "bg-white/20 text-white"
                                }`}
                        >
                            {index + 1}. {player?.name}
                        </motion.span>
                    );
                })}
            </div>
        </div>
    );
}
