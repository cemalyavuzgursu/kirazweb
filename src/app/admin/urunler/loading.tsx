export default function AdminProductsLoading() {
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="h-7 w-24 bg-cream-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-cream-200 rounded animate-pulse" />
            </div>
            <div className="h-9 w-28 bg-cream-200 rounded-md animate-pulse" />
          </div>

          {/* Table skeleton */}
          <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
            {/* Table header */}
            <div className="border-b border-cream-100 px-4 py-3 flex items-center gap-4">
              {["w-12", "w-32 flex-1", "w-24", "w-16 ml-auto", "w-12", "w-14", "w-12"].map((w, i) => (
                <div key={i} className={`h-3 ${w} bg-cream-200 rounded animate-pulse`} />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="border-b border-cream-50 last:border-0 px-4 py-3 flex items-center gap-4"
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 bg-cream-200 rounded animate-pulse flex-shrink-0" />
                {/* Name + SKU */}
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-40 bg-cream-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-cream-200 rounded animate-pulse" />
                </div>
                {/* Category */}
                <div className="h-4 w-24 bg-cream-200 rounded animate-pulse" />
                {/* Price */}
                <div className="h-4 w-16 bg-cream-200 rounded animate-pulse ml-auto" />
                {/* Stock */}
                <div className="h-4 w-10 bg-cream-200 rounded animate-pulse" />
                {/* Status badge */}
                <div className="h-5 w-14 bg-cream-200 rounded animate-pulse" />
                {/* Actions */}
                <div className="flex gap-2">
                  <div className="h-4 w-4 bg-cream-200 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-cream-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
