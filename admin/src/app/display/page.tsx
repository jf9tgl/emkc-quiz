"use client";

import { useQuizStore } from "@/store/quiz-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { SoundManager } from "@/components/audio/SoundManager";
import { QuestionDisplay } from "@/components/display/QuestionDisplay";
import { WaitingDisplay } from "@/components/display/WaitingDisplay";
import { PlayersSection } from "@/components/display/PlayersSection";
import { Trophy } from "lucide-react";
import { AnimatePresence } from "framer-motion";
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
                        </div>
                        <ConnectionStatus />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Question Section */}
                        <div className="flex-1 flex items-center justify-center p-8">
                            <AnimatePresence mode="wait">
                                {questionData && isActive ? (
                                    <QuestionDisplay
                                        questionData={questionData}
                                        showHint={showHint ? showHint : false}
                                        showAnswer={
                                            showAnswer ? showAnswer : false
                                        }
                                    />
                                ) : (
                                    <WaitingDisplay />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Players Section */}
                        <PlayersSection
                            players={players}
                            pressedOrder={pressedOrder}
                        />
                    </div>

                    <div>powered by 電子機械工学部</div>
                </div>
            )}
        </div>
    );
}
