interface PendingPixEmailData {
  userName: string;
  userEmail: string;
  sectorName?: string;
  lotName?: string;
  price?: number;
  pixCopiaECola?: string;
  paymentUrl?: string;
  expiresInMinutes?: number;
}

export function generatePendingPixEmailHtml(data: PendingPixEmailData): string {
  const {
    userName,
    sectorName = "Pista Geral & Bar Central",
    lotName = "1º Lote Oficial",
    price = 60.0,
    pixCopiaECola = "",
    paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online"}/#ingressos`,
    expiresInMinutes = 15,
  } = data;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Sua vaga está pré-reservada • Sintonia Especial 10 Anos DJ Lipe</title>
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
          
          <!-- Top Accent Light Bar (Solid Gold Gradient without pastel) -->
          <tr>
            <td style="height: 4px; background: #c9a227; background-color: #c9a227;"></td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td align="center" style="padding: 40px 30px 15px 30px; text-align: center;">
              
              <!-- Selo Urgência / Reserva -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: rgba(201, 162, 39, 0.15); border: 1px solid rgba(201, 162, 39, 0.4); border-radius: 20px; padding: 6px 16px;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #f5e6b8; text-transform: uppercase;">
                      Reserva Temporária de Ingresso
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Headline de Conversão -->
              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px; color: #f6f8fc; text-transform: uppercase; line-height: 1.25;">
                Quase lá, ${userName.split(" ")[0]}!
              </h1>
              
              <p style="margin: 0; font-size: 14px; color: #a8b2c3; line-height: 1.6;">
                Você iniciou seu pedido para a <strong style="color: #f6f8fc;">Sintonia Edição Especial 10 Anos DJ Lipe</strong>. Sua vaga no <strong style="color: #f5e6b8;">${lotName}</strong> está pré-reservada.
              </p>
            </td>
          </tr>

          <!-- Scarcity / Urgency Countdown Banner -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b1930; border: 1px solid rgba(201, 162, 39, 0.4); border-radius: 16px;">
                <tr>
                  <td align="center" style="padding: 16px 20px; text-align: center;">
                    <span style="font-size: 12px; font-weight: 800; color: #f5e6b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                      Lote com Alta Procura
                    </span>
                    <p style="margin: 0; font-size: 13px; color: #a8b2c3; line-height: 1.5;">
                      Para evitar a perda da vaga ou virada de preço, conclua o pagamento em até <strong style="color: #ffffff;">${expiresInMinutes} minutos</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090d; border: 1px solid #0b1930; border-radius: 18px; padding: 20px;">
                <tr>
                  <td style="border-bottom: 1px solid #0b1930; padding-bottom: 14px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 11px; text-transform: uppercase; color: #a8b2c3; display: block; margin-bottom: 2px;">Setor Selecionado</span>
                          <strong style="font-size: 15px; color: #f6f8fc; line-height: 1.3; display: block;">${sectorName}</strong>
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
                <tr>
                  <td style="padding-top: 14px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 11px; text-transform: uppercase; color: #a8b2c3; display: block;">Total do Pedido</span>
                          <span style="font-size: 11px; color: #34d399;">Pagamento Instantâneo via PIX</span>
                        </td>
                        <td align="right" style="vertical-align: middle;">
                          <strong style="font-size: 22px; font-weight: 900; color: #f5e6b8;">${formattedPrice}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            pixCopiaECola
              ? `
          <!-- PIX Copy and Paste Block -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090d; border: 1px dashed rgba(201, 162, 39, 0.5); border-radius: 16px; padding: 18px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; color: #f5e6b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                      Código PIX Copia e Cola:
                    </span>
                    <div style="background-color: #101116; border: 1px solid #0b1930; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 11px; color: #a8b2c3; word-break: break-all; line-height: 1.4;">
                      ${pixCopiaECola}
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #a8b2c3; text-align: center;">
                      Abra o app do seu banco, selecione a opção <strong>PIX Copia e Cola</strong> e cole o código acima.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Main CTA Button (Solid Gold Metallic - Imune à Inversão de Modo Escuro) -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; width: 100%;">
                <tr>
                  <td align="center" class="gold-btn" style="border-radius: 14px; background-color: #c9a227 !important; background: #c9a227 !important;">
                    <a href="${paymentUrl}" target="_blank" class="gold-btn" style="display: block; padding: 18px 24px; font-size: 15px; font-weight: 900; color: #07090d !important; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 14px; text-align: center; background-color: #c9a227 !important; background: #c9a227 !important;">
                      CONCLUIR PAGAMENTO COM PIX
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trust Badges -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="font-size: 12px; color: #a8b2c3;">
                    🔒 <strong>Ambiente Seguro:</strong> Processamento oficial Mercado Pago • Emissão imediata de voucher com QR Code após aprovação
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 25px 30px 35px 30px; border-top: 1px solid #0b1930; background-color: #07090d; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #f6f8fc; text-transform: uppercase;">
                Sintonia Edição Especial 10 Anos DJ Lipe
              </p>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #a8b2c3;">
                Precisa de ajuda com seu pagamento? Atendimento direto no WhatsApp: 
                <a href="https://wa.me/553491535921?text=Ol%C3%A1%2C%20iniciei%20minha%20compra%20e%20preciso%20de%20ajuda%20com%20meu%20ingresso%20da%20Sintonia" target="_blank" style="color: #c9a227; text-decoration: underline; font-weight: 700;">+55 (34) 9153-5921</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #a8b2c3;">
                Realização: GHVE Eventos & RL Produções • Capitu, Tupaciguara - MG
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
