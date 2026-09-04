import type { Metadata } from "next";
import "./globals.css";
import { ApiSessionBootstrap } from "@/components/auth/ApiSessionBootstrap";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { InstantNav } from "@/components/navigation/InstantNav";
import { MobileHardNav } from "@/components/navigation/MobileHardNav";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "سرآشپز هوشمند",
  description: "هوشمندانه بپزید، با آنچه دارید.",
  icons: {
    icon: "/brand-chef.png",
    apple: "/brand-chef.png",
  },
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
      <body className="bg-atlas-background font-sans text-atlas-ink transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <ApiSessionBootstrap />
            <MobileHardNav />
            <InstantNav>{children}</InstantNav>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
