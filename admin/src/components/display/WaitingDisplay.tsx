"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function WaitingDisplay() {
    return (
        <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
        >
            <Clock className="mx-auto mb-4 text-white/50" size={64} />
            <h2 className="text-4xl font-bold text-white/70">
                問題を待機中...
            </h2>
        </motion.div>
    );
}
