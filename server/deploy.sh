#!/bin/bash

# EMKC Quiz Server デプロイスクリプト
# 使用方法: ./deploy.sh

set -e

echo "🚀 EMKC Quiz Server デプロイ開始..."

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 現在のディレクトリを確認
if [ ! -f "server.ts" ]; then
    echo -e "${RED}エラー: serverディレクトリで実行してください${NC}"
    exit 1
fi

# 1. 依存関係のインストール
echo -e "${YELLOW}📦 依存関係をインストール中...${NC}"
npm install

# 2. ビルド
echo -e "${YELLOW}🔨 ビルド中...${NC}"
npm run build

# 3. distディレクトリの確認
if [ ! -d "dist" ]; then
    echo -e "${RED}エラー: ビルドに失敗しました${NC}"
    exit 1
fi

# 4. PM2の確認
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2がインストールされていません。インストールしますか? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npm install -g pm2
    else
        echo -e "${RED}PM2が必要です。手動でインストールしてください: npm install -g pm2${NC}"
        exit 1
    fi
fi

# 5. PM2でサーバーを起動/再起動
echo -e "${YELLOW}🔄 サーバーを起動/再起動中...${NC}"
if pm2 list | grep -q "emkc-quiz-server"; then
    echo "既存のプロセスを再起動します..."
    pm2 restart emkc-quiz-server
else
    echo "新しいプロセスを起動します..."
    pm2 start ecosystem.config.cjs
fi

# 6. PM2の設定を保存
pm2 save

# 7. ステータス確認
echo -e "${GREEN}✅ デプロイ完了！${NC}"
echo ""
pm2 status

echo ""
echo -e "${GREEN}🎉 サーバーが正常にデプロイされました！${NC}"
echo ""
echo "ログを確認: pm2 logs emkc-quiz-server"
echo "ステータス確認: pm2 status"
echo "再起動: pm2 restart emkc-quiz-server"
echo "停止: pm2 stop emkc-quiz-server"
