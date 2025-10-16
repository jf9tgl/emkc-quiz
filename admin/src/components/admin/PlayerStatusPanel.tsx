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
    onAdjustScore?: (playerId: number, delta: number) => void;
    onResetAllScores?: () => void;
}

export function PlayerStatusPanel({
    players,
    pressedOrder,
    onUpdatePlayerName,
    onAdjustScore,
    onResetAllScores,
}: PlayerStatusPanelProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users size={20} />
                    プレーヤー状況
                </h2>
                
                {/* Reset All Scores Button */}
                {onResetAllScores && (
                    <button
                        onClick={onResetAllScores}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
                    >
                        全員のスコアをリセット
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-2">
                        <div className="flex-1">
                            <PlayerItem
                                player={player}
                                onUpdateName={onUpdatePlayerName}
                            />
                        </div>
                        
                        {/* Score Adjustment Buttons */}
                        {onAdjustScore && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onAdjustScore(player.id, -1)}
                                    className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-bold transition-colors"
                                    title="スコア -1"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => onAdjustScore(player.id, 1)}
                                    className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-700 rounded-md font-bold transition-colors"
                                    title="スコア +1"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
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
