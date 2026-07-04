"use client";

import * as React from "react";
import { ImagePlus, X, UploadCloud } from "lucide-react";
import { cn, fileToDataUrl } from "@/lib/utils";

interface SlipUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  hint?: string;
}

export function SlipUpload({
  value,
  onChange,
  label = "แนบรูปสลิปโอนเงิน",
  hint = "ลากรูปมาวาง หรือคลิกเพื่ออัปโหลด (JPG, PNG)",
}: SlipUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground/80">{label}</p>

      {value ? (
        <div className="relative w-full max-w-[220px] overflow-hidden rounded-xl border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="สลิปโอนเงิน" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary-50"
              : "border-primary-200 bg-primary-50/40 hover:border-primary-400 hover:bg-primary-50"
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            {isDragging ? <UploadCloud className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
          </div>
          <p className="text-sm font-medium text-primary-700">{hint}</p>
          <p className="text-xs text-muted-foreground">รองรับสลิปจากแอปธนาคาร / แคปหน้าจอแชท</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
