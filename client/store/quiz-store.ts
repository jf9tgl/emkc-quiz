import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { QuizState, ConnectionStatus } from "@/shared/types";
import { socketManager } from "@/lib/socket";

interface QuizStore extends QuizState {
    // 接続状態
    connectionStatus: ConnectionStatus;

    // Actions
    setConnectionStatus: (status: ConnectionStatus) => void;
    updateQuizState: (state: QuizState) => void;

    // Socket Actions
    sendPressButton: (playerId: number) => void;
}

const initialQuizState: QuizState = {
    questionData: null,
    isActive: false,
    players: Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Player ${i + 1}`,
        score: 0,
        pressed: false,
        order: null,
    })),
    pressedOrder: [],
    showHint: false,
    showAnswer: false,
};

export const useQuizStore = create<QuizStore>()(
    subscribeWithSelector((set) => ({
        // Initial state
        ...initialQuizState,
        connectionStatus: "disconnected" as ConnectionStatus,

        // Actions
        setConnectionStatus: (status) => set({ connectionStatus: status }),

        updateQuizState: (state) =>
            set({
                questionData: state.questionData,
                isActive: state.isActive,
                players: state.players,
                pressedOrder: state.pressedOrder,
                showHint: state.showHint,
                showAnswer: state.showAnswer,
            } as Partial<QuizStore>),

        // Socket Actions
        sendPressButton: (playerId) => {
            socketManager.emit("pressButton", {
                playerId,
                timestamp: Date.now(),
            });
        },
    }))
);

// Socket event listeners setup
export const setupSocketListeners = () => {
    // 接続開始
    const socket = socketManager.connect();

    // 接続状態の監視
    socket.on("connect", () => {
        useQuizStore.getState().setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
        useQuizStore.getState().setConnectionStatus("disconnected");
    });

    socket.on("connect_error", () => {
        useQuizStore.getState().setConnectionStatus("error");
    });

    // クイズ状態の受信
    socketManager.on("state", (data) => {
        useQuizStore.getState().updateQuizState(data as QuizState);
    });

    // ボタン押下イベント（オプション）
    socketManager.on("buttonPressed", (data) => {
        console.log("Button pressed:", data);
    });
};
