"use client";

import { useEffect, useRef } from "react";
import { useQuizStore } from "@/store/quiz-store";
import { audioSynthesizer } from "@/lib/audio-synthesizer";

export function SoundManager() {
    const buttonSoundRef = useRef<HTMLAudioElement | null>(null);
    const correctSoundRef = useRef<HTMLAudioElement | null>(null);
    const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
    const useSynthesizer = useRef<boolean>(false);

    const { pressedOrder } = useQuizStore();
    const prevPressedOrderRef = useRef<number[]>([]);

    useEffect(() => {
        // 音声ファイルをプリロード
        const loadAudioFile = (
            src: string
        ): Promise<HTMLAudioElement | null> => {
            return new Promise((resolve) => {
                const audio = new Audio(src);
                audio.addEventListener("canplaythrough", () => resolve(audio), {
                    once: true,
                });
                audio.addEventListener("error", () => resolve(null), {
                    once: true,
                });
                audio.load();
            });
        };

        Promise.all([
            loadAudioFile("/sounds/button-press.mp3"),
            loadAudioFile("/sounds/correct.mp3"),
            loadAudioFile("/sounds/incorrect.mp3"),
        ]).then(([buttonSound, correctSound, incorrectSound]) => {
            buttonSoundRef.current = buttonSound;
            correctSoundRef.current = correctSound;
            incorrectSoundRef.current = incorrectSound;

            // いずれかの音声ファイルが読み込めない場合は合成音を使用
            if (!buttonSound || !correctSound || !incorrectSound) {
                useSynthesizer.current = true;
                console.log(
                    "音声ファイルが見つからないため、合成音を使用します"
                );
            } else {
                // 音量設定
                buttonSound.volume = 0.7;
                correctSound.volume = 0.8;
                incorrectSound.volume = 0.8;
            }
        });

        return () => {
            // クリーンアップ
            buttonSoundRef.current = null;
            correctSoundRef.current = null;
            incorrectSoundRef.current = null;
        };
    }, []);

    // ボタン押下音の再生
    useEffect(() => {
        const prevLength = prevPressedOrderRef.current.length;
        const currentLength = pressedOrder.length;

        if (currentLength > prevLength) {
            // 新しくボタンが押された
            if (useSynthesizer.current) {
                audioSynthesizer.playButtonPress();
            } else if (buttonSoundRef.current) {
                buttonSoundRef.current.currentTime = 0;
                buttonSoundRef.current.play().catch(console.error);
            }
        }

        prevPressedOrderRef.current = [...pressedOrder];
    }, [pressedOrder]);

    // 正解・不正解音の再生
    useEffect(() => {
        const handleCorrectAnswer = () => {
            if (useSynthesizer.current) {
                audioSynthesizer.playCorrect();
            } else if (correctSoundRef.current) {
                correctSoundRef.current.currentTime = 0;
                correctSoundRef.current.play().catch(console.error);
            }
        };

        const handleIncorrectAnswer = () => {
            if (useSynthesizer.current) {
                audioSynthesizer.playIncorrect();
            } else if (incorrectSoundRef.current) {
                incorrectSoundRef.current.currentTime = 0;
                incorrectSoundRef.current.play().catch(console.error);
            }
        };

        // Socket.IOイベントリスナーを追加
        import("@/lib/socket").then(({ socketManager }) => {
            socketManager.on("correctAnswer", handleCorrectAnswer);
            socketManager.on("incorrectAnswer", handleIncorrectAnswer);
        });

        return () => {
            // クリーンアップ
            import("@/lib/socket").then(({ socketManager }) => {
                socketManager.off("correctAnswer", handleCorrectAnswer);
                socketManager.off("incorrectAnswer", handleIncorrectAnswer);
            });
        };
    }, []);

    return null; // 音声のみなので表示要素はなし
}
