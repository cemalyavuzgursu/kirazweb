export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header / banner skeleton */}
      <header className="mb-10 text-center">
        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-6 bg-cream-200 animate-pulse" />
        <div className="h-5 w-48 bg-cream-200 rounded animate-pulse mx-auto" />
      </header>

      {/* Sort bar skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-20 bg-cream-200 rounded animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-20 bg-cream-200 rounded-md animate-pulse" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-cream-200 rounded-lg animate-pulse" />
            <div className="h-4 bg-cream-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-cream-200 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
