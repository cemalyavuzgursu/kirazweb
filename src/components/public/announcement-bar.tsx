"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  text: string;
  link?: string;
  bgColor: string;
  textColor: string;
  dismissible: boolean;
}

export function AnnouncementBar({ text, link, bgColor, textColor, dismissible }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !text) return null;

  const content = link ? (
    <Link href={link} className="hover:underline">
      {text}
    </Link>
  ) : (
    <span>{text}</span>
  );

  return (
    <div
      className="relative flex items-center justify-center px-4 py-2 text-sm font-medium text-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {content}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
