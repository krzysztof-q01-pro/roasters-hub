import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { RoasterCard } from "@/components/roasters/RoasterCard";
import { MOCK_ROASTERS } from "@/lib/mock-data";

const featuredRoasters = MOCK_ROASTERS.filter((r) => r.featured).slice(0, 4);

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-on-background leading-[1.1] mb-6 italic">
              Discover the world&apos;s specialty coffee roasters
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed font-light">
              The global directory connecting caf&eacute;s and coffee lovers with
              verified specialty roasters.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/roasters"
                className="bg-primary text-on-primary px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
              >
                Browse Roasters
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="bg-surface-container text-on-surface px-8 py-4 rounded-lg font-medium hover:bg-surface-container-high transition-all"
              >
                List Your Roastery
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-[500px] hidden md:block">
            <div className="absolute top-0 right-0 w-2/3 h-[300px] rounded-2xl overflow-hidden editorial-shadow rotate-2 z-10 bg-surface-container">
              <Image
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
                alt="A barista pouring latte art in a sunlit cafe"
                fill
                className="object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                sizes="400px"
              />
            </div>
            <div className="absolute top-20 left-0 w-3/4 h-[350px] rounded-2xl overflow-hidden editorial-shadow -rotate-3 z-0 bg-surface-container">
              <Image
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
                alt="Close up of coffee beans in a commercial roaster"
                fill
                className="object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                sizes="500px"
              />
            </div>
            <div className="absolute bottom-0 right-10 w-1/2 h-[200px] rounded-2xl overflow-hidden editorial-shadow rotate-6 z-20 bg-surface-container">
              <Image
                src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&h=300&fit=crop"
                alt="Professional coffee tasting cupping session"
                fill
                className="object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                sizes="300px"
              />
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
            <div className="text-center">
              <span className="block text-3xl font-headline font-bold text-primary">{MOCK_ROASTERS.length}+</span>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">Roasters</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/30 hidden md:block" />
            <div className="text-center">
              <span className="block text-3xl font-headline font-bold text-primary">
                {new Set(MOCK_ROASTERS.map((r) => r.countryCode)).size}
              </span>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">Countries</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/30 hidden md:block" />
            <div className="text-center">
              <span className="block text-3xl font-headline font-bold text-primary">Verified</span>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">Profiles</span>
            </div>
          </div>
        </div>

        {/* Featured Roasters */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline text-4xl font-bold tracking-tight text-on-background italic">Featured Roasters</h2>
              <p className="text-on-surface-variant mt-2">Curated selections from our global network.</p>
            </div>
            <Link className="group text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all" href="/roasters">
              View all roasters
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredRoasters.map((roaster) => (
              <RoasterCard key={roaster.id} roaster={roaster} />
            ))}
          </div>
        </section>

        {/* Value Props */}
        <section className="bg-surface-container py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-headline text-4xl font-bold text-center text-on-background mb-16 italic">
              Built for the specialty coffee community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { title: "Coffee Roasters", desc: "Showcase your beans and unique roasting philosophy to a global audience of dedicated coffee lovers." },
                { title: "Cafés & Buyers", desc: "Source exceptional beans for your café by connecting directly with verified specialty producers worldwide." },
                { title: "Coffee Lovers", desc: "Find your next favorite roast and explore the diverse world of specialty coffee through our curated map." },
              ].map((item) => (
                <div key={item.title} className="text-center group">
                  <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center mx-auto mb-8 editorial-shadow group-hover:bg-primary transition-colors">
                    <svg className="w-8 h-8 text-primary group-hover:text-on-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Teaser */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="bg-surface-container-low rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-12 lg:p-20">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-background mb-6 leading-tight italic">
                Find roasters wherever you go
              </h2>
              <p className="text-lg text-on-surface-variant mb-10 font-light leading-relaxed">
                Our interactive map allows you to find verified specialty roasters in any city.
              </p>
              <Link href="/map" className="bg-primary text-on-primary px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-all inline-flex items-center gap-2">
                Explore the Map
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </Link>
            </div>
            <div className="h-[400px] lg:h-full relative bg-surface-container min-h-[300px]">
              <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop" alt="World map" fill className="object-cover opacity-60 grayscale" sizes="50vw" />
              <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary rounded-full shadow-[0_0_0_8px_rgba(151,68,0,0.2)] animate-pulse" />
              <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-primary rounded-full shadow-[0_0_0_8px_rgba(151,68,0,0.2)]" />
              <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_0_8px_rgba(151,68,0,0.2)]" />
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-background py-24 border-t border-outline-variant/10">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-headline text-4xl font-bold text-on-background mb-4 italic">Fresh beans in your inbox</h2>
            <p className="text-on-surface-variant mb-10 font-light">Join 10,000+ subscribers for weekly curation of new roasters and limited releases.</p>
            <form className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input className="flex-grow bg-surface-container-low border-none rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-background" placeholder="Enter your email" type="email" />
                <button className="bg-primary text-on-primary px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-all" type="submit">Subscribe</button>
              </div>
              <div className="flex justify-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input defaultChecked className="text-primary focus:ring-primary" name="user_type" type="radio" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">I&apos;m a Coffee Lover</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="text-primary focus:ring-primary" name="user_type" type="radio" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">I&apos;m a Caf&eacute;</span>
                </label>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
