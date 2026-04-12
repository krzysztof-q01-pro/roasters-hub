import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 w-full pt-16 pb-8 text-stone-400 text-sm font-light mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <span className="text-3xl font-headline text-white mb-4 block">
            Bean Map
          </span>
          <p className="leading-relaxed mb-6">
            Connecting the specialty coffee ecosystem through transparency,
            origin, and community.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
            Explore
          </h4>
          <ul className="space-y-4">
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/roasters">
                Browse Roasters
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/cafes">
                Browse Cafes
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/map">
                Interactive Map
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
            Quick Links
          </h4>
          <ul className="space-y-4">
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/register">
                Register Roastery
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/roasters">
                All Roasters
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/cafes">
                All Cafes
              </Link>
            </li>
            <li>
              <Link className="text-stone-400 hover:text-orange-400 transition-colors hover:translate-x-1 inline-block" href="/map">
                Map
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
            Join Us
          </h4>
          <p className="mb-4">
            Are you a roaster? Share your craft with our community.
          </p>
          <Link
            className="text-orange-500 font-semibold hover:text-white transition-colors flex items-center gap-2"
            href="/register"
          >
            List Your Roastery
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>
          <p className="mt-4 mb-2">
            Own a caf&eacute;? List it on Bean Map.
          </p>
          <Link
            className="text-orange-500 font-semibold hover:text-white transition-colors flex items-center gap-2"
            href="/register/cafe"
          >
            List Your Cafe
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-white/10 text-center md:text-left">
        <p className="text-xs font-light opacity-60">
          &copy; {new Date().getFullYear()} Bean Map. Crafted for the Sensory Curator.
          <span className="ml-2 opacity-60">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
        </p>
      </div>
    </footer>
  );
}
