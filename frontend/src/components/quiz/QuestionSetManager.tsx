"use client";

import { useState } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { QuestionData, QuestionSet, QuizSetting } from "@/lib/types";
import {
    Plus,
    Trash2,
    Edit,
    Download,
    Upload,
    Settings,
    Save,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionSetManagerProps {
    onQuestionSelect: (question: QuestionData) => void;
}

export function QuestionSetManager({
    onQuestionSelect,
}: QuestionSetManagerProps) {
    const {
        questionSets,
        selectedQuestionSet,
        addQuestionSet,
        removeQuestionSet,
        setSelectedQuestionSet,
        loadQuestionSets,
    } = useQuizStore();

    const [isCreating, setIsCreating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const [newSetTitle, setNewSetTitle] = useState("");
    const [newQuestions, setNewQuestions] = useState<QuestionData[]>([
        { question: "", answer: "", hint: null },
    ]);

    const [quizSettings, setQuizSettings] = useState<QuizSetting>({
        maxPlayers: 6,
        hintTime: 10,
        answerTime: 20,
        correctPoints: 10,
        incorrectPoints: -5,
        answerBreakPenalty: 1,
    });

    const handleCreateSet = () => {
        if (
            newSetTitle.trim() &&
            newQuestions.some((q) => q.question.trim() && q.answer.trim())
        ) {
            const newSet: QuestionSet = {
                id: Date.now().toString(),
                title: newSetTitle.trim(),
                questions: newQuestions.filter(
                    (q) => q.question.trim() && q.answer.trim()
                ),
                createdAt: new Date().toISOString(),
            };

            addQuestionSet(newSet);
            setIsCreating(false);
            setNewSetTitle("");
            setNewQuestions([{ question: "", answer: "", hint: null }]);
        }
    };

    const handleAddQuestion = () => {
        setNewQuestions([
            ...newQuestions,
            { question: "", answer: "", hint: null },
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (newQuestions.length > 1) {
            setNewQuestions(newQuestions.filter((_, i) => i !== index));
        }
    };

    const handleUpdateQuestion = (
        index: number,
        field: keyof QuestionData,
        value: string
    ) => {
        const updated = [...newQuestions];
        if (field === "hint") {
            updated[index] = { ...updated[index], [field]: value || null };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setNewQuestions(updated);
    };

    const handleExportData = () => {
        const exportData = {
            questionSets,
            quizSettings,
            exportedAt: new Date().toISOString(),
            version: "1.0.0",
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quiz-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target?.result as string);

                if (
                    importData.questionSets &&
                    Array.isArray(importData.questionSets)
                ) {
                    // 既存のセットをクリアして新しいデータをインポート
                    localStorage.removeItem("quiz-question-sets");
                    importData.questionSets.forEach((set: QuestionSet) => {
                        addQuestionSet({
                            ...set,
                            id:
                                Date.now().toString() +
                                Math.random().toString(36).substr(2, 9), // 重複を避けるために新しいIDを生成
                        });
                    });
                }

                if (importData.quizSettings) {
                    setQuizSettings(importData.quizSettings);
                }

                alert("データのインポートが完了しました！");
                loadQuestionSets();
            } catch (error) {
                alert(
                    "ファイルの読み込みに失敗しました。正しいJSON形式かご確認ください。"
                );
                console.error("Import error:", error);
            }
        };

        reader.readAsText(file);
        event.target.value = ""; // ファイル選択をリセット
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">問題セット管理</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                        title="クイズ設定"
                    >
                        <Settings size={20} />
                    </button>

                    <label
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md cursor-pointer"
                        title="インポート"
                    >
                        <Upload size={20} />
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                        />
                    </label>

                    <button
                        onClick={handleExportData}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                        title="エクスポート"
                    >
                        <Download size={20} />
                    </button>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                        title="新しいセットを作成"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* クイズ設定パネル */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-gray-50 rounded-lg border"
                    >
                        <h3 className="font-semibold mb-4">クイズ設定</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    正解ポイント
                                </label>
                                <input
                                    type="number"
                                    value={quizSettings.correctPoints}
                                    onChange={(e) =>
                                        setQuizSettings((prev) => ({
                                            ...prev,
                                            correctPoints:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    不正解ポイント
                                </label>
                                <input
                                    type="number"
                                    value={quizSettings.incorrectPoints}
                                    onChange={(e) =>
                                        setQuizSettings((prev) => ({
                                            ...prev,
                                            incorrectPoints:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    休みペナルティ
                                </label>
                                <input
                                    type="number"
                                    value={quizSettings.answerBreakPenalty}
                                    onChange={(e) =>
                                        setQuizSettings((prev) => ({
                                            ...prev,
                                            answerBreakPenalty:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 新規作成フォーム */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-blue-900">
                                新しい問題セットを作成
                            </h3>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setNewSetTitle("");
                                    setNewQuestions([
                                        {
                                            question: "",
                                            answer: "",
                                            hint: null,
                                        },
                                    ]);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                セット名
                            </label>
                            <input
                                type="text"
                                value={newSetTitle}
                                onChange={(e) => setNewSetTitle(e.target.value)}
                                placeholder="例: 第1回クイズ大会"
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">
                                    問題一覧
                                </label>
                                <button
                                    onClick={handleAddQuestion}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <Plus size={16} />
                                    問題を追加
                                </button>
                            </div>

                            {newQuestions.map((question, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-white rounded-lg border border-gray-200"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-medium text-gray-700">
                                            問題 {index + 1}
                                        </span>
                                        {newQuestions.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    handleRemoveQuestion(index)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                問題文
                                            </label>
                                            <textarea
                                                value={question.question}
                                                onChange={(e) =>
                                                    handleUpdateQuestion(
                                                        index,
                                                        "question",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="問題文を入力..."
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                rows={2}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                答え
                                            </label>
                                            <input
                                                type="text"
                                                value={question.answer}
                                                onChange={(e) =>
                                                    handleUpdateQuestion(
                                                        index,
                                                        "answer",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="正解を入力..."
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                ヒント（任意）
                                            </label>
                                            <input
                                                type="text"
                                                value={question.hint || ""}
                                                onChange={(e) =>
                                                    handleUpdateQuestion(
                                                        index,
                                                        "hint",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="ヒントを入力..."
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleCreateSet}
                                disabled={
                                    !newSetTitle.trim() ||
                                    !newQuestions.some(
                                        (q) =>
                                            q.question.trim() && q.answer.trim()
                                    )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save size={16} />
                                保存
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 問題セット一覧 */}
            <div className="space-y-3">
                {questionSets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        問題セットがありません。新しいセットを作成してください。
                    </div>
                ) : (
                    questionSets.map((set) => (
                        <div
                            key={set.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedQuestionSet === set.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                            onClick={() => setSelectedQuestionSet(set.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">
                                        {set.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {set.questions.length}問 • 作成日:{" "}
                                        {new Date(
                                            set.createdAt
                                        ).toLocaleDateString("ja-JP")}
                                    </p>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // 編集機能は将来実装予定
                                            alert("編集機能は今後実装予定です");
                                        }}
                                        className="p-1 text-gray-600 hover:text-blue-600"
                                        title="編集"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                                confirm(
                                                    "この問題セットを削除しますか？"
                                                )
                                            ) {
                                                removeQuestionSet(set.id);
                                            }
                                        }}
                                        className="p-1 text-gray-600 hover:text-red-600"
                                        title="削除"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {selectedQuestionSet === set.id && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        問題一覧:
                                    </h4>
                                    <div className="space-y-2">
                                        {set.questions.map(
                                            (question, index) => (
                                                <div
                                                    key={index}
                                                    className="p-2 bg-white rounded border"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                Q{index + 1}:{" "}
                                                                {
                                                                    question.question
                                                                }
                                                            </p>
                                                            <p className="text-xs text-green-700">
                                                                答え:{" "}
                                                                {
                                                                    question.answer
                                                                }
                                                            </p>
                                                            {question.hint && (
                                                                <p className="text-xs text-orange-600">
                                                                    ヒント:{" "}
                                                                    {
                                                                        question.hint
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                onQuestionSelect(
                                                                    question
                                                                )
                                                            }
                                                            className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                        >
                                                            選択
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
