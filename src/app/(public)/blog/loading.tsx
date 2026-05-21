export default function BlogListLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <div className="h-10 w-24 bg-cream-200 rounded animate-pulse mx-auto mb-3" />
        <div className="h-4 w-48 bg-cream-200 rounded animate-pulse mx-auto" />
      </div>

      {/* Blog card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            {/* Cover image */}
            <div className="aspect-video bg-cream-200 rounded-lg animate-pulse mb-4" />
            {/* Date */}
            <div className="h-3 w-20 bg-cream-200 rounded animate-pulse mb-2" />
            {/* Title */}
            <div className="h-5 w-4/5 bg-cream-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-3/5 bg-cream-200 rounded animate-pulse mb-3" />
            {/* Excerpt */}
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-full bg-cream-200 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-cream-200 rounded animate-pulse" />
              <div className="h-3.5 w-2/3 bg-cream-200 rounded animate-pulse" />
            </div>
            {/* Read more */}
            <div className="mt-4 h-4 w-24 bg-cream-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
