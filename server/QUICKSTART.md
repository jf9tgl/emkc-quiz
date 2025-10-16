# 自前サーバーデプロイ - クイックスタート

## 🚀 最速デプロイ手順

### 1. サーバーにSSH接続

```bash
ssh user@your-server.com
```

### 2. Node.jsのインストール（未インストールの場合）

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# または nvm を使用
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 3. PM2のインストール

```bash
npm install -g pm2
```

### 4. リポジトリをクローン

```bash
cd /var/www  # または任意のディレクトリ
git clone https://github.com/jf9tgl/emkc-quiz.git
cd emkc-quiz/server
```

### 5. 環境変数を設定

```bash
nano .env
```

以下を記述：

```
PORT=3001
ALLOWED_ORIGINS=https://your-client-domain.com,http://localhost:3000
```

保存して終了（Ctrl+X, Y, Enter）

### 6. デプロイスクリプトを実行

#### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

#### または手動で
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # 自動起動を有効化
```

### 7. 動作確認

```bash
# ステータス確認
pm2 status

# ログ確認
pm2 logs emkc-quiz-server

# サーバーにアクセス
curl http://localhost:3001
```

## 🔒 ファイアウォール設定

```bash
# ポート3001を開く
sudo ufw allow 3001/tcp

# または Nginxを使う場合は80, 443のみ
sudo ufw allow 'Nginx Full'
```

## 🌐 Nginx設定（オプションだが推奨）

### Nginxのインストール

```bash
sudo apt update
sudo apt install nginx
```

### 設定ファイルを作成

```bash
sudo nano /etc/nginx/sites-available/emkc-quiz
```

以下を記述：

```nginx
upstream emkc_quiz {
    server localhost:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://emkc_quiz;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

### 有効化

```bash
sudo ln -s /etc/nginx/sites-available/emkc-quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL証明書（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔄 更新手順

```bash
cd /var/www/emkc-quiz/server
git pull
npm install
npm run build
pm2 restart emkc-quiz-server
```

または：

```bash
npm run deploy
```

## 📊 モニタリング

```bash
# リアルタイムモニタリング
pm2 monit

# ステータス確認
pm2 status

# ログ確認
pm2 logs emkc-quiz-server

# エラーログのみ
pm2 logs emkc-quiz-server --err

# 最近のログ
pm2 logs emkc-quiz-server --lines 100
```

## 🛑 停止・再起動

```bash
# 再起動
pm2 restart emkc-quiz-server

# 停止
pm2 stop emkc-quiz-server

# 削除
pm2 delete emkc-quiz-server
```

## ⚠️ トラブルシューティング

### ポートが使用中

```bash
sudo lsof -i :3001
# プロセスIDを確認して終了
sudo kill -9 <PID>
```

### PM2が起動しない

```bash
pm2 kill
pm2 start ecosystem.config.cjs
```

### ログを確認

```bash
# アプリケーションログ
pm2 logs emkc-quiz-server

# Nginxログ
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 📝 チェックリスト

デプロイ前に確認：

- [ ] Node.js 20以上がインストールされている
- [ ] PM2がインストールされている
- [ ] `.env`ファイルが作成されている
- [ ] `ALLOWED_ORIGINS`が正しく設定されている
- [ ] ファイアウォールでポートが開いている
- [ ] （オプション）Nginxが設定されている
- [ ] （オプション）SSL証明書が設定されている

デプロイ後に確認：

- [ ] `pm2 status`でプロセスが起動している
- [ ] `curl http://localhost:3001`でレスポンスが返る
- [ ] ログにエラーがない
- [ ] クライアントから接続できる

## 🎯 完了！

これで自前サーバーでのホスティングが完了しました。

サーバーURL: `https://your-domain.com` または `http://your-ip:3001`

このURLをクライアント（Vercel）の環境変数 `NEXT_PUBLIC_SERVER_URL` に設定してください。
