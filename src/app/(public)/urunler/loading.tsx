export default function ProductsListLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-10 w-48 bg-cream-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-cream-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar skeleton */}
        <aside className="space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-cream-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-cream-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-cream-200 rounded animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-32 bg-cream-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 w-14 bg-cream-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-cream-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-cream-200 rounded animate-pulse" />
        </aside>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-cream-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-cream-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-cream-200 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
