import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { MobileSplashScreen } from "@/components/layout/MobileSplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#07090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sintoniaedicaoespecial.online"),
  title: "Sintonia Edição Especial 10 Anos DJ Lipe | Site Oficial",
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
  alternates: {
    canonical: "https://sintoniaedicaoespecial.online",
  },
  openGraph: {
    title: "Sintonia Edição Especial 10 Anos DJ Lipe | Site Oficial",
    description:
      "Dia 10 de Abril de 2027 no Capitu, em Tupaciguara - MG. Garanta seu ingresso oficial com emissão de QR Code na hora, PIX ou cartão de crédito.",
    url: "https://sintoniaedicaoespecial.online",
    siteName: "Sintonia Especial 10 Anos DJ Lipe",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/assets/logos/logo-especial-10-anos-lipe.svg",
        width: 800,
        height: 600,
        alt: "Sintonia Edição Especial 10 Anos DJ Lipe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sintonia Edição Especial 10 Anos DJ Lipe | Site Oficial",
    description:
      "Dia 10 de Abril de 2027 no Capitu, Tupaciguara - MG. Garanta seu ingresso oficial do festival.",
    images: ["/assets/logos/logo-especial-10-anos-lipe.svg"],
  },
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        <meta name="color-scheme" content="dark only" />
        <meta name="supported-color-schemes" content="dark" />
        <meta name="theme-color" content="#07090d" />
      </head>
      <body className="min-h-full flex flex-col bg-[#07090d] text-[#f6f8fc]">
        <MobileSplashScreen />
        <AuthProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

