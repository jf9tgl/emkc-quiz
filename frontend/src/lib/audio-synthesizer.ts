/**
 * Web Audio APIを使用して合成音を生成するユーティリティ
 */

class AudioSynthesizer {
    private audioContext: AudioContext | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as typeof window & {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;
            this.audioContext = new AudioContextClass();
        }
    }

    private createTone(
        frequency: number,
        duration: number,
        type: OscillatorType = "sine"
    ): void {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(
            frequency,
            this.audioContext.currentTime
        );
        oscillator.type = type;

        // エンベロープ（音の立ち上がりと立ち下がり）
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
            0.3,
            this.audioContext.currentTime + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + duration
        );

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    public playButtonPress(): void {
        // ボタン押下音: 短いクリック音
        this.createTone(800, 0.1, "square");
    }

    public playCorrect(): void {
        // 正解音: 上昇する音階
        if (!this.audioContext) return;

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.3, "sine");
            }, index * 100);
        });
    }

    public playIncorrect(): void {
        // 不正解音: 下降する音
        if (!this.audioContext) return;

        const notes = [400, 300, 200]; // 下降音階
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.2, "sawtooth");
            }, index * 150);
        });
    }
}

export const audioSynthesizer = new AudioSynthesizer();
