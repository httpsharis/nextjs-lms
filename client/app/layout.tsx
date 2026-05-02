import type { Metadata } from "next";
import { Poppins, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./utils/themeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Specify needed weights
  variable: "--font-poppins", // Defines CSS variable
});

// 2. Configure Josefin Sans
const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-josefin",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${josefin.variable} h-full antialiased bg-white! dark:bg-linear-to-b dark:from-gray-900 dark:to-black duration-300 `}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
