import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سرآشپز هوشمند",
  description: "هوشمندانه بپزید، با آنچه دارید.",
  icons: {
    icon: "/brand-chef.png",
    apple: "/brand-chef.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
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
      <body className="bg-atlas-background font-sans">{children}</body>
    </html>
  );
}
