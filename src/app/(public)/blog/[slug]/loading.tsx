export default function BlogPostLoading() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back link skeleton */}
      <div className="h-4 w-24 bg-cream-200 rounded animate-pulse mb-8" />

      {/* Hero image skeleton */}
      <div className="aspect-video bg-cream-200 rounded-lg animate-pulse mb-8" />

      {/* Header */}
      <header className="mb-8">
        <div className="h-3.5 w-20 bg-cream-200 rounded animate-pulse mb-3" />
        <div className="h-9 w-full bg-cream-200 rounded animate-pulse mb-2" />
        <div className="h-9 w-4/5 bg-cream-200 rounded animate-pulse mb-4" />
        {/* Excerpt */}
        <div className="h-5 w-full bg-cream-200 rounded animate-pulse mb-1.5" />
        <div className="h-5 w-3/4 bg-cream-200 rounded animate-pulse" />
      </header>

      {/* Body text lines */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-cream-200 rounded animate-pulse ${i % 5 === 4 ? "w-2/3" : "w-full"}`}
          />
        ))}
        <div className="py-2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`b-${i}`}
            className={`h-4 bg-cream-200 rounded animate-pulse ${i % 4 === 3 ? "w-3/4" : "w-full"}`}
          />
        ))}
      </div>
    </article>
  );
}
