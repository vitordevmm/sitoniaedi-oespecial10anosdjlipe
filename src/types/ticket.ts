export type TicketSector = "pista" | "lounge_rosa" | "lounge_azul" | "camarote";
export type TicketStatus = "approved" | "pending" | "cancelled" | "used";

export interface Ticket {
  id: string; // Ex: "SINTONIA-10A-8492041"
  ticketNumber?: number; // Ex: 1
  ticketNumberFormatted?: string; // Ex: "#0001"
  userId: string;
  userEmail: string;
  userName: string;
  userCpf: string;
  userAge?: number;
  userBirthDate?: string;
  sector: TicketSector;
  sectorName: string;
  lot: number;
  lotName: string;
  price: number;
  status: TicketStatus;
  qrPayload: string; // URL ou Secure Token para validação de portaria
  purchaseDate: string; // ISO date string
  paymentId?: string;
  paymentMethod?: "pix" | "credit_card";
  isCourtesy?: boolean;
  checkedInAt?: string; // ISO date string de validação
  checkedInBy?: string; // Email do fiscal que validou
}

