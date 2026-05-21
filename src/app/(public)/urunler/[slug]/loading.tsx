export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-16 bg-cream-200 rounded animate-pulse" />
        <div className="h-3 w-2 bg-cream-200 rounded animate-pulse" />
        <div className="h-3 w-14 bg-cream-200 rounded animate-pulse" />
        <div className="h-3 w-2 bg-cream-200 rounded animate-pulse" />
        <div className="h-3 w-24 bg-cream-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery skeleton */}
        <div>
          <div className="aspect-square bg-cream-200 rounded-lg animate-pulse mb-3" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-cream-200 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div>
          {/* Category */}
          <div className="h-3 w-20 bg-cream-200 rounded animate-pulse mb-3" />
          {/* Title */}
          <div className="h-9 w-4/5 bg-cream-200 rounded animate-pulse mb-2" />
          <div className="h-9 w-3/5 bg-cream-200 rounded animate-pulse mb-4" />
          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <div className="h-8 w-28 bg-cream-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-cream-200 rounded animate-pulse" />
          </div>
          {/* Short description */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-cream-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-cream-200 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-cream-200 rounded animate-pulse" />
          </div>
          {/* Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="h-12 w-full bg-cream-200 rounded-md animate-pulse" />
            <div className="h-12 w-full bg-cream-200 rounded-md animate-pulse" />
          </div>
          {/* Meta */}
          <div className="space-y-2 border-t border-cream-200 pt-4">
            <div className="h-3 w-24 bg-cream-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-cream-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
