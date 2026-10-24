import QRCode from "qrcode";

interface TicketEmailData {
  userName: string;
  userEmail: string;
  userCpf?: string;
  ticketId: string;
  ticketNumberFormatted?: string;
  sectorName: string;
  lotName: string;
  price: number;
  qrPayload: string;
  appUrl?: string;
}

export async function generateTicketEmailHtml(data: TicketEmailData): Promise<string> {
  const {
    userName,
    userCpf,
    ticketId,
    ticketNumberFormatted,
    sectorName,
    lotName,
    price,
    qrPayload,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online",
  } = data;

  // Generate QR Code data URL (PNG)
  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 280,
    margin: 2,
    color: {
      dark: "#07090d",
      light: "#ffffff",
    },
  });

  const formattedCpf = userCpf
    ? userCpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : "Não informado";

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  const profileTicketUrl = `${appUrl}/perfil?tab=ingressos`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Seu Ingresso Confirmado • Sintonia Especial 10 Anos DJ Lipe</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    .gold-btn {
      background-color: #c9a227 !important;
      background: #c9a227 !important;
      color: #07090d !important;
    }
    .dark-tag-box {
      background-color: #141720 !important;
      border: 1px solid #c9a227 !important;
    }
    @media (prefers-color-scheme: dark) {
      .gold-btn {
        background-color: #c9a227 !important;
        background: #c9a227 !important;
        color: #07090d !important;
      }
      .dark-tag-box {
        background-color: #141720 !important;
        border: 1px solid #c9a227 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #07090d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f6f8fc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090d; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 30px 15px 50px 15px;">
        
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #101116; border: 1px solid #c9a227; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(201, 162, 39, 0.2);">
          
          <!-- Top Accent Light Bar (Solid Gold Gradient) -->
          <tr>
            <td style="height: 4px; background: #c9a227; background-color: #c9a227;"></td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; text-align: center;">
              
              <!-- Tag Selo Sintonia -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #0b1930; border: 1px solid rgba(201, 162, 39, 0.4); border-radius: 20px; padding: 5px 16px;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #f5e6b8; text-transform: uppercase;">
                      Sintonia Apresenta
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Event Title -->
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #f6f8fc; text-transform: uppercase; line-height: 1.2;">
                Especial 10 Anos DJ Lipe
              </h1>
              
              <!-- Subtitle -->
              <p style="margin: 0; font-size: 13px; color: #c9a227; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                10 de Abril de 2027 • Capitu, Tupaciguara - MG
              </p>
            </td>
          </tr>

          <!-- Success Confirmation Banner -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 16px;">
                <tr>
                  <td align="center" style="padding: 16px 20px; text-align: center;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #34d399; margin-right: 8px; vertical-align: middle;"></span>
                    <strong style="font-size: 13px; color: #34d399; letter-spacing: 0.5px; text-transform: uppercase; vertical-align: middle;">
                      Pagamento Aprovado • Acesso VIP Confirmado
                    </strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a8b2c3;">
                      Olá, <strong style="color: #f6f8fc;">${userName}</strong>! Seu ingresso oficial foi emitido com sucesso.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket VIP Pass Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #07090d 0%, #0d121c 100%); border: 1px solid rgba(201, 162, 39, 0.3); border-radius: 20px; overflow: hidden;">
                
                <!-- Ticket Top Header -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px dashed rgba(201, 162, 39, 0.3); background-color: rgba(11, 25, 48, 0.4);">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <span style="font-size: 10px; font-weight: 700; color: #a8b2c3; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 2px;">
                            Setor Selecionado
                          </span>
                          <strong style="font-size: 16px; color: #f6f8fc; display: block;">
                            ${sectorName}
                          </strong>
                        </td>
                        <td align="right" style="vertical-align: middle; white-space: nowrap; padding-left: 12px;">
                          <!-- Badge de Lote com Nested Table e Nowrap (Anti-Quebra e Anti-Colisão de Bordas) -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table; margin-left: auto;">
                            <tr>
                              <td class="dark-tag-box" style="background-color: #141720; border: 1px solid #c9a227; border-radius: 6px; padding: 4px 10px; text-align: center; white-space: nowrap;">
                                <span style="font-size: 11px; font-weight: 800; color: #f5e6b8; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; display: block; line-height: 1.2;">
                                  ${lotName}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- QR Code Display Area -->
                <tr>
                  <td align="center" style="padding: 30px 20px 20px 20px; text-align: center;">
                    <div style="display: inline-block; padding: 14px; background-color: #ffffff !important; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(201, 162, 39, 0.35); color-scheme: light; forced-color-adjust: none;">
                      <img src="${qrCodeDataUrl}" alt="QR Code do Ingresso" width="220" height="220" style="display: block; width: 220px; height: 220px; border: 0; background-color: #ffffff !important; color-scheme: light;" />
                    </div>

                    <!-- Ticket ID Voucher -->
                    <div style="margin-top: 18px;">
                      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a8b2c3; display: block; margin-bottom: 4px;">
                        Número do Ingresso Oficial
                      </span>
                      <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 900; color: #f5e6b8; background-color: #101116; border: 1px solid #c9a227; padding: 6px 16px; border-radius: 8px; letter-spacing: 1px;">
                        ${ticketNumberFormatted || "#" + ticketId}
                      </span>
                      <span style="font-size: 10px; color: #a8b2c3; display: block; margin-top: 4px; font-family: monospace;">
                        Código: ${ticketId}
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- Attendee Details Grid -->
                <tr>
                  <td style="padding: 15px 24px 24px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #101116; border: 1px solid #0b1930; border-radius: 14px; padding: 14px;">
                      <tr>
                        <td width="50%" style="padding: 6px 10px; vertical-align: top;">
                          <span style="font-size: 10px; text-transform: uppercase; color: #a8b2c3; display: block; margin-bottom: 2px;">Titular do Ingresso</span>
                          <strong style="font-size: 13px; color: #f6f8fc; display: block;">${userName}</strong>
                        </td>
                        <td width="50%" style="padding: 6px 10px; vertical-align: top;">
                          <span style="font-size: 10px; text-transform: uppercase; color: #a8b2c3; display: block; margin-bottom: 2px;">CPF Vinculado</span>
                          <strong style="font-size: 13px; color: #f6f8fc; display: block;">${formattedCpf}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 6px 10px; vertical-align: top;">
                          <span style="font-size: 10px; text-transform: uppercase; color: #a8b2c3; display: block; margin-bottom: 2px;">Valor Pago</span>
                          <strong style="font-size: 13px; color: #f5e6b8; display: block;">${formattedPrice}</strong>
                        </td>
                        <td width="50%" style="padding: 6px 10px; vertical-align: top;">
                          <span style="font-size: 10px; text-transform: uppercase; color: #a8b2c3; display: block; margin-bottom: 2px;">Portaria & Validação</span>
                          <strong style="font-size: 13px; color: #34d399; display: block;">Catraca Eletrônica</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Primary CTA Button (Solid Gold Metallic - Imune à Inversão de Modo Escuro) -->
          <tr>
            <td align="center" style="padding: 0 30px 35px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; width: 100%;">
                <tr>
                  <td align="center" class="gold-btn" style="border-radius: 14px; background-color: #c9a227 !important; background: #c9a227 !important;">
                    <a href="${profileTicketUrl}" target="_blank" class="gold-btn" style="display: block; padding: 18px 24px; font-size: 15px; font-weight: 900; color: #07090d !important; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 14px; text-align: center; background-color: #c9a227 !important; background: #c9a227 !important;">
                      BAIXAR INGRESSO & ACESSAR NO PERFIL
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #a8b2c3;">
                Você também pode acessar e salvar seu QR Code a qualquer momento direto na aba <strong>Meus Ingressos</strong> do site.
              </p>
            </td>
          </tr>

          <!-- Gate Rules & Legal Warnings -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b1930; border-radius: 14px; padding: 18px;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #f5e6b8; text-transform: uppercase;">
                      Orientações Essenciais de Portaria
                    </h4>
                    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #a8b2c3; line-height: 1.6;">
                      <li><strong style="color: #f6f8fc;">Documento Original:</strong> Apresente documento oficial original com foto juntamente com este QR Code.</li>
                      <li><strong style="color: #f6f8fc;">QR Code de Uso Único:</strong> A entrada só é permitida na primeira leitura. Não compartilhe nem publique prints deste código.</li>
                      <li><strong style="color: #f6f8fc;">Horário:</strong> Abertura dos portões prevista para as 22h do dia 10 de Abril de 2027 no Capitu, em Tupaciguara - MG.</li>
                      <li><strong style="color: #f6f8fc;">Regulamento:</strong> O ingresso é individual e intransferível sem direito a reembolso por desistência.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td align="center" style="padding: 25px 30px 35px 30px; border-top: 1px solid #0b1930; background-color: #07090d; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #f6f8fc; text-transform: uppercase;">
                Sintonia Edição Especial 10 Anos DJ Lipe
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #a8b2c3;">
                Realização & Produção Oficial: <strong>GHVE Eventos</strong> & <strong>RL Produções</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a8b2c3;">
                Dúvidas ou atendimento oficial? Chame nosso suporte no WhatsApp: 
                <a href="https://wa.me/553491535921" target="_blank" style="color: #c9a227; text-decoration: underline; font-weight: 700;">+55 (34) 9153-5921</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
