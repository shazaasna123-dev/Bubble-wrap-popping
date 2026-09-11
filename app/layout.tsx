import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bublyyy — Movie Character Hunt",
  description: "Pop the bubble wrap and find the hidden movie character before time runs out.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
