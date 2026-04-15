import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export const revalidate = 300;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  VERIFIED: "bg-secondary-container text-on-secondary-container",
  REJECTED: "bg-error-container text-on-error-container",
  INACTIVE: "bg-surface-container-high text-on-surface-variant",
};

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/");

  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [statusGroups, pageViews30d, pageViewsAll, recentRoasters, cafeCount] = await Promise.all([
    db.roaster.groupBy({ by: ["status"], _count: { _all: true } }),
    db.profileEvent.count({ where: { type: "PAGE_VIEW", createdAt: { gte: thirtyDaysAgo } } }),
    db.profileEvent.count({ where: { type: "PAGE_VIEW" } }),
    db.roaster.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, slug: true, city: true, country: true, status: true, createdAt: true },
    }),
    db.cafe.count(),
  ]);

  const counts: Record<string, number> = { PENDING: 0, VERIFIED: 0, REJECTED: 0, INACTIVE: 0 };
  for (const g of statusGroups) counts[g.status] = g._count._all;
  const totalRoasters = Object.values(counts).reduce((a, b) => a + b, 0);

  const tiles = [
    { href: "/admin/roasters?status=PENDING", label: "Pending approvals", value: counts.PENDING, accent: counts.PENDING > 0 },
    { href: "/admin/roasters", label: "All roasters", value: totalRoasters },
    { href: "/admin/cafes", label: "Cafes", value: cafeCount },
    { href: "/admin/reviews", label: "Reviews", value: "→" },
    { href: "/admin/activity", label: "Activity log", value: "→" },
    { href: "/admin/enrichment", label: "Enrichment", value: "→" },
  ];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-headline text-4xl font-bold text-on-background mb-2">Admin dashboard</h1>
        <p className="text-on-surface-variant mb-10">Read-only monitoring. Verify roasters in Pending approvals.</p>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {(["PENDING", "VERIFIED", "REJECTED", "INACTIVE"] as const).map((s) => (
            <div key={s} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
              <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">{s}</div>
              <div className="font-headline text-4xl font-bold text-on-background">{counts[s]}</div>
              <div className={`inline-block mt-3 px-2 py-0.5 rounded text-xs font-bold ${STATUS_COLORS[s]}`}>roasters</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Page views (30 days)</div>
            <div className="font-headline text-4xl font-bold text-primary">{pageViews30d.toLocaleString()}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow">
            <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">Page views (all time)</div>
            <div className="font-headline text-4xl font-bold text-primary">{pageViewsAll.toLocaleString()}</div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          {tiles.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-xl p-5 transition-all editorial-shadow ${t.accent ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-background hover:bg-surface-container"}`}
            >
              <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${t.accent ? "opacity-80" : "text-on-surface-variant"}`}>{t.label}</div>
              <div className="font-headline text-2xl font-bold">{t.value}</div>
            </Link>
          ))}
        </section>

        <section>
          <h2 className="font-headline text-2xl font-bold text-on-background mb-4">Recent registrations</h2>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden editorial-shadow">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left text-xs uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3 font-bold">Name</th>
                  <th className="px-5 py-3 font-bold">Location</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {recentRoasters.map((r) => (
                  <tr key={r.id} className="border-t border-outline-variant/20">
                    <td className="px-5 py-3">
                      <Link href={`/roasters/${r.slug}`} className="font-bold text-primary hover:underline">{r.name}</Link>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">{r.city}, {r.country}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">{r.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentRoasters.length === 0 && (
                  <tr><td className="px-5 py-6 text-center text-on-surface-variant" colSpan={4}>No roasters yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
