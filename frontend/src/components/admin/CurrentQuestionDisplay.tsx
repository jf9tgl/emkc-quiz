"use client";

import { QuestionData } from "@/lib/types";

interface CurrentQuestionDisplayProps {
    questionData: QuestionData;
}

export function CurrentQuestionDisplay({
    questionData,
}: CurrentQuestionDisplayProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">現在の問題</h2>
            <div className="space-y-3">
                <div>
                    <span className="text-sm font-medium text-gray-500">
                        問題文
                    </span>
                    <p className="text-lg mt-1">{questionData.question}</p>
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
    );
}
