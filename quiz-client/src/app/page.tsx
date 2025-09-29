import styles from "@/styles/Home.module.css";
import Link from "next/link";

export const metadata = {
    title: "電子機械工学部式クイズシステム",
};

export default function Home() {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>
                    🎤 電子機械工学部式クイズシステム
                </h1>

                <p className={styles.description}>
                    早押しクイズシステムへようこそ！
                </p>

                <div className={styles.grid}>
                    <Link href="/control" className={styles.card}>
                        <h2>🎮 コントロール画面</h2>
                        <p>問題の管理・操作を行います（PC画面用）</p>
                    </Link>

                    <Link href="/display" className={styles.card}>
                        <h2>📺 表示画面</h2>
                        <p>観客向け大画面表示（プロジェクター用）</p>
                    </Link>
                </div>

                <div className={styles.info}>
                    <h3>📋 使用方法</h3>
                    <ol>
                        <li>Arduino早押しボタンをPCに接続</li>
                        <li>
                            サーバーを起動: <code>npm start</code> in server
                            directory
                        </li>
                        <li>PCで「コントロール画面」を開く</li>
                        <li>プロジェクターで「表示画面」を開く</li>
                        <li>問題を入力してクイズ開始！</li>
                    </ol>
                </div>
            </main>
        </div>
    );
}
