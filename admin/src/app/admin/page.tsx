"use client";

import { useState } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { QuestionSetManager } from "@/components/quiz/QuestionSetManager";
import { SoundManager } from "@/components/audio/SoundManager";
import { QuestionSetupPanel } from "@/components/admin/QuestionSetupPanel";
import { QuizControlPanel } from "@/components/admin/QuizControlPanel";
import { CurrentQuestionDisplay } from "@/components/admin/CurrentQuestionDisplay";
import { PlayerStatusPanel } from "@/components/admin/PlayerStatusPanel";
import { QuestionData } from "@shared/types";

export default function AdminPage() {
    const {
        questionData,
        isActive,
        players,
        pressedOrder,
        showHint,
        showAnswer,
        sendSetQuestion,
        sendCorrectAnswer,
        sendIncorrectAnswer,
        sendEndQuiz,
        sendUpdatePlayerName,
        sendAdjustScore,
        sendResetAllScores,
        setShowHint,
        setShowAnswer,
    } = useQuizStore();

    const [newQuestion, setNewQuestion] = useState<QuestionData>({
        question: "",
        answer: "",
        hint: null,
    });

    const handleStartQuestion = () => {
        if (newQuestion.question.trim() && newQuestion.answer.trim()) {
            sendSetQuestion({
                ...newQuestion,
                hint: newQuestion.hint?.trim() || null,
            });
            setShowHint(false);
            setShowAnswer(false);
        }
    };

    const handleEndQuiz = () => {
        sendEndQuiz();
        setShowHint(false);
        setShowAnswer(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* 音響効果マネージャー */}
            <SoundManager />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        クイズ管理画面
                    </h1>
                    <ConnectionStatus />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Question Set Management */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <QuestionSetManager
                            onQuestionSelect={(question) =>
                                setNewQuestion(question)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Panel - Controls */}
                        <div className="space-y-6">
                            {/* Question Setup */}
                            <QuestionSetupPanel
                                newQuestion={newQuestion}
                                isActive={isActive}
                                onQuestionChange={setNewQuestion}
                                onStartQuestion={handleStartQuestion}
                            />

                            {/* Quiz Controls */}
                            {isActive && (
                                <QuizControlPanel
                                    showHint={showHint!}
                                    showAnswer={showAnswer!}
                                    pressedOrderCount={pressedOrder.length}
                                    onToggleHint={() => setShowHint(!showHint)}
                                    onToggleAnswer={() =>
                                        setShowAnswer(!showAnswer)
                                    }
                                    onCorrectAnswer={sendCorrectAnswer}
                                    onIncorrectAnswer={sendIncorrectAnswer}
                                    onEndQuiz={handleEndQuiz}
                                />
                            )}
                        </div>

                        {/* Right Panel - Status */}
                        <div className="space-y-6">
                            {/* Current Question */}
                            {questionData && (
                                <CurrentQuestionDisplay
                                    questionData={questionData}
                                />
                            )}

                            {/* Player Status */}
                            <PlayerStatusPanel
                                players={players}
                                pressedOrder={pressedOrder}
                                onUpdatePlayerName={sendUpdatePlayerName}
                                onAdjustScore={sendAdjustScore}
                                onResetAllScores={sendResetAllScores}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
