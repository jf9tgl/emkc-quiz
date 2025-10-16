import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
    QuizState,
    UIState,
    ConnectionStatus,
    QuestionSet,
    QuestionData,
    QuizSetting,
} from "@shared/types";
import { socketManager } from "@/lib/socket";

interface QuizStore extends QuizState, UIState {
    // 接続状態
    connectionStatus: ConnectionStatus;

    // Actions
    setConnectionStatus: (status: ConnectionStatus) => void;
    updateQuizState: (state: QuizState) => void;

    // UI Actions
    setShowHint: (show: boolean) => void;
    setShowAnswer: (show: boolean) => void;
    setCurrentQuestionIndex: (index: number) => void;

    // Question Set Management
    addQuestionSet: (questionSet: QuestionSet) => void;
    removeQuestionSet: (id: string) => void;
    setSelectedQuestionSet: (id: string | null) => void;
    loadQuestionSets: () => void;
    saveQuestionSets: () => void;

    // Socket Actions
    sendSetQuestion: (question: QuestionData) => void;
    sendUpdatePlayerName: (playerId: number, name: string) => void;
    sendSetQuizSetting: (setting: Partial<QuizSetting>) => void;
    sendCorrectAnswer: () => void;
    sendIncorrectAnswer: () => void;
    sendEndQuiz: () => void;

    // Tablet Button Actions
    sendPressButton: (playerId: number) => void;
    sendAdjustScore: (playerId: number, delta: number) => void;
    sendResetAllScores: () => void;
}

const STORAGE_KEY = "quiz-question-sets";

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

const initialUIState: UIState = {
    currentQuestionIndex: 0,
    questionSets: [],
    selectedQuestionSet: null,
};

export const useQuizStore = create<QuizStore>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        ...initialQuizState,
        ...initialUIState,
        connectionStatus: "disconnected",

        // Connection Actions
        setConnectionStatus: (status) => set({ connectionStatus: status }),

        updateQuizState: (state) => {
            console.log("状態更新受信:", state);
            set({
                questionData: state.questionData,
                isActive: state.isActive,
                players: state.players,
                pressedOrder: state.pressedOrder,
                showHint: state.showHint !== undefined ? state.showHint : false,
                showAnswer:
                    state.showAnswer !== undefined ? state.showAnswer : false,
            });
        },

        // UI Actions
        setShowHint: (show) => {
            console.log(`フロントエンド: ヒント表示設定 ${show}`);
            set({ showHint: show });
            socketManager.emit("setShowHint", show);
        },
        setShowAnswer: (show) => {
            console.log(`フロントエンド: 答え表示設定 ${show}`);
            set({ showAnswer: show });
            socketManager.emit("setShowAnswer", show);
        },
        setCurrentQuestionIndex: (index) =>
            set({ currentQuestionIndex: index }),

        // Question Set Management
        addQuestionSet: (questionSet) =>
            set((state) => {
                const newQuestionSets = [...state.questionSets, questionSet];
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(newQuestionSets)
                );
                return { questionSets: newQuestionSets };
            }),

        removeQuestionSet: (id) =>
            set((state) => {
                const newQuestionSets = state.questionSets.filter(
                    (qs) => qs.id !== id
                );
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(newQuestionSets)
                );
                return {
                    questionSets: newQuestionSets,
                    selectedQuestionSet:
                        state.selectedQuestionSet === id
                            ? null
                            : state.selectedQuestionSet,
                };
            }),

        setSelectedQuestionSet: (id) => set({ selectedQuestionSet: id }),

        loadQuestionSets: () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const questionSets = JSON.parse(stored) as QuestionSet[];
                    set({ questionSets });
                }
            } catch (error) {
                console.error("Failed to load question sets:", error);
            }
        },

        saveQuestionSets: () => {
            const { questionSets } = get();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(questionSets));
        },

        // Socket Actions
        sendSetQuestion: (question) => {
            socketManager.emit("setQuestion", question);
        },

        sendUpdatePlayerName: (playerId, name) => {
            socketManager.emit("updatePlayerName", { playerId, name });
        },

        sendSetQuizSetting: (setting) => {
            socketManager.emit("setQuizSetting", setting);
        },

        sendCorrectAnswer: () => {
            socketManager.emit("correctAnswer", undefined);
        },

        sendIncorrectAnswer: () => {
            socketManager.emit("incorrectAnswer", undefined);
        },

        sendEndQuiz: () => {
            socketManager.emit("endQuiz", undefined);
        },

        // Tablet Button Actions
        sendPressButton: (playerId) => {
            socketManager.emit("pressButton", {
                playerId,
                timestamp: Date.now(),
            });
        },

        sendAdjustScore: (playerId, delta) => {
            socketManager.emit("adjustScore", { playerId, delta });
        },

        sendResetAllScores: () => {
            socketManager.emit("resetAllScores", undefined);
        },
    }))
);

// Socket event listeners setup
export const setupSocketListeners = () => {
    socketManager.on("state", (state) => {
        useQuizStore.getState().updateQuizState(state as QuizState);
    });

    socketManager.on("buttonPressed", (data) => {
        console.log("Button pressed:", data);
        // 効果音やアニメーション用のイベントをここで処理
    });
};
