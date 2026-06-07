import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "St. Bernadette's '09 Association",
    template: "%s | St. Bernadette's '09",
  },
  description:
    "Official platform for St. Bernadette's Junior High School 2009 Year Group Association. Unity, Support, Progress.",
  keywords: [
    "St. Bernadette's",
    "2009 year group",
    "alumni association",
    "Tafo Nhyiaeso",
    "Kumasi",
    "Ghana",
    "JHS",
    "school association",
  ],
  metadataBase: new URL("https://stbernadettes09.org"),
  openGraph: {
    type: "website",
    siteName: "St. Bernadette's '09 Association",
    title: "St. Bernadette's '09 Association",
    description:
      "One Year Group, One Family. St. Bernadette's JHS 2009 Year Group, Tafo Nhyiaeso, Kumasi, Ghana.",
    locale: "en_GH",
  },
  twitter: {
    card: "summary",
    title: "St. Bernadette's '09 Association",
    description:
      "One Year Group, One Family. St. Bernadette's JHS 2009 Year Group, Tafo Nhyiaeso, Kumasi, Ghana.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B4332" />
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-sb-cream font-sans">
        <ServiceWorkerRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
