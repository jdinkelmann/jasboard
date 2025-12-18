import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../lib/themes/ThemeContext";

export const metadata: Metadata = {
  title: "JasBoard",
  description: "Personal information dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
