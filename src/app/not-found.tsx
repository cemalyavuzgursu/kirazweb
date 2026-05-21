import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md">
        <p className="text-rose-500 text-sm uppercase tracking-[0.3em] mb-4">404</p>
        <h1 className="font-display text-4xl text-ink-700 mb-4">Sayfa bulunamadı</h1>
        <p className="text-ink-500 mb-8">
          Aradığınız sayfa kaldırılmış veya hiç var olmamış olabilir.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-md bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
