"use client";

import { useRef, useState } from "react";
import { submitPod } from "@/app/actions/loads";

export function PodUpload({ loadId }: { loadId: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevUrlRef = useRef<string | null>(null);

  const updatePreviewFrom = (input: HTMLInputElement) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = null;
    const f = input.files?.[0];
    if (!f) {
      setFileName(null);
      setPreview(null);
      return;
    }
    setFileName(f.name);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      prevUrlRef.current = url;
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onPhotoChange = () => {
    if (fileRef.current) fileRef.current.value = "";
    if (photoRef.current) updatePreviewFrom(photoRef.current);
  };

  const onFileChange = () => {
    if (photoRef.current) photoRef.current.value = "";
    if (fileRef.current) updatePreviewFrom(fileRef.current);
  };

  const optionCls =
    "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand hover:bg-brand-light/40";

  return (
    <form action={submitPod} className="space-y-3 rounded-2xl border border-black/8 bg-white p-4">
      <h3 className="font-semibold text-ink">Comprovante de entrega</h3>
      <p className="text-sm text-muted">Envie uma foto/PDF (máx. 5MB) ou cole um link.</p>
      <input type="hidden" name="loadId" value={loadId} />

      <div className="grid gap-2 sm:grid-cols-2">
        <label className={optionCls}>
          <span aria-hidden>📷</span>
          Tirar foto
          <input
            ref={photoRef}
            name="podFilePhoto"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhotoChange}
            className="sr-only"
          />
        </label>
        <label className={optionCls}>
          <span aria-hidden>📁</span>
          Galeria / arquivo
          <input
            ref={fileRef}
            name="podFile"
            type="file"
            accept="image/*,application/pdf"
            onChange={onFileChange}
            className="sr-only"
          />
        </label>
      </div>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Comprovante selecionado" className="max-h-48 w-full rounded-xl border border-border object-cover" />
      ) : fileName ? (
        <p className="truncate rounded-xl bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">📎 {fileName}</p>
      ) : null}

      <input
        name="podUrl"
        placeholder="https://... URL da imagem (ou deixe vazio se enviou arquivo acima)"
        className="w-full rounded-[var(--radius-input)] border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <input
        name="podNote"
        placeholder="Observação (opcional)"
        className="w-full rounded-[var(--radius-input)] border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <button type="submit" className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
        Enviar comprovante
      </button>
    </form>
  );
}