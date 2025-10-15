"use client";

import { Users } from "lucide-react";
import { PlayerItem } from "./PlayerItem";

interface Player {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
}

interface PlayerStatusPanelProps {
    players: Player[];
    pressedOrder: number[];
    onUpdatePlayerName: (playerId: number, newName: string) => void;
}

export function PlayerStatusPanel({
    players,
    pressedOrder,
    onUpdatePlayerName,
}: PlayerStatusPanelProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                プレーヤー状況
            </h2>

            <div className="space-y-3">
                {players.map((player) => (
                    <PlayerItem
                        key={player.id}
                        player={player}
                        onUpdateName={onUpdatePlayerName}
                    />
                ))}
            </div>

            {/* Press Order */}
            {pressedOrder.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h3 className="font-medium text-blue-900 mb-2">
                        押下順序
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                        {pressedOrder.map((playerId, index) => {
                            const player = players.find(
                                (p) => p.id === playerId
                            );
                            return (
                                <span
                                    key={playerId}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${index === 0
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-200 text-blue-800"
                                        }`}
                                >
                                    {index + 1}. {player?.name}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
