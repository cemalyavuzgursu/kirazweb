"use client";

import { Trash2 } from "lucide-react";
import { deleteCampaign } from "@/server/actions/campaigns";

export function DeleteCampaignButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteCampaign}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="h-8 w-8 rounded-md border border-cream-200 flex items-center justify-center text-ink-400 hover:border-rose-300 hover:text-rose-600 transition"
        onClick={(e) => {
          if (!confirm(`"${name}" kampanyasını silmek istiyor musunuz?`)) e.preventDefault();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
