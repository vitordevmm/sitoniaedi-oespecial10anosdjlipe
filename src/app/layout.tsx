import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sintonia Edição Especial 10 Anos DJ Lipe",
  description:
    "Sintonia Edição Especial 10 Anos DJ Lipe. Dia 10 de Abril de 2027 no Capitu, em Tupaciguara - MG. Garanta seu ingresso para este festival com milhares de pessoas vibrando na mesma sintonia.",
  keywords: [
    "DJ Lipe",
    "Sintonia",
    "Sintonia Edição Especial",
    "Especial 10 Anos",
    "Ingressos",
    "Tupaciguara",
    "Capitu",
    "GHVE Eventos",
    "RL Produções",
    "Festival",
  ],
  icons: {
    icon: "/assets/logos/logo-especial-10-anos-lipe.svg",
    shortcut: "/assets/logos/logo-especial-10-anos-lipe.svg",
    apple: "/assets/logos/logo-especial-10-anos-lipe.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07090d] text-[#f6f8fc]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

