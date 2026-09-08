@echo off
chcp 65001 > nul
echo 漫画管理アプリを起動中...

start "バックエンド" cmd /k "cd /d %~dp0backend && py -3.12 -m uvicorn main:app --port 8000"

timeout /t 2 /nobreak > nul

start "フロントエンド" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 4 /nobreak > nul

start http://localhost:5173
