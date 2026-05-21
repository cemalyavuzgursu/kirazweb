export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar skeleton */}
      <aside className="w-64 bg-white border-r border-cream-200 flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar skeleton */}
        <div className="h-14 bg-white border-b border-cream-200 animate-pulse" />

        <main className="flex-1 p-6 lg:p-8">
          {/* Page header skeleton */}
          <div className="mb-6">
            <div className="h-7 w-32 bg-cream-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-20 bg-cream-200 rounded animate-pulse" />
          </div>

          {/* Filter bar skeleton */}
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <div className="h-10 flex-1 min-w-[240px] bg-cream-200 rounded-md animate-pulse" />
            <div className="h-10 w-36 bg-cream-200 rounded-md animate-pulse" />
            <div className="h-10 w-20 bg-cream-200 rounded-md animate-pulse" />
          </div>

          {/* Table skeleton */}
          <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
            {/* Table header */}
            <div className="border-b border-cream-100 px-4 py-3 flex gap-4">
              {["w-24", "w-20", "w-32", "w-16", "w-20 ml-auto", "w-20"].map((w, i) => (
                <div key={i} className={`h-3 ${w} bg-cream-200 rounded animate-pulse`} />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="border-b border-cream-50 last:border-0 px-4 py-3.5 flex items-center gap-4"
              >
                <div className="h-4 w-24 bg-cream-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-cream-200 rounded animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-28 bg-cream-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-cream-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-12 bg-cream-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-cream-200 rounded animate-pulse ml-auto" />
                <div className="h-5 w-20 bg-cream-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
