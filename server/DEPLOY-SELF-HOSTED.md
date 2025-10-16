# 自前サーバーデプロイガイド

## 概要

Socket.IOを使用しているため、このサーバーは自前サーバーでホストします。

## システム要件

- Node.js 20以上
- npm または bun
- ポート3001（または任意のポート）が開いている
- HTTPS対応推奨（Let's Encryptなど）

## デプロイ方法

### 1. サーバーにファイルをコピー

```bash
# リポジトリをクローン
git clone https://github.com/jf9tgl/emkc-quiz.git
cd emkc-quiz/server

# または、serverディレクトリのみをアップロード
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env`ファイルを作成：

```bash
PORT=3001
ALLOWED_ORIGINS=https://your-domain.com,https://client-domain.com
```

### 4. ビルド

```bash
npm run build
```

### 5. 起動

#### 開発モード
```bash
npm run dev
```

#### 本番モード
```bash
npm start
```

## プロセス管理（PM2推奨）

### PM2のインストール

```bash
npm install -g pm2
```

### PM2で起動

```bash
# ビルド済みのサーバーを起動
pm2 start dist/server.js --name emkc-quiz-server

# または、TypeScriptを直接起動（tsx使用）
pm2 start server.ts --name emkc-quiz-server --interpreter tsx

# 起動時に自動起動を有効化
pm2 startup
pm2 save
```

### PM2コマンド

```bash
# ステータス確認
pm2 status

# ログ確認
pm2 logs emkc-quiz-server

# 再起動
pm2 restart emkc-quiz-server

# 停止
pm2 stop emkc-quiz-server

# 削除
pm2 delete emkc-quiz-server
```

## systemdでの起動（Linux）

`/etc/systemd/system/emkc-quiz.service`を作成：

```ini
[Unit]
Description=EMKC Quiz Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/emkc-quiz/server
ExecStart=/usr/bin/node /path/to/emkc-quiz/server/dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

起動：

```bash
sudo systemctl daemon-reload
sudo systemctl enable emkc-quiz
sudo systemctl start emkc-quiz
sudo systemctl status emkc-quiz
```

## Nginxリバースプロキシ設定

WebSocketをサポートする必要があります。

`/etc/nginx/sites-available/emkc-quiz`を作成：

```nginx
upstream emkc_quiz {
    server localhost:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    # HTTPSにリダイレクト
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://emkc_quiz;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocketタイムアウト設定
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

有効化：

```bash
sudo ln -s /etc/nginx/sites-available/emkc-quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Let's Encrypt (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## ファイアウォール設定

```bash
# ポート3001を開く（Node.jsサーバー用）
sudo ufw allow 3001/tcp

# Nginx用（80, 443）
sudo ufw allow 'Nginx Full'

# SSHも忘れずに
sudo ufw allow ssh

# 有効化
sudo ufw enable
```

## 更新手順

```bash
# リポジトリを更新
cd /path/to/emkc-quiz
git pull

# サーバーディレクトリに移動
cd server

# 依存関係を更新
npm install

# ビルド
npm run build

# PM2で再起動
pm2 restart emkc-quiz-server

# またはsystemdで再起動
sudo systemctl restart emkc-quiz
```

## 監視

### PM2での監視

```bash
# リアルタイムモニタリング
pm2 monit

# WebダッシュボードKeymetrics（オプション）
pm2 link <secret_key> <public_key>
```

### ログ管理

```bash
# PM2ログローテーション
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## トラブルシューティング

### ポートが使用中

```bash
# ポート3001を使用しているプロセスを確認
sudo lsof -i :3001

# プロセスを終了
sudo kill -9 <PID>
```

### WebSocket接続エラー

1. Nginxの設定を確認（Upgrade, Connection ヘッダー）
2. ファイアウォール設定を確認
3. CORS設定を確認（.env の ALLOWED_ORIGINS）

### メモリ不足

```bash
# Node.jsのメモリ制限を増やす
NODE_OPTIONS="--max-old-space-size=4096" npm start

# PM2の場合
pm2 start dist/server.js --name emkc-quiz-server --node-args="--max-old-space-size=4096"
```

## バックアップ

```bash
# データベースがない場合は不要
# 設定ファイルのみバックアップ
cp .env .env.backup
```

## セキュリティ

1. **環境変数を保護**
   ```bash
   chmod 600 .env
   ```

2. **ファイアウォール設定**
   - 必要なポートのみ開く

3. **定期的な更新**
   ```bash
   npm audit
   npm update
   ```

4. **HTTPS必須**
   - Let's Encryptで証明書を取得

## パフォーマンスチューニング

### クラスタリング（オプション）

複数のCPUコアを使用：

```bash
pm2 start dist/server.js -i max --name emkc-quiz-server
```

## 推奨スペック

### 最小スペック
- CPU: 1コア
- RAM: 512MB
- ストレージ: 1GB

### 推奨スペック
- CPU: 2コア
- RAM: 2GB
- ストレージ: 10GB
- 帯域幅: 100Mbps

## 費用目安

### VPS
- さくらVPS: 月額580円〜
- ConoHa VPS: 月額678円〜
- AWS Lightsail: 月額$3.50〜

### クラウド
- DigitalOcean: 月額$4〜
- Linode: 月額$5〜
- Vultr: 月額$2.50〜

## まとめ

自前サーバーでホストする場合：

1. ✅ Socket.IO完全対応
2. ✅ 完全なコントロール
3. ✅ カスタマイズ可能
4. ⚠️ サーバー管理が必要
5. ⚠️ SSL証明書の管理
6. ⚠️ セキュリティ対策

Clientは引き続きVercelにデプロイし、Serverのみ自前サーバーでホストするのが最適です。
