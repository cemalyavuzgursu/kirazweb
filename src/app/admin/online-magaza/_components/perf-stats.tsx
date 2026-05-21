"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

type Period = "today" | "7d" | "30d";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 Gün" },
  { key: "30d", label: "30 Gün" },
];

function StatCard({
  title,
  description,
  value,
  threshold,
  children,
}: {
  title: string;
  description: string;
  value: string;
  threshold?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-cream-200 p-5">
      <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-display text-ink-700 mb-1">{value}</p>
      <p className="text-xs text-ink-400">{description}</p>
      {threshold && (
        <p className="text-xs text-ink-300 mt-1">Eşik: {threshold}</p>
      )}
      {children}
    </div>
  );
}

export function PerfStats() {
  const [period, setPeriod] = useState<Period>("today");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-cream-50 rounded-lg p-1 w-fit border border-cream-200">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition ${
              period === p.key
                ? "bg-white text-ink-700 font-medium shadow-sm"
                : "text-ink-400 hover:text-ink-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="LCP P75"
          description="En Büyük İçerikli Boyama"
          value="—"
          threshold="< 2.5s"
        />
        <StatCard
          title="INP"
          description="Sonraki Boyama ile Etkileşim"
          value="—"
          threshold="< 200ms"
        />
        <StatCard
          title="CLS"
          description="Kümülatif Düzen Kayması"
          value="—"
          threshold="< 0.1"
        />
        <StatCard
          title="Oturumlar"
          description="Cihaz dağılımı"
          value="—"
        >
          <div className="mt-2 flex gap-3 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <Monitor className="h-3 w-3" /> Desktop —
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Mobil —
            </span>
            <span className="flex items-center gap-1">
              <Tablet className="h-3 w-3" /> Tablet —
            </span>
          </div>
        </StatCard>
      </div>

      <p className="text-xs text-ink-300">
        Gerçek zamanlı veri için Google Analytics entegrasyonu gereklidir.
      </p>
    </div>
  );
}
