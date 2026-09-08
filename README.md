# 漫画管理アプリ

読んだ漫画の進捗をフォルダで管理するWebアプリです。

## 機能

- **漫画検索** — タイトルで検索して一覧から選択（Jikan API使用）
- **読書記録** — 巻数または話数で進捗を記録
- **フォルダ管理** — 好きな名前でフォルダを作って整理

## 起動方法

### かんたん起動（推奨）

`start.bat` をダブルクリックするだけ！  
バックエンド・フロントエンドが自動で起動してブラウザが開きます。

### 手動で起動する場合

**ターミナル1（バックエンド）:**
```powershell
cd backend
py -3.12 -m uvicorn main:app --port 8000
```

**ターミナル2（フロントエンド）:**
```powershell
cd frontend
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

## 初回セットアップ

Python 3.12 と Node.js が必要です。

```powershell
# バックエンドの依存関係
cd backend
py -3.12 -m pip install -r requirements.txt --prefer-binary

# フロントエンドの依存関係
cd ../frontend
npm install
```

## 注意

漫画検索は MyAnimeList が稼働中のときのみ動作します。  
ダウン中はフォルダ管理のみ利用できます。
