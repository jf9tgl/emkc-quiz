# フロントエンド設計書 (Next.js)

この設計書は `docs/backend-DESIGN.md`（`server/server.ts` 由来）の仕様に基づき、Next.js ベースのフロントエンド実装の設計をまとめたものです。

目的:

-   バックエンドと WebSocket (socket.io) で連携する UI を提供する
-   クイズの状態を表示し、ユーザ操作（プレーヤー名更新、クイズ開始、正誤判定など）をサーバへ送信する
-   Arduino のボタン押下 (他クライアント発生) をリアルタイムに反映する

想定技術スタック:

-   Next.js (App Router)
-   React (Functional Components + Hooks)
-   TypeScript
-   socket.io-client
-   Zustand または React Context（軽量な状態管理）
-   Tailwind CSS / CSS Modules（UI）

## 目次

1. ページ構成
2. UI コンポーネント
3. 状態管理（client-side state）
4. Socket イベントとデータ契約
5. ユーザーフローとシーケンス
6. エラーハンドリングと回復
7. テスト戦略
8. 実装ステップ（優先度）

---

## 1. ページ構成

-   /admin

    -   司会用の操作（問題セット、開始 / 終了、正解/不正解ボタン）
    -   プレーヤー一覧、スコアボード、現在の問題、押下順を表示
    -   問題がセットされていない場合は initial 画面を表示
    -   / initial
        -   初期状態。プレーヤー登録前の画面
        -   プレーヤー名入力フォームと参加ボタンを表示
        -   複数の問題(問題文、ヒント、答え)を入力できる
        -   参加後は `/admin` にリダイレクトして管理画面に遷移
        -   JSON 形式で保存することができ、読み込みもできる

-   /display
    -   プロジェクター等に映す用のシンプルな画面
    -   上部に現在の問題、下部にプレイヤー情報を表示
    -   プレイヤー情報は登録順で並べ、名前とスコアを表示、押下順にハイライト
    -   正解/不正解のフィードバックを大きく表示（司会が操作）
    -   ヒント表示機能（司会が操作）
    -   答えの表示機能（司会が操作）

実際のプロジェクトには既に `frontend/src/app` とページが存在するため、既存構成に合わせてコンポーネントを追加・差し替えます。

## 2. UI コンポーネント

-   AppLayout

    -   SocketProvider を含むルートレイアウト。グローバルスタイル、接続状態を表示

-   Dashboard (管理画面)

    -   QuestionEditor: 問題入力（question/answer/hint）と `setQuestion` 送信
    -   PlayerList: プレーヤー名、スコア、pressed 状態、order を表示（PlayerRow を内部に持つ）
    -   Controls: `correctAnswer`, `incorrectAnswer`, `endQuiz` などのボタン（誤操作防止の確認ダイアログ付き）
    -   Log/Events: Arduino からのイベントやエラーを表示する簡易ログ

-   ConnectionStatus
    -   Socket 接続状態、再接続の試行状況、シリアル接続状態等を表示

## 3. 状態管理

設計方針: フロントエンドではサーバーが真実のソースであるため、Socket 経由で受け取った `state` を単一のソースとして扱う。ローカル UI 状態は最小限にする。

型 (TypeScript):

```ts
type Player = {
    id: number;
    name: string;
    score: number;
    pressed: boolean;
    order: number | null;
};
type QuestionData = { question: string; answer: string; hint: string | null };
type QuizState = {
    questionData: QuestionData | null;
    isActive: boolean;
    players: Player[];
    pressedOrder: number[];
};
```

推奨: `Zustand` などで `useQuizStore` を用意し、`state` を受け取って更新する。SocketProvider は受信イベントで store を更新する。

## 4. Socket イベントとデータ契約

バックエンド設計に従いフロント側で利用するイベント:

受信 (サーバー → クライアント):

-   `state`: QuizState
-   `buttonPressed`: { buttonId: number; timestamp: number }

送信 (クライアント → サーバー):

-   `setQuestion` : QuestionData
-   `updatePlayerName` : { playerId: number; name: string }
-   `correctAnswer` : void
-   `incorrectAnswer` : void
-   `endQuiz` : void

接続ライフサイクル:

-   SocketProvider は接続時に初期 `state` を受け取り store を初期化する
-   接続が切断されたら UI 上に通知し、再接続時に再同期（サーバーから `state` を再送受信することを期待）

## 5. ユーザーフローとシーケンス

1. ページロード

    - SocketProvider が接続を確立
    - サーバーから `state` を受信し UI を描画

2. 管理者が問題をセット

    - QuestionEditor から `setQuestion` を送信
    - サーバーは `quizState.isActive = true` として押下受付を開始、`state` を更新してブロードキャスト

3. Arduino または他クライアントのボタン押下

    - ブラウザは `buttonPressed` を受信してアニメーションや効果音を再生
    - `state` を受信してスコアボードや順序表示を更新

4. 管理者が `correctAnswer` または `incorrectAnswer` を押す
    - サーバーがスコア計算・状態変更を行い、更新された `state` をブロードキャスト

## 6. エラーハンドリングと回復

-   Socket 切断: ConnectionStatus に表示。自動再接続を有効にしておき、再接続成功時にサーバーの `state` を受けて UI を再同期
-   不正な `state` 受信: 受信時に簡易バリデーション（players が配列である、各 player に id がある等）を行い、不整合時はロギングして破棄または部分更新
-   操作送信失敗: 失敗した操作は UI レベルでトースト表示し、再試行ボタンを提供

## 7. テスト戦略

-   ユニットテスト:

    -   UI コンポーネントのレンダリング（React Testing Library）
    -   Score/Order 計算ロジック（pure function があれば関数単位で）

-   統合テスト:

    -   Socket のモックを使った一連のフロー（setQuestion → buttonPressed → state update → correctAnswer）

-   E2E:
    -   Playwright などでブラウザからの操作を自動化（実際にサーバーを立てての確認）

## 8. 実装ステップ（優先度付き）

優先度: 高 → 低

1. SocketProvider と `useQuizStore` の実装（高）

    - 接続/再接続、受信 `state` の反映、送信ヘルパーを提供

2. Dashboard コンポーネント（高）

    - PlayerList、QuestionEditor、Controls を実装し、store と接続

3. ConnectionStatus とエラーハンドリング UI（中）

4. ユニットテスト/統合テスト（中）

5. プレーヤービュー・ScoreBoard の見た目改善（低）
