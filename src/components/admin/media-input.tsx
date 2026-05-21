"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { MediaPicker } from "./media-picker";
import { Input } from "@/components/ui/input";

interface Props {
  name: string;
  defaultValue?: string;
  folder?: string;
  placeholder?: string;
}

export function MediaInput({ name, defaultValue = "", folder, placeholder }: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "/uploads/dosya.webp"}
          className="flex-1"
        />
        <MediaPicker
          value={value}
          onChange={setValue}
          folder={folder}
        />
      </div>
      {value && (
        <div className="flex items-center gap-2">
          <div className="relative h-12 w-12 rounded border border-cream-200 overflow-hidden shrink-0">
            <Image src={value} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setValue("")}
            className="text-ink-300 hover:text-rose-500 transition"
            title="Kaldır"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
