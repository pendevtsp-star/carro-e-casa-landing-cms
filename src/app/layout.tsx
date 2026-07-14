import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAdsTracking } from "@/components/analytics/google-ads";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Carro & Casa",
    template: "%s",
  },
  description: "Produtos premium para cuidar do seu carro e da sua casa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAdsTracking />
        {children}
      </body>
    </html>
  );
}
