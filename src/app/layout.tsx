import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n";
import { CookieBanner } from "@/components/cookie-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOVR Logistics",
  description:
    "Return loads and real partners for transport companies and independent carriers in Southeast Brazil (SP, RJ, MG).",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let lang = "en";
  try {
    const store = await cookies();
    lang = resolveLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {}
  return (
    <html lang={lang} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-transparent text-ink">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
