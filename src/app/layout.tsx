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
    "Funk",
    "Música Eletrônica",
  ],
  authors: [{ name: "GHVE Eventos & RL Produções", url: "https://sintoniaedicaoespecial.online" }],
  category: "Festival",
  alternates: {
    canonical: "https://sintoniaedicaoespecial.online",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
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

const jsonLdEvent = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "@id": "https://sintoniaedicaoespecial.online/#event",
  name: "Sintonia Edição Especial 10 Anos DJ Lipe",
  description:
    "Sintonia Edição Especial 10 Anos DJ Lipe. Dia 10 de Abril de 2027 no Capitu em Tupaciguara - MG. Festival comemorando uma década de carreira do DJ Lipe.",
  url: "https://sintoniaedicaoespecial.online",
  startDate: "2027-04-10T22:00:00-03:00",
  endDate: "2027-04-11T06:00:00-03:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Capitu",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Capitu",
      addressLocality: "Tupaciguara",
      addressRegion: "MG",
      postalCode: "38430-000",
      addressCountry: "BR",
    },
  },
  image: [
    "https://sintoniaedicaoespecial.online/assets/logos/logo-especial-10-anos-lipe.svg",
  ],
  performer: {
    "@type": "Person",
    name: "DJ Lipe",
  },
  organizer: {
    "@type": "Organization",
    name: "GHVE Eventos & RL Produções",
    url: "https://sintoniaedicaoespecial.online",
  },
  offers: {
    "@type": "Offer",
    name: "Ingresso Pista - 1º Lote",
    price: "60.00",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
    url: "https://sintoniaedicaoespecial.online",
    validFrom: "2026-10-01T00:00:00-03:00",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://sintoniaedicaoespecial.online/#website",
  name: "Sintonia Edição Especial 10 Anos DJ Lipe",
  url: "https://sintoniaedicaoespecial.online",
  inLanguage: "pt-BR",
  description: "Site oficial do festival Sintonia Edição Especial 10 Anos DJ Lipe em Tupaciguara - MG.",
  publisher: {
    "@type": "Organization",
    name: "GHVE Eventos & RL Produções",
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
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Context" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
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

