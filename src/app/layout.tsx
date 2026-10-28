import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "sramadhan.cv | Satria Ramadhan",
  description: "Portfolio Bergaya Sistem Operasi Desktop - Satria Ramadhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full bg-[var(--linux-bg)]">
      <body className="h-full w-full bg-[var(--linux-bg)] text-[var(--linux-text)] antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
