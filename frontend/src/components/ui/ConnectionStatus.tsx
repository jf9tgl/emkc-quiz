"use client";

import { useQuizStore } from "@/store/quiz-store";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

export function ConnectionStatus() {
    const connectionStatus = useQuizStore((state) => state.connectionStatus);

    const getStatusConfig = () => {
        switch (connectionStatus) {
            case "connected":
                return {
                    icon: Wifi,
                    text: "接続済み",
                    color: "text-green-500",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                };
            case "connecting":
                return {
                    icon: Loader2,
                    text: "接続中...",
                    color: "text-yellow-500",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                    animate: true,
                };
            case "disconnected":
                return {
                    icon: WifiOff,
                    text: "切断",
                    color: "text-gray-500",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                };
            case "error":
                return {
                    icon: AlertCircle,
                    text: "エラー",
                    color: "text-red-500",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            default:
                return {
                    icon: WifiOff,
                    text: "不明",
                    color: "text-gray-500",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
        >
            <Icon
                size={16}
                className={`${config.color} ${
                    config.animate ? "animate-spin" : ""
                }`}
            />
            <span className={`text-sm font-medium ${config.color}`}>
                {config.text}
            </span>
        </div>
    );
}
