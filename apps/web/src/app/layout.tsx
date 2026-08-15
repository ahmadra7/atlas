import type { Metadata } from "next";
import "./globals.css";
import { ApiSessionBootstrap } from "@/components/auth/ApiSessionBootstrap";
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
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-atlas-background font-sans text-atlas-ink transition-colors duration-300">
        <ThemeProvider>
          <ApiSessionBootstrap />
          <MobileHardNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
