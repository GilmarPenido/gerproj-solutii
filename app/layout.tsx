import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/auth-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solutii - GerProj",
  description: "Sistema de Controle de Chamados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <NextAuthProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </NextAuthProvider>

  );
}
