import QRCode from "qrcode";
import { Ticket } from "@/types/ticket";

/**
 * Faz o download do ingresso completo em alta resolução (PNG),
 * contendo o QR Code gigante e todos os dados de identificação do titular.
 */
export async function downloadTicketPass(
  ticket: Ticket,
  profileData?: { nome?: string; cpf?: string }
): Promise<void> {
  const finalName = ticket.userName || profileData?.nome || "Titular Oficial";
  const finalCpf = ticket.userCpf || profileData?.cpf || "";
  const finalNum = ticket.ticketNumberFormatted || `#${String(ticket.ticketNumber || 1).padStart(4, "0")}`;

  const qrDataUrl = await QRCode.toDataURL(ticket.qrPayload || ticket.id, {
    width: 600,
    margin: 2,
    color: {
      dark: "#07090d",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Fundo escuro premium
  ctx.fillStyle = "#07090d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Borda metálica dourada
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  // 3. Cabeçalho escuro com linha de brilho
  ctx.fillStyle = "#101116";
  ctx.fillRect(20, 20, canvas.width - 40, 160);

  const grad = ctx.createLinearGradient(20, 20, canvas.width - 20, 20);
  grad.addColorStop(0, "#c9a227");
  grad.addColorStop(0.5, "#f5e6b8");
  grad.addColorStop(1, "#c9a227");
  ctx.fillStyle = grad;
  ctx.fillRect(20, 20, canvas.width - 40, 6);

  // Título e Subtítulo
  ctx.fillStyle = "#f5e6b8";
  ctx.font = "bold 23px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SINTONIA EDIÇÃO ESPECIAL 10 ANOS DJ LIPE", canvas.width / 2, 70);

  ctx.fillStyle = "#a8b2c3";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("VOUCHER OFICIAL DE ACESSO • PORTARIA CAPITU", canvas.width / 2, 100);

  // Setor
  ctx.fillStyle = "#f6f8fc";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(ticket.sectorName || "Pista Geral & Bar Central", canvas.width / 2, 142);

  // Número do Ingresso em destaque
  ctx.fillStyle = "#c9a227";
  ctx.font = "bold 20px monospace";
  ctx.fillText(`${ticket.lotName || "1º Lote Oficial"} • ${finalNum}`, canvas.width / 2, 198);

  // Carrega e desenha o QR Code
  const img = new Image();
  img.src = qrDataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Container branco do QR Code para leitura óptica perfeita
  const qrBoxSize = 500;
  const qrBoxX = (canvas.width - qrBoxSize) / 2;
  const qrBoxY = 220;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4;
  ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

  // Desenha o QR Code centralizado dentro da moldura branca
  ctx.drawImage(img, qrBoxX + 15, qrBoxY + 15, qrBoxSize - 30, qrBoxSize - 30);

  // Identificação do Titular
  ctx.fillStyle = "#f6f8fc";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(finalName, canvas.width / 2, 775);

  if (finalCpf) {
    ctx.fillStyle = "#a8b2c3";
    ctx.font = "16px monospace";
    ctx.fillText(`CPF: ${finalCpf}`, canvas.width / 2, 805);
  }

  // Data e Local
  ctx.fillStyle = "#f5e6b8";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("DATA OFICIAL: 10 DE ABRIL DE 2027 • 22H", canvas.width / 2, 855);

  ctx.fillStyle = "#a8b2c3";
  ctx.font = "15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("LOCAL: CAPITU, TUPACIGUARA - MG", canvas.width / 2, 885);

  // Aviso de Segurança na Base
  ctx.fillStyle = "#a8b2c3";
  ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Apresente este QR Code diretamente na portaria da catraca.", canvas.width / 2, 940);
  ctx.fillText("Ingresso nominal e intransferível. Validação óptica em tempo real.", canvas.width / 2, 965);

  // Dispara o download como imagem PNG
  canvas.toBlob((blob) => {
    if (!blob) return;
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeNum = finalNum.replace(/[^a-zA-Z0-9-]/g, "");
    link.download = `ingresso-sintonia-${safeNum}.png`;
    link.href = downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, "image/png");
}

/**
 * Faz o download exclusivamente da imagem do QR Code puro em altíssima resolução (1000x1000 PNG).
 */
export async function downloadPureQrCode(ticket: Ticket): Promise<void> {
  const finalNum = ticket.ticketNumberFormatted || `#${String(ticket.ticketNumber || 1).padStart(4, "0")}`;

  const qrDataUrl = await QRCode.toDataURL(ticket.qrPayload || ticket.id, {
    width: 1000,
    margin: 2,
    color: {
      dark: "#07090d",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  const res = await fetch(qrDataUrl);
  const blob = await res.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeNum = finalNum.replace(/[^a-zA-Z0-9-]/g, "");
  link.download = `qrcode-sintonia-${safeNum}.png`;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, 200);
}

