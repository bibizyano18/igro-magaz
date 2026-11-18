import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "./providers/AuthProvider";
import WishlistProvider from "./providers/WishlistProvider";
import BurgerMenu from "./ui/BurgerMenu/BurgerMenu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Задаём заголовок и описание страницы для Metadata API.
export const metadata: Metadata = {
  title: "igro-magaz — каталог игр и магазины",
  description: "Магазин цифровых игр и вишлистов",
};

// Указываем цвет темы и цветовую схему; width=device-width добавляет App Router.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

// Объявляем основной компонент этого файла.
export default function RootLayout({ children }: LayoutProps<"/">) {
  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <WishlistProvider>
            <BurgerMenu />
            {children}
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
