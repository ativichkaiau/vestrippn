import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./system.css";
import "./garage.css";
import AuthProvider from "../components/AuthProvider";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import Toaster from "../components/Toaster";
import PwaHud from "../components/PwaHud";
import DeviceSync from "../components/DeviceSync";
import FocusModeLoader from "../components/FocusModeLoader";
import ThemeController from "../components/ThemeController";
import Shell, { type BuildInfo } from "../components/system/Shell";
import CommandPalette from "../components/system/CommandPalette";
import { THEME_BOOT_SCRIPT } from "../lib/theme-config";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const DESCRIPTION =
  "VESTRIPPN — the root environment for Kaiau's medicine, research, software and experiments.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vestrippn.vercel.app"),
  title: {
    default: "VESTRIPPN // Personal Systems",
    template: "%s // VESTRIPPN",
  },
  description: DESCRIPTION,
  applicationName: "VESTRIPPN",
  authors: [{ name: "Kaiau", url: "https://github.com/ativichkaiau" }],
  openGraph: {
    type: "website",
    siteName: "VESTRIPPN",
    title: "VESTRIPPN // Personal Systems",
    description: DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "VESTRIPPN // Personal Systems",
    description: DESCRIPTION,
  },
  appleWebApp: { capable: true, title: "VESTRIPPN", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  verification: {
    google: "googlecd69efda792e89e4",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
    { media: "(prefers-color-scheme: light)", color: "#08090a" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const BUILD: BuildInfo = {
  sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  env: process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Dark first: `dark` is the server default; the boot script below applies
    // the stored appearance before paint. suppressHydrationWarning covers that.
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_BOOT_SCRIPT,
          }}
        />
        <AuthProvider>
          <ThemeController />
          <CommandPalette build={BUILD} />
          <ServiceWorkerRegister />
          <Toaster />
          <PwaHud />
          <DeviceSync />
          <FocusModeLoader />
          <Shell build={BUILD}>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
