"use client";

import React from "react";

type Props = {
  onUploadSuccess: (url: string) => void;
};

export default function ImageUploader({ onUploadSuccess }: Props) {
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      onUploadSuccess(data.url);
    } else {
      alert("Erro ao enviar imagem: " + data.error);
    }
  }

  return (
    <label className="px-2 py-1 bg-zinc-700 rounded text-white cursor-pointer hover:bg-zinc-600">
      📤 Upload
      <input type="file" accept="image/*" hidden onChange={handleFileChange} />
    </label>
  );
}
