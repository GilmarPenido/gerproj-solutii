import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/auth-provider";
const nunito = Nunito({ subsets: ["latin"] });

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
          <body className={nunito.className}>{children}</body>
        </html>
      </NextAuthProvider>

  );
}
