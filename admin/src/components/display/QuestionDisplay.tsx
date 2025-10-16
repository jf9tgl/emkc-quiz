"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Eye } from "lucide-react";
import { QuestionData } from "@shared/types";

interface QuestionDisplayProps {
    questionData: QuestionData;
    showHint: boolean;
    showAnswer: boolean;
}

export function QuestionDisplay({
    questionData,
    showHint,
    showAnswer,
}: QuestionDisplayProps) {
    return (
        <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-4xl"
        >
            {/* Question */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    {questionData.question}
                </h2>
            </div>

            {/* Hint */}
            <AnimatePresence>
                {showHint && questionData.hint && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                        }}
                        className="bg-orange-500/20 backdrop-blur-md rounded-xl p-6 mb-6 border border-orange-400/30"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Eye className="text-orange-400" size={24} />
                            <span className="text-xl font-semibold text-orange-300">
                                ヒント
                            </span>
                        </div>
                        <p className="text-2xl text-orange-100">
                            {questionData.hint}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Answer */}
            <AnimatePresence>
                {showAnswer && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                        }}
                        className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border border-green-400/30"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="text-green-400" size={24} />
                            <span className="text-xl font-semibold text-green-300">
                                正解
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-green-200">
                            {questionData.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
