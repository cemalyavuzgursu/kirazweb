export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header / search bar skeleton */}
      <header className="mb-10 max-w-xl">
        <div className="h-10 w-40 bg-cream-200 rounded animate-pulse mb-4" />
        <div className="h-10 w-full bg-cream-200 rounded-md animate-pulse" />
      </header>

      {/* Result count placeholder */}
      <div className="h-4 w-28 bg-cream-200 rounded animate-pulse mb-6" />

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
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
