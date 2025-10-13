"use client";

import { useState } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { QuestionData } from "@/lib/types";
import {
    Play,
    Square,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Users,
} from "lucide-react";

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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        クイズ管理画面
                    </h1>
                    <ConnectionStatus />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel - Controls */}
                    <div className="space-y-6">
                        {/* Question Setup */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Play size={20} />
                                問題設定
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        問題文
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        value={newQuestion.question}
                                        onChange={(e) =>
                                            setNewQuestion((prev) => ({
                                                ...prev,
                                                question: e.target.value,
                                            }))
                                        }
                                        placeholder="問題文を入力してください..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        答え
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={newQuestion.answer}
                                        onChange={(e) =>
                                            setNewQuestion((prev) => ({
                                                ...prev,
                                                answer: e.target.value,
                                            }))
                                        }
                                        placeholder="正解を入力してください..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ヒント（任意）
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={newQuestion.hint || ""}
                                        onChange={(e) =>
                                            setNewQuestion((prev) => ({
                                                ...prev,
                                                hint: e.target.value,
                                            }))
                                        }
                                        placeholder="ヒントを入力してください..."
                                    />
                                </div>

                                <button
                                    onClick={handleStartQuestion}
                                    disabled={
                                        !newQuestion.question.trim() ||
                                        !newQuestion.answer.trim() ||
                                        isActive
                                    }
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                >
                                    {isActive ? "クイズ実行中" : "問題開始"}
                                </button>
                            </div>
                        </div>

                        {/* Quiz Controls */}
                        {isActive && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold mb-4">
                                    操作パネル
                                </h2>

                                <div className="space-y-4">
                                    {/* Display Controls */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setShowHint(!showHint)
                                            }
                                            className={`flex-1 py-2 px-4 rounded-md font-medium ${
                                                showHint
                                                    ? "bg-orange-600 text-white"
                                                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                            }`}
                                        >
                                            {showHint ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                            <span className="ml-2">
                                                ヒント
                                                {showHint ? "非表示" : "表示"}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                setShowAnswer(!showAnswer)
                                            }
                                            className={`flex-1 py-2 px-4 rounded-md font-medium ${
                                                showAnswer
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                            }`}
                                        >
                                            {showAnswer ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                            <span className="ml-2">
                                                答え
                                                {showAnswer ? "非表示" : "表示"}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Answer Controls */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={sendCorrectAnswer}
                                            disabled={pressedOrder.length === 0}
                                            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            正解
                                        </button>

                                        <button
                                            onClick={sendIncorrectAnswer}
                                            disabled={pressedOrder.length === 0}
                                            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={20} />
                                            不正解
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleEndQuiz}
                                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        <Square size={16} />
                                        クイズ終了
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Status */}
                    <div className="space-y-6">
                        {/* Current Question */}
                        {questionData && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold mb-4">
                                    現在の問題
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">
                                            問題文
                                        </span>
                                        <p className="text-lg mt-1">
                                            {questionData.question}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">
                                            答え
                                        </span>
                                        <p className="text-lg mt-1 font-semibold text-green-700">
                                            {questionData.answer}
                                        </p>
                                    </div>
                                    {questionData.hint && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">
                                                ヒント
                                            </span>
                                            <p className="text-lg mt-1 text-orange-600">
                                                {questionData.hint}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Player Status */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Users size={20} />
                                プレーヤー状況
                            </h2>

                            <div className="space-y-3">
                                {players.map((player) => (
                                    <div
                                        key={player.id}
                                        className={`p-3 rounded-md border-2 ${
                                            player.pressed
                                                ? "border-yellow-400 bg-yellow-50"
                                                : "border-gray-200 bg-white"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">
                                                    {player.name}
                                                </span>
                                                {player.order && (
                                                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                                                        {player.order}番目
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-bold text-lg">
                                                {player.score}pt
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Press Order */}
                            {pressedOrder.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        押下順序
                                    </h3>
                                    <div className="flex gap-2">
                                        {pressedOrder.map((playerId, index) => {
                                            const player = players.find(
                                                (p) => p.id === playerId
                                            );
                                            return (
                                                <span
                                                    key={playerId}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        index === 0
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
                    </div>
                </div>
            </div>
        </div>
    );
}
