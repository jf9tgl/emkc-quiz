# EMKC Quiz Server デプロイスクリプト (PowerShell版)
# 使用方法: .\deploy.ps1

Write-Host "🚀 EMKC Quiz Server デプロイ開始..." -ForegroundColor Cyan

# 現在のディレクトリを確認
if (-not (Test-Path "server.ts")) {
    Write-Host "エラー: serverディレクトリで実行してください" -ForegroundColor Red
    exit 1
}

# 1. 依存関係のインストール
Write-Host "📦 依存関係をインストール中..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: npm install に失敗しました" -ForegroundColor Red
    exit 1
}

# 2. ビルド
Write-Host "🔨 ビルド中..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: ビルドに失敗しました" -ForegroundColor Red
    exit 1
}

# 3. distディレクトリの確認
if (-not (Test-Path "dist")) {
    Write-Host "エラー: ビルドに失敗しました（distディレクトリが見つかりません）" -ForegroundColor Red
    exit 1
}

# 4. PM2の確認
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2Installed) {
    Write-Host "PM2がインストールされていません。インストールしますか? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "y" -or $response -eq "Y") {
        npm install -g pm2
    } else {
        Write-Host "PM2が必要です。手動でインストールしてください: npm install -g pm2" -ForegroundColor Red
        exit 1
    }
}

# 5. PM2でサーバーを起動/再起動
Write-Host "🔄 サーバーを起動/再起動中..." -ForegroundColor Yellow
$pm2List = pm2 list
if ($pm2List -match "emkc-quiz-server") {
    Write-Host "既存のプロセスを再起動します..."
    pm2 restart emkc-quiz-server
} else {
    Write-Host "新しいプロセスを起動します..."
    pm2 start ecosystem.config.cjs
}

# 6. PM2の設定を保存
pm2 save

# 7. ステータス確認
Write-Host "`n✅ デプロイ完了！" -ForegroundColor Green
Write-Host ""
pm2 status

Write-Host ""
Write-Host "🎉 サーバーが正常にデプロイされました！" -ForegroundColor Green
Write-Host ""
Write-Host "ログを確認: pm2 logs emkc-quiz-server"
Write-Host "ステータス確認: pm2 status"
Write-Host "再起動: pm2 restart emkc-quiz-server"
Write-Host "停止: pm2 stop emkc-quiz-server"
