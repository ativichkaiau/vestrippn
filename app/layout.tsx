import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import HoverTypewriter from "../components/HoverTypewriter";
import CommandPalette from "../components/CommandPalette";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import Toaster from "../components/Toaster";
import PwaHud from "../components/PwaHud";
import ViewTransitions from "../components/ViewTransitions";
import SiteMotion from "../components/SiteMotion";

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

// Geometric sans for the "Revolut" wordmark lockup (approximates the brand font).
const revolut = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: '--font-revolut',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VEStriPPN 3.0 // W11 Revolut",
  description: "Personal telemetry, mission control, and Claude-ready command surfaces.",
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
          ${inter.variable} ${jetbrainsMono.variable} ${revolut.variable} font-sans
          bg-[#FAFAFA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 
          antialiased h-screen flex flex-col overflow-hidden 
          transition-colors duration-700 
          selection:bg-[#00A598]/30 selection:text-[#00A598] dark:selection:text-white
        `}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var lv=localStorage.getItem('vest_livery');var md=localStorage.getItem('vest_mode');var h=new Date().getHours();if(md!=='day'&&md!=='night'){md=(h<6||h>=18)?'night':'day';}var el=document.documentElement;el.classList.add('w10-eq-power');if(['monza','senna','verstappen','ferrari','forceindia','mclaren','benetton','jps','alpine'].indexOf(lv)>=0){el.classList.add('dark',lv,'w09-'+lv);}else{if(md==='night'){el.classList.add('dark');}else{el.classList.remove('dark');}}if(localStorage.getItem('vest_lowpower')==='1'){el.classList.add('low-power');}}catch(e){}})();`,
          }}
        />
        <AuthProvider>
          <HoverTypewriter />
          <CommandPalette />
          <ServiceWorkerRegister />
          <Toaster />
          <PwaHud />
          <ViewTransitions />
          <SiteMotion>{children}</SiteMotion>
        </AuthProvider>
      </body>
    </html>
  );
}
