export type TicketSector = "pista" | "lounge_rosa" | "lounge_azul" | "camarote";
export type TicketStatus = "approved" | "pending" | "cancelled";

export interface Ticket {
  id: string; // Ex: "SINTONIA-10A-8492041"
  userId: string;
  userEmail: string;
  userName: string;
  userCpf: string;
  sector: TicketSector;
  sectorName: string;
  lot: number;
  lotName: string;
  price: number;
  status: TicketStatus;
  qrPayload: string; // Secure token / payload for QR Code validation
  purchaseDate: string; // ISO date string
  paymentId?: string;
  paymentMethod?: "pix" | "credit_card";
}
