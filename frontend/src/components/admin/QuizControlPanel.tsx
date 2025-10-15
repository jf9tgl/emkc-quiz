"use client";

import { CheckCircle, XCircle, Eye, EyeOff, Square } from "lucide-react";

interface QuizControlPanelProps {
    showHint: boolean;
    showAnswer: boolean;
    pressedOrderCount: number;
    onToggleHint: () => void;
    onToggleAnswer: () => void;
    onCorrectAnswer: () => void;
    onIncorrectAnswer: () => void;
    onEndQuiz: () => void;
}

export function QuizControlPanel({
    showHint,
    showAnswer,
    pressedOrderCount,
    onToggleHint,
    onToggleAnswer,
    onCorrectAnswer,
    onIncorrectAnswer,
    onEndQuiz,
}: QuizControlPanelProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">操作パネル</h2>

            <div className="space-y-4">
                {/* Display Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={onToggleHint}
                        className={`flex-1 py-2 px-4 rounded-md font-medium flex items-center justify-center ${showHint
                                ? "bg-orange-600 text-white"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}
                    >
                        {showHint ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span className="ml-2">
                            ヒント{showHint ? "非表示" : "表示"}
                        </span>
                    </button>

                    <button
                        onClick={onToggleAnswer}
                        className={`flex-1 py-2 px-4 rounded-md font-medium flex items-center justify-center ${showAnswer
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            }`}
                    >
                        {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span className="ml-2">
                            答え{showAnswer ? "非表示" : "表示"}
                        </span>
                    </button>
                </div>

                {/* Answer Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={onCorrectAnswer}
                        disabled={pressedOrderCount === 0}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        正解
                    </button>

                    <button
                        onClick={onIncorrectAnswer}
                        disabled={pressedOrderCount === 0}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                        <XCircle size={20} />
                        不正解
                    </button>
                </div>

                <button
                    onClick={onEndQuiz}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
                >
                    <Square size={16} />
                    クイズ終了
                </button>
            </div>
        </div>
    );
}
