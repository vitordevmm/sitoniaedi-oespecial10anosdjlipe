"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

interface TicketQRCodeProps {
  payload: string;
  size?: number;
  className?: string;
}

export function TicketQRCode({ payload, size = 180, className = "" }: TicketQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function generate() {
      try {
        setLoading(true);
        const url = await QRCode.toDataURL(payload, {
          width: size,
          margin: 1,
          color: {
            dark: "#07090d",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        if (isMounted) {
          setDataUrl(url);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to generate QR Code:", err);
        if (isMounted) setLoading(false);
      }
    }

    generate();
    return () => {
      isMounted = false;
    };
  }, [payload, size]);

  if (loading || !dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          colorScheme: "light",
          forcedColorAdjust: "none",
          backgroundColor: "#ffffff",
          isolation: "isolate",
        }}
        className={`flex items-center justify-center bg-white rounded-xl shadow-inner qr-code-shield ${className}`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#c9a227]" />
      </div>
    );
  }

  return (
    <div
      style={{
        colorScheme: "light",
        forcedColorAdjust: "none",
        backgroundColor: "#ffffff",
        isolation: "isolate",
      }}
      className={`p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(201,162,39,0.3)] inline-block qr-code-shield ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt="QR Code do Ingresso Sintonia 10 Anos DJ Lipe"
        width={size}
        height={size}
        style={{
          colorScheme: "light",
          forcedColorAdjust: "none",
          backgroundColor: "#ffffff",
          filter: "none",
          WebkitFilter: "none",
          mixBlendMode: "normal",
          imageRendering: "pixelated",
        }}
        className="block rounded-lg"
      />
    </div>
  );
}
