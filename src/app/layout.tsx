import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athletics Meet",
  description: "Digital Operating System for VTU Athletics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
