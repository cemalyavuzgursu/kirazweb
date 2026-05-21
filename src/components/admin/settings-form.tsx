"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsForm({
  action,
  children,
}: {
  action: (fd: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (fd) => {
        setSaving(true);
        setSaved(false);
        try {
          await action(fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        } finally {
          setSaving(false);
        }
      }}
      className="space-y-6"
    >
      {children}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Kaydet
        </Button>
        {saved ? (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <Check className="h-4 w-4" /> Kaydedildi
          </span>
        ) : null}
      </div>
    </form>
  );
}
