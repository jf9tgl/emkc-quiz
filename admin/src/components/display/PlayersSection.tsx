"use client";

import { PlayerCard } from "./PlayerCard";
import { PressOrderDisplay } from "./PressOrderDisplay";

interface Player {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
}

interface PlayersSectionProps {
    players: Player[];
    pressedOrder: number[];
}

export function PlayersSection({
    players,
    pressedOrder,
}: PlayersSectionProps) {
    return (
        <div className="p-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-center">
                    プレーヤー
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {players.map((player, index) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            rankIndex={index}
                        />
                    ))}
                </div>

                <PressOrderDisplay
                    pressedOrder={pressedOrder}
                    players={players}
                />
            </div>
        </div>
    );
}
