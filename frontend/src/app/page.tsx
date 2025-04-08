"use client";
import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { ReactSortable } from "react-sortablejs";

type PageFromServer = {
  page: number;
  path: string;
};

type PdfPage = PageFromServer & {
  id: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [outputName, setOutputName] = useState("");
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:8000/upload/", formData);

    const pagesWithId = (res.data.pages as PageFromServer[]).map((p, idx) => ({
      ...p,
      id: `${p.page}-${Date.now()}-${idx}`,
    }));

    setPages(pagesWithId);
    setSelectedPages([]);
    setMergedPdfUrl(null);
  };

  const handleSelect = (path: string) => {
    if (selectedPages.includes(path)) {
      setSelectedPages((prev) => prev.filter((p) => p !== path));
    } else {
      setSelectedPages((prev) => [...prev, path]);
    }
  };

  const mergePdfOnly = async () => {
    const formData = new FormData();
    selectedPages.forEach((path) => formData.append("file_paths", path));
    formData.append("output_name", outputName);

    const res = await axios.post("http://localhost:8000/merge/", formData, {
      responseType: "blob",
    });

    const url = URL.createObjectURL(res.data);
    setMergedPdfUrl(url);
  };

  const downloadMergedPdf = () => {
    if (!mergedPdfUrl || !outputName) return;

    const a = document.createElement("a");
    a.href = mergedPdfUrl;
    a.download = `${outputName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* アプリ名 */}
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
        PDF Magic Splitter
      </h1>

      {/* ドロップゾーン */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 mb-4 text-center rounded ${
          isDragActive ? "bg-blue-100" : "bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "ここにファイルをドロップしてください"
            : "ここにPDFをドラッグ＆ドロップ またはクリックして選択"}
        </p>
        {file && <p className="mt-2 text-sm text-blue-600">選択中: {file.name}</p>}
      </div>

      {/* アップロードボタン（中央配置） */}
      <div className="flex justify-center mb-6">
        <button
          onClick={uploadFile}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-lg"
        >
          PDFアップロード・分割
        </button>
      </div>

      {/* 並べ替え付きページビュー */}
      <ReactSortable list={pages} setList={setPages} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="border rounded shadow-md p-2 bg-white">
            <iframe
              src={`http://localhost:8000/${page.path}`}
              className="w-full h-[500px] border"
            ></iframe>
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPages.includes(page.path)}
                  onChange={() => handleSelect(page.path)}
                />
                選択する
              </label>
              {selectedPages.includes(page.path) && (
                <span className="text-xs text-gray-600">
                  順番: {selectedPages.indexOf(page.path) + 1}
                </span>
              )}
            </div>
          </div>
        ))}
      </ReactSortable>

      {/* 合体・ダウンロード操作 */}
      {pages.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <input
            placeholder="合体後のPDF名"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
            className="border px-3 py-2 w-60 rounded"
          />

          <button
            onClick={mergePdfOnly}
            disabled={!selectedPages.length || !outputName}
            className={`${
              selectedPages.length && outputName
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gray-400"
            } text-white px-4 py-2 rounded`}
          >
            PDF合体
          </button>

          <button
            onClick={downloadMergedPdf}
            disabled={!mergedPdfUrl}
            className={`${
              mergedPdfUrl ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
            } text-white px-4 py-2 rounded`}
          >
            ダウンロード
          </button>
        </div>
      )}

      {/* 合体後のPDFビューア */}
      {mergedPdfUrl && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-2">合体結果プレビュー</h2>
          <iframe src={mergedPdfUrl} className="w-full h-[700px] border rounded" />
        </div>
      )}
    </main>
  );
}
