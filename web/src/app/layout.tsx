import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bean Map — Discover Specialty Coffee Roasters",
    template: "%s | Bean Map",
  },
  description:
    "The global directory connecting cafés and coffee lovers with verified specialty roasters.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://beanmap.cafe"),
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
      className={`${newsreader.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
