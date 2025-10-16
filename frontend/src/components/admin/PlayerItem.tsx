"use client";

import { useState } from "react";
import { Edit3, Check, X, Plus, Minus } from "lucide-react";

interface Player {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
}

interface PlayerItemProps {
    player: Player;
    onUpdateName: (playerId: number, newName: string) => void;
    onAdjustScore?: (playerId: number, adjustment: number) => void;
}

export function PlayerItem({ player, onUpdateName, onAdjustScore }: PlayerItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState(player.name);

    const handleStartEditing = () => {
        setIsEditing(true);
        setEditingName(player.name);
    };

    const handleSaveName = () => {
        if (editingName.trim()) {
            onUpdateName(player.id, editingName.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingName(player.name);
    };

    return (
        <div
            className={`p-3 rounded-md border-2 ${player.pressed
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 bg-white"
                }`}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) =>
                                    setEditingName(e.target.value)
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveName();
                                    if (e.key === "Escape")
                                        handleCancelEdit();
                                }}
                                autoFocus
                            />
                            <button
                                onClick={handleSaveName}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{player.name}</span>
                            <button
                                onClick={handleStartEditing}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Edit3 size={14} />
                            </button>
                        </div>
                    )}
                    {player.order && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                            {player.order}番目
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onAdjustScore && (
                        <>
                            <button
                                onClick={() => onAdjustScore(player.id, -1)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="1点減らす"
                            >
                                <Minus size={16} />
                            </button>
                            <button
                                onClick={() => onAdjustScore(player.id, 1)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="1点増やす"
                            >
                                <Plus size={16} />
                            </button>
                        </>
                    )}
                    <span className="font-bold text-lg">{player.score}pt</span>
                </div>
            </div>
        </div>
    );
}
