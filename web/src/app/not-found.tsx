import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center min-h-screen">
      <p className="text-7xl font-semibold text-stone-200 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-stone-800 mb-3">Page not found</h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/roasters"
          className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          Browse Roasters
        </Link>
        <Link
          href="/cafes"
          className="rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          Browse Cafés
        </Link>
      </div>
    </main>
  );
}
