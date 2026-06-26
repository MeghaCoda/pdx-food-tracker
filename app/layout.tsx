import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from './providers';
import { HeaderWrapper } from '@/components/Header/HeaderWrapper';
import { Header } from '@/components/Header/Header';
import { SITE_TITLE, SITE_DESCRIPTION } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col h-full">
        <HeaderWrapper><Header /></HeaderWrapper>
        <div className="flex-1 flex flex-col min-h-0">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
