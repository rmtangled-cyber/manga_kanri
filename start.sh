#!/bin/bash
set -e

echo "=== バックエンド依存関係をインストール ==="
cd backend
pip install -r requirements.txt -q

echo "=== バックエンドを起動 ==="
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "=== フロントエンド依存関係をインストール ==="
cd ../frontend
npm install -q

echo "=== フロントエンドを起動 ==="
npm run dev &
FRONTEND_PID=$!

echo ""
echo "起動完了！"
echo "  フロントエンド: http://localhost:5173"
echo "  バックエンドAPI: http://localhost:8000"
echo ""
echo "終了するには Ctrl+C"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
