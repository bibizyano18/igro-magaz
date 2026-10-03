import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DemoAuthProvider from "./providers/DemoAuthProvider";
import AppNav from "./ui/AppNav";
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
  title: "igro-magaz",
  description: "Магазин цифровых игр и вишлистов",
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
        <DemoAuthProvider>
          <AppNav />
          {children}
        </DemoAuthProvider>
      </body>
    </html>
  );
}
