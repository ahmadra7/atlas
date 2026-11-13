import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ApiSessionBootstrap } from "@/components/auth/ApiSessionBootstrap";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { InstantNav } from "@/components/navigation/InstantNav";
import { MobileHardNav } from "@/components/navigation/MobileHardNav";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "سرآشپز هوشمند",
  description: "هوشمندانه بپزید، با آنچه دارید.",
  applicationName: "چی بپزم",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "چی بپزم",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4022F" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1214" },
  ],
};

const themeInitScript = `
(function(){
  try {
    var key = 'atlas-theme';
    var stored = localStorage.getItem(key);
    var theme = stored === 'dark' || stored === 'light' ? stored : 'light';
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          rel="preload"
          href="/fonts/DanaFaNum-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/DanaFaNum-DemiBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/DanaFaNum-ExtraBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-atlas-background font-sans text-atlas-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <ApiSessionBootstrap />
            <RegisterServiceWorker />
            <MobileHardNav />
            <InstantNav>{children}</InstantNav>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
