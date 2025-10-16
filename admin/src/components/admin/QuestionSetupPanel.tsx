"use client";

import { Play } from "lucide-react";
import { QuestionData } from "@shared/types";

interface QuestionSetupPanelProps {
    newQuestion: QuestionData;
    isActive: boolean;
    onQuestionChange: (question: QuestionData) => void;
    onStartQuestion: () => void;
}

export function QuestionSetupPanel({
    newQuestion,
    isActive,
    onQuestionChange,
    onStartQuestion,
}: QuestionSetupPanelProps) {
    return (
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
                            onQuestionChange({
                                ...newQuestion,
                                question: e.target.value,
                            })
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
                            onQuestionChange({
                                ...newQuestion,
                                answer: e.target.value,
                            })
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
                            onQuestionChange({
                                ...newQuestion,
                                hint: e.target.value,
                            })
                        }
                        placeholder="ヒントを入力してください..."
                    />
                </div>

                <button
                    onClick={onStartQuestion}
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
    );
}
