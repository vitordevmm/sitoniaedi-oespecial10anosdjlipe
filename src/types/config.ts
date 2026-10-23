export interface LotConfig {
  id: string;
  name: string;
  sector: "pista" | "lounge_rosa" | "lounge_azul" | "camarote";
  sectorName: string;
  price: number;
  active: boolean;
  order: number;
}

export interface EventConfig {
  ingressos: {
    totalAvailable: number; // Quantidade de ingressos disponíveis para venda
  };
  lotes: LotConfig[];
  idade: {
    minAgeUnaccompanied: number; // Idade mínima para entrar desacompanhado (ex: 17)
  };
  cortesias: {
    totalAvailable: number; // Quantidade de cortesias totais disponíveis
  };
  updatedAt?: string | Date;
  updatedBy?: string;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  ingressos: {
    totalAvailable: 2500,
  },
  lotes: [
    {
      id: "pista_1",
      name: "1º Lote Oficial",
      sector: "pista",
      sectorName: "Pista Geral & Bar Central",
      price: 60,
      active: true,
      order: 1,
    },
    {
      id: "pista_2",
      name: "2º Lote Oficial",
      sector: "pista",
      sectorName: "Pista Geral & Bar Central",
      price: 80,
      active: false,
      order: 2,
    },
    {
      id: "pista_3",
      name: "3º Lote Oficial",
      sector: "pista",
      sectorName: "Pista Geral & Bar Central",
      price: 100,
      active: false,
      order: 3,
    },
    {
      id: "lounge_rosa_1",
      name: "Vaga Automotiva (Ala Esquerda)",
      sector: "lounge_rosa",
      sectorName: "Lounge Rosa (12 Carros)",
      price: 1200,
      active: true,
      order: 4,
    },
    {
      id: "lounge_azul_1",
      name: "Vaga Automotiva (Ala Direita)",
      sector: "lounge_azul",
      sectorName: "Lounge Azul (12 Carros)",
      price: 1200,
      active: true,
      order: 5,
    },
    {
      id: "camarote_1",
      name: "Área Exclusiva Palco",
      sector: "camarote",
      sectorName: "Camarote no Palco (4 Unidades)",
      price: 2500,
      active: true,
      order: 6,
    },
  ],
  idade: {
    minAgeUnaccompanied: 17, // Menores de 17 precisam da autorização
  },
  cortesias: {
    totalAvailable: 150,
  },
};
