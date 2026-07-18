import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ThreadCraft - Cửa hàng thời trang Microservices",
  description: "Nền tảng thương mại điện tử thời trang Microservices hiện đại",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('store_settings');
                if (stored) {
                  const settings = JSON.parse(stored);
                  if (settings.primaryColor) {
                    document.documentElement.style.setProperty('--primary', settings.primaryColor);
                  }
                  if (settings.primaryColorDark) {
                    document.documentElement.style.setProperty('--primary-dark', settings.primaryColorDark);
                  }
                  if (settings.primaryColorLight) {
                    document.documentElement.style.setProperty('--primary-light', settings.primaryColorLight);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <CartProvider>
          <PromoBanner />
          <Navbar />
          <main className="container">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
