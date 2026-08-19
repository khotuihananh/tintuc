import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabBar from "@/components/TabBar";

export const metadata: Metadata = {
  title: "Giá vàng, BTC & xăng dầu",
  description: "Giá vàng trong nước, giá Bitcoin và giá xăng dầu, cập nhật trực tiếp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b1f3a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="font-body">
        {children}
        <TabBar />
      </body>
    </html>
  );
}
