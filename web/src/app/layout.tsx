import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6f4e37",
};

export const metadata: Metadata = {
  title: {
    default: "Bean Map — Discover Specialty Coffee Roasters",
    template: "%s | Bean Map",
  },
  description:
    "The global directory connecting cafés and coffee lovers with verified specialty roasters.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://beanmap.cafe"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bean Map",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Bean Map",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${manrope.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ClerkProvider>{children}</ClerkProvider>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
