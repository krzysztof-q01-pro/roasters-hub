import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import { db } from "@/lib/db";

const COMMUNITY_ITEMS = [
  {
    title: "Coffee Roasters",
    desc: "Showcase your beans and unique roasting philosophy to a global audience of dedicated coffee lovers.",
    iconBg: "#ffdbc9",
    emoji: "🫘",
  },
  {
    title: "Cafés & Buyers",
    desc: "Source exceptional beans for your café by connecting directly with verified specialty producers worldwide.",
    iconBg: "#aeeecb",
    emoji: "☕",
  },
  {
    title: "Coffee Lovers",
    desc: "Find your next favorite roast and explore the diverse world of specialty coffee through our curated map.",
    iconBg: "#c8e6ff",
    emoji: "🗺️",
  },
];

export const revalidate = 3600; // re-generate every hour

export default async function HomePage() {
  const [featuredRoasters, roasterCount, countryCount, cafeCount] = await Promise.all([
    db.roaster.findMany({
      where: { status: "VERIFIED", featured: true },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      take: 4,
    }),
    db.roaster.count({ where: { status: "VERIFIED" } }),
    db.roaster.findMany({
      where: { status: "VERIFIED" },
      select: { countryCode: true },
      distinct: ["countryCode"],
    }).then((r) => r.length),
    db.cafe.count({ where: { status: "VERIFIED" } }),
  ]);
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-[72px] grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary-fixed text-primary text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-[5px] rounded-full mb-5">
              🫘 Specialty Coffee Directory
            </div>
            <h1 className="font-headline text-[54px] font-semibold tracking-[-0.025em] text-on-surface leading-[1.08] mb-5" style={{textWrap: "pretty"}}>
              Discover specialty coffee
            </h1>
            <p className="text-lg text-on-surface-variant leading-[1.65] mb-9">
              The global directory connecting caf&eacute;s and coffee lovers with
              verified specialty roasters worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/roasters"
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-[30px] py-[14px] rounded-lg font-semibold text-base hover:bg-[#a85218] transition-colors"
              >
                Browse Roasters
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center border-[1.5px] border-primary text-primary px-[30px] py-[14px] rounded-lg font-semibold text-base hover:bg-primary-fixed transition-colors"
              >
                List Your Roastery
              </Link>
              <Link
                href="/cafes"
                className="inline-flex items-center gap-1.5 text-primary px-4 py-[14px] rounded-lg font-semibold text-base hover:bg-primary-fixed/50 transition-colors"
              >
                Find a Cafe
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hero image grid */}
          <div className="hidden lg:grid grid-cols-2 gap-2.5" style={{gridTemplateRows: "auto auto"}}>
            <div className="row-span-2 rounded-xl overflow-hidden bg-surface-container" style={{aspectRatio: "3/4"}}>
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop"
                alt="A barista pouring latte art in a sunlit cafe"
                width={600}
                height={800}
                className="w-full h-full object-cover"
                sizes="280px"
                priority
              />
            </div>
            <div className="rounded-xl overflow-hidden bg-surface-container" style={{aspectRatio: "4/3"}}>
              <Image
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop"
                alt="Close up of coffee beans in a commercial roaster"
                width={400}
                height={300}
                className="w-full h-full object-cover"
                sizes="200px"
              />
            </div>
            <div className="rounded-xl overflow-hidden bg-surface-container" style={{aspectRatio: "4/3"}}>
              <Image
                src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&h=300&fit=crop"
                alt="Professional coffee tasting cupping session"
                width={400}
                height={300}
                className="w-full h-full object-cover"
                sizes="200px"
              />
            </div>
          </div>
          {/* Mobile hero image */}
          <div className="lg:hidden w-full h-[260px] rounded-xl overflow-hidden relative">
            <Image
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop"
              alt="A barista pouring latte art in a sunlit cafe"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </section>

        {/* Stats Bar */}
        <div className="border-t border-b border-surface-container-high bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 py-[22px] flex flex-col md:flex-row justify-center items-center gap-10 md:gap-14">
            <div className="text-center">
              <div className="font-headline text-[38px] font-bold text-primary leading-none tracking-[-0.03em]">{roasterCount}+</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-outline mt-[3px]">Roasters</div>
            </div>
            <div className="h-[38px] w-px bg-surface-container-high hidden md:block" />
            <div className="text-center">
              <div className="font-headline text-[38px] font-bold text-primary leading-none tracking-[-0.03em]">{cafeCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-outline mt-[3px]">Cafes</div>
            </div>
            <div className="h-[38px] w-px bg-surface-container-high hidden md:block" />
            <div className="text-center">
              <div className="font-headline text-[38px] font-bold text-primary leading-none tracking-[-0.03em]">{countryCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-outline mt-[3px]">Countries</div>
            </div>
            <div className="h-[38px] w-px bg-surface-container-high hidden md:block" />
            <div className="text-center">
              <div className="font-headline text-[38px] font-bold text-primary leading-none tracking-[-0.03em]">{roasterCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-outline mt-[3px]">Verified</div>
            </div>
          </div>
        </div>

        {/* Featured Roasters */}
        <section className="max-w-7xl mx-auto px-6 py-[60px]">
          <div className="flex justify-between items-baseline mb-8">
            <div>
              <h2 className="font-headline text-[34px] font-semibold tracking-[-0.02em] text-on-surface">Featured Roasters</h2>
              <p className="text-[15px] text-outline mt-1.5">Curated selections from our global network.</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:opacity-80 transition-opacity" href="/roasters">
              View all roasters ↗
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredRoasters.map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} />
            ))}
          </div>
        </section>

        {/* Value Props */}
        <section className="bg-surface-container-lowest py-[60px] border-t border-surface-container-high">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-headline text-[34px] font-semibold tracking-[-0.02em] text-center text-on-surface mb-10">
              Built for the specialty coffee community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {COMMUNITY_ITEMS.map(({ title, desc, iconBg, emoji }) => (
                <div key={title} className="text-center px-4">
                  <div
                    className="w-[52px] h-[52px] rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
                    style={{ background: iconBg }}
                  >
                    {emoji}
                  </div>
                  <h3 className="font-headline text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-on-surface-variant leading-[1.65]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Teaser */}
        <section className="py-[60px] max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="font-headline text-[34px] font-semibold tracking-[-0.02em] text-on-surface mb-4 leading-[1.1]">
                Find roasters wherever you go
              </h2>
              <p className="text-base text-on-surface-variant mb-8 leading-relaxed">
                Our interactive map allows you to find verified specialty roasters in any city.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-5 py-[10px] rounded-lg font-semibold text-sm hover:bg-[#a85218] transition-colors"
              >
                Explore the Map
                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </Link>
            </div>
            <div className="relative h-[320px] rounded-xl overflow-hidden bg-[#f4f4f0]">
              <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop" alt="World map" fill className="object-cover opacity-50 grayscale" sizes="50vw" />
              <div className="absolute top-1/4 left-1/3 w-[30px] h-[30px] bg-primary rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(151,68,0,0.4)] cursor-pointer" />
              <div className="absolute top-1/2 left-2/3 w-[30px] h-[30px] bg-primary rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(151,68,0,0.4)]" />
              <div className="absolute bottom-1/3 left-1/2 w-[30px] h-[30px] bg-primary rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(151,68,0,0.4)] animate-pulse" />
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-background py-24 border-t border-outline-variant/10">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-headline text-4xl font-bold text-on-background mb-4">Fresh beans in your inbox</h2>
            <p className="text-on-surface-variant mb-10 font-light">Join 10,000+ subscribers for weekly curation of new roasters and limited releases.</p>
            <NewsletterForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
