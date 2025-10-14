// バックエンドの型定義に対応
export type Player = {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
};

export type QuestionData = {
    question: string;
    answer: string;
    hint: string | null;
};

export type QuizState = {
    questionData: QuestionData | null;
    isActive: boolean;
    players: Player[];
    pressedOrder: number[];
    showHint?: boolean;
    showAnswer?: boolean;
};

export type QuizSetting = {
    maxPlayers: number;
    hintTime: number;
    answerTime: number;
    correctPoints: number;
    incorrectPoints: number;
    answerBreakPenalty: number;
};

// Socket.IO イベント用の型
export type SocketEvents = {
    // 受信イベント
    state: QuizState;
    buttonPressed: { buttonId: number; timestamp: number };

    // 送信イベント
    setQuestion: QuestionData;
    updatePlayerName: { playerId: number; name: string };
    correctAnswer: void;
    incorrectAnswer: void;
    endQuiz: void;
    setShowHint: boolean;
    setShowAnswer: boolean;
};

// フロントエンド専用の型
export type QuestionSet = {
    id: string;
    title: string;
    questions: QuestionData[];
    createdAt: string;
};

export type ConnectionStatus =
    | "connected"
    | "disconnected"
    | "connecting"
    | "error";

export type UIState = {
    currentQuestionIndex: number;
    questionSets: QuestionSet[];
    selectedQuestionSet: string | null;
};
