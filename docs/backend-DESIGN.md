## 概要

このドキュメントは `server/server.ts` の設計書です。Arduino（シリアル）を用いた早押しクイズシステムのバックエンドで、Next.js フロントエンドとは WebSocket（socket.io）で通信します。主な役割は以下です。

- Arduino とのシリアル通信の確立と受信データの処理
- クイズ状態（問題、プレーヤー、順位、スコアなど）の管理
- フロントエンドとの双方向通信（状態送信、操作受信）

## 主要コンポーネント

- Express サーバー（HTTPサーバは socket.io 用に作成）
- Socket.IO（フロントエンドとの双方向通信）
- SerialPort（Arduino とのシリアル通信）
- quizState, quizSetting（プロセス内のメモリ状態）

外部依存:

- express
- socket.io
- serialport
- cors

## 環境設定

- PORT: サーバーがリッスンするポート（デフォルト 3001）
- ARDUINO_PORT: 任意のシリアルポートを指定する場合に使用（優先される）

シリアル設定（コード内固定）:

- baudRate: 9600

## データモデル

型定義（コードに対応）:

- Player
  - id: number
  - name: string
  - score: number
  - pressed: boolean
  - order: number | null

- QuestionData
  - question: string
  - answer: string
  - hint: string | null

- QuizState
  - questionData: QuestionData | null
  - isActive: boolean
  - players: Player[]
  - pressedOrder: number[] (プレーヤーID の配列、押下順)

- QuizSetting
  - maxPlayers: number
  - hintTime: number
  - answerTime: number
  - correctPoints: number
  - incorrectPoints: number
  - answerBreakPenalty: number

- ArduinoData (受信 JSON 想定)
  - type: string
  - buttonId?: number
  - message?: string
  - timestamp: number

## WebSocket API（socket.io イベント）

サーバー → クライアント:

- `state`: 現在の `QuizState` 全体を送信
- `buttonPressed`: { buttonId: number, timestamp: number }

クライアント → サーバー:

- `setQuestion` : payload = QuestionData
  - 動作: サーバーは `quizState.questionData = data; quizState.isActive = true; quizState.pressedOrder = []` を実行し、必要に応じて `state` を送る

- `updatePlayerName` : payload = { playerId: number, name: string }
  - 動作: 指定プレーヤー名を更新し、呼び出し元に `state` を返す

- `correctAnswer` : payload = none
  - 動作: 最初に押したプレーヤー（pressedOrder[0]）に `correctPoints` を加算、クイズを終了、状態リセット、`state` を返す

- `incorrectAnswer` : payload = none
  - 動作: 最初に押したプレーヤーに `incorrectPoints` を加算、該当プレーヤーをオーダーから削除、オーダーを再計算、`state` を返す

- `endQuiz` : payload = none
  - 動作: クイズを強制終了して押下情報をクリア、`state` を返す

注意: 現状、各イベントの送信者へのみ `state` を返しているが、`io.emit("state", quizState)` を用いることで全クライアントへブロードキャストすることも行われている（`buttonPressed` の発火時など）。

## シーケンス（主要フロー）

1. 起動
   - `findArduinoPort()` を実行し、利用可能なシリアルポート一覧を出力
   - 環境変数 `ARDUINO_PORT` があればそれを優先
   - ポートが見つからなければプロセス終了
   - `SerialPort` を生成して `initializeSerial()` を登録
   - Express と Socket.IO を起動して接続待ち

2. クライアント接続
   - `connection(socket)` が呼ばれる
   - 接続直後に `socket.emit("state", quizState)` を送り初期状態を同期
   - クライアントイベントを受け、状態を更新・応答

3. Arduino からのデータ受信
   - シリアルデータをバッファリングし、改行でメッセージを分割
   - 各行を JSON.parse して `ArduinoData` として処理
   - `type === "pressedButton"` の場合 `handleButtonPress` を実行

4. ボタン押下処理
   - クイズがアクティブでない場合は無視
   - プレーヤーが既に押している場合は無視
   - `pressed` を true にし `order` を設定、`pressedOrder` に playerId を push
   - `io.emit("buttonPressed", { buttonId, timestamp })` と `io.emit("state", quizState)` をブロードキャスト

5. 正解/不正解処理
   - `correctAnswer()` は pressedOrder[0] のスコアに `correctPoints` を加算しクイズを終了（押下状態をクリア）
   - `incorrectAnswer()` は pressedOrder[0] のスコアに `incorrectPoints` を加算し、当該プレーヤーをオーダーから削除してオーダーを再計算

## エラーハンドリング

- シリアルポートが見つからない場合: 起動時にプロセスを終了し、ログを出力
- SerialPort の `error` イベント: エラーをログに出力（現状はリトライや再接続ロジックは無し）
- 受信したデータの JSON.parse に失敗した場合: 例外を捕捉してエラーログを出力し、その行をスキップ
- 無効なプレーヤーID、範囲外アクセス: ワーニングを出力し無視

## 設計上の注意点 / 制約

- 状態はプロセス内メモリのみで管理される（プロセス再起動でロスト）
- クライアント間の競合制御は単一プロセス内で行われる想定（水平スケール不可）
- シリアル通信は Arduino 側の出力が JSON ライン単位であることが前提

## 推奨改善点（短期/中期）

短期:
- シリアル再接続ロジックの追加（ポート切断時の自動復旧）
- 主要操作（スコア変更、クイズ開始終了）での全クライアントブロードキャスト整備（現在は一部のみ）
- 型安全性向上（受信メッセージのバリデーション）

中期:
- クイズ状態の永続化（簡易 DB またはファイル）を追加して意図しない再起動に備える
- テストカバレッジの追加（ユニットテスト: ボタン処理、正解/不正解ロジック）
- 複数プロセス/スケール時のセッション共有を検討（Redis 等）

## 実行 / デバッグ方法

開発実行（例）:

```powershell
# ルートがリポジトリの server ディレクトリにいる前提
# 依存のインストール
npm install

# 環境変数を指定して起動
$env:ARDUINO_PORT = "COM3" # Windows の例。実際のポートに置き換える
node ./dist/server.js # ビルド後の実行ファイル
```

ビルドが不要な場合（ts-node 等を使う場合）や Next.js クライアントとの接続方法はプロジェクトの README を参照してください。

## 主要なメッセージ例

Arduino → サーバー (1行 JSON)

```json
{"type":"pressedButton","buttonId":2,"timestamp":1700000000000}
```

クライアント → サーバー

`setQuestion` の例:

```json
{"question":"日本の首都は？","answer":"東京","hint":null}
```

`updatePlayerName` の例:

```json
{"playerId":2,"name":"Alice"}
```

## 変更履歴

- 2025-10-13: 初版作成（`server.ts` から抽出）

---

ファイル: `server/server.ts` を基に作成。質問や追加で記載してほしい項目があれば教えてください。
