import os
import shutil
import fitz
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List
import uuid

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "tmp"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# tmpディレクトリを公開
app.mount("/tmp", StaticFiles(directory=UPLOAD_DIR), name="tmp")


# アプリ終了時にtmp内のファイルを削除
@app.on_event("shutdown")
def cleanup_tmp_dir():
    print("🚨 アプリ終了時: tmpディレクトリをクリーンアップします")
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        try:
            if os.path.isfile(file_path) and file_path.endswith(".pdf"):
                os.remove(file_path)
        except Exception as e:
            print(f"⚠️ ファイル削除エラー: {file_path} -> {e}")


# PDFをアップロード・分割
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = f"{UPLOAD_DIR}/{file_id}.pdf"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf = fitz.open(file_path)
    image_paths = []

    for page_num in range(len(pdf)):
        single_pdf = fitz.open()
        single_pdf.insert_pdf(pdf, from_page=page_num, to_page=page_num)
        single_path = f"{UPLOAD_DIR}/{file_id}_page_{page_num+1}.pdf"
        single_pdf.save(single_path)
        image_paths.append({"page": page_num + 1, "path": single_path})

    return {"file_id": file_id, "pages": image_paths}


# PDFを結合
@app.post("/merge/")
async def merge_pdfs(file_paths: List[str] = Form(...), output_name: str = Form(...)):
    merger = fitz.open()

    for path in file_paths:
        pdf = fitz.open(path)
        merger.insert_pdf(pdf)

    output_path = f"{UPLOAD_DIR}/{output_name}.pdf"
    merger.save(output_path)

    return FileResponse(
        output_path, media_type="application/pdf", filename=f"{output_name}.pdf"
    )
