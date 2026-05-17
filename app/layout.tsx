import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VESTRIPPN 3.0 // W07 Hybrid",
  description: "Personal Telemetry & Operating System · Powered by Claude",
  // 🚨 THE FIX: This injects the Google site verification tag into your <head>
  verification: {
    google: "googlecd69efda792e89e4",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is CRITICAL here so Next.js doesn't throw errors 
    // when your ThemeToggle flips the HTML class from light to dark on load.
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`
          ${inter.variable} ${jetbrainsMono.variable} font-sans 
          bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 
          antialiased h-screen flex flex-col overflow-hidden 
          transition-colors duration-700 
          selection:bg-[#00A598]/30 selection:text-[#00A598] dark:selection:text-white
        `}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}