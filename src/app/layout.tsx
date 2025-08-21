import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Solar 3D — Interactive Solar System",
  description: "Explore an interactive 3D solar system in the browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`} suppressHydrationWarning={true}>{children}
        <div className="fixed bottom-2 right-2 text-[10px] text-white/60 select-none">© Solar 3D</div>
      </body>
    </html>
  );
}
