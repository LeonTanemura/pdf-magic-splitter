# 📄 PDF Magic Splitter

**PDF Magic Splitter** は、PDFファイルを簡単に1ページずつ分割し、選んだページを自由な順番で合体・ダウンロードできる Web アプリです。

## 🔧 主な機能

- PDFを1ページずつに分割  

- ページの順番をドラッグ＆ドロップで並び替え  

- 必要なページを選択して合体  

- 合体後のPDFをその場でプレビュー＆ダウンロード  

- ドラッグ＆ドロップによるアップロード対応

## 🛠️ 使用技術

| フロントエンド                       | バックエンド         |
|------------------------------------|----------------------|
| Next.js 15 + React + Tailwind CSS | FastAPI (Python)     |
| react-dropzone                    | PyMuPDF (fitz)       |
| react-sortablejs                  | -                    |


## 📁 ディレクトリ構成

PDF-Split-App/ \
├── frontend/ # Next.js プロジェクト \
└── backend/ # FastAPI バックエンド

## 🚀 セットアップ手順

### 1. このリポジトリをクローン

```bash
git clone URL
cd pdf-magic-splitter
```

### 2. バックエンドの起動（FastAPI）

① Python仮想環境の作成と起動
```bash
cd backend
python -m venv venv
. venv/bin/activate
```
② 依存パッケージをインストール
```bash
pip install -r requirements.txt
```
③ サーバーを起動
```bash
uvicorn main:app --reload
```
FastAPI が http://localhost:8000 で立ち上がります。

### 3. フロントエンドの起動（Next.js）
別ターミナルの起動
```bash
cd frontend
npm install
npm run dev
```
ブラウザで http://localhost:3000 にアクセス。

## 📌 使い方
1. トップページにアクセス

2. PDFをドラッグ＆ドロップまたはクリックでアップロード

3. アップロードボタンを押すと、ページごとに分割されて表示されます

4. 必要なページにチェックを入れ、順番を確認

5. ファイル名を入力して「PDF合体」→「ダウンロード」！

## 📝 注意事項
- 大きすぎるPDFファイルは分割に時間がかかることがあります

## 📄 ライセンス
- **MIT License**

## 🙌 作者
- Leon Tanemura
