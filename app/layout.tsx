import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Crisp, modern UI font
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

// Sleek, modern terminal font for your tech accents
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: "vestrippn3point0 | Command Center",
  description: "Personal Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* inter.className applies the modern font as the default to everything */}
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-base text-textPri h-screen flex flex-col overflow-hidden transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}