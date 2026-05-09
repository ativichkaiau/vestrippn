import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

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
      {/* 
         CRITICAL: We must include BOTH inter.className AND jetbrainsMono.variable 
         so your CSS can see the --font-mono variable.
      */}
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-base text-textPri h-screen flex flex-col overflow-hidden transition-colors duration-300`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}