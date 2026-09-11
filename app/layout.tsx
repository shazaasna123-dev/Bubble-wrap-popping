import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "thottaal potti",
  description: "Pop the bubbles and find the nostalgic movie character.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
