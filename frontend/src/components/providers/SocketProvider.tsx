"use client";

import React, { useEffect, useRef } from "react";
import { socketManager } from "@/lib/socket";
import { useQuizStore, setupSocketListeners } from "@/store/quiz-store";
import toast, { Toaster } from "react-hot-toast";

interface SocketProviderProps {
    children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const setConnectionStatus = useQuizStore(
        (state) => state.setConnectionStatus
    );
    const loadQuestionSets = useQuizStore((state) => state.loadQuestionSets);
    const hasSetupListeners = useRef(false);

    useEffect(() => {
        // Load question sets from localStorage
        loadQuestionSets();

        // Connect to socket
        const socket = socketManager.connect();
        setConnectionStatus("connecting");

        // Setup socket event listeners (only once)
        if (!hasSetupListeners.current) {
            setupSocketListeners();
            hasSetupListeners.current = true;
        }

        // Connection status handlers
        socket.on("connect", () => {
            setConnectionStatus("connected");
            toast.success("サーバーに接続しました");
        });

        socket.on("disconnect", (reason) => {
            setConnectionStatus("disconnected");
            toast.error(`サーバーから切断されました: ${reason}`);
        });

        socket.on("connect_error", (error) => {
            setConnectionStatus("error");
            toast.error("接続エラーが発生しました");
            console.error("Socket connection error:", error);
        });

        socket.on("reconnect", (attemptNumber) => {
            setConnectionStatus("connected");
            toast.success(`サーバーに再接続しました (試行: ${attemptNumber})`);
        });

        socket.on("reconnect_attempt", (attemptNumber) => {
            setConnectionStatus("connecting");
            toast.loading(`再接続中... (${attemptNumber}/5)`, {
                id: "reconnecting",
            });
        });

        socket.on("reconnect_failed", () => {
            setConnectionStatus("error");
            toast.dismiss("reconnecting");
            toast.error("サーバーへの再接続に失敗しました");
        });

        // Cleanup on unmount
        return () => {
            socketManager.disconnect();
        };
    }, [setConnectionStatus, loadQuestionSets]);

    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                }}
            />
        </>
    );
}
