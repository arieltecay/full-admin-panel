export type PayrollValue = string | number | boolean | null | undefined;

export interface PayrollMetadata {
  cuit?: string;
  period?: string;
  sequence?: string;
  contribuyente?: string;
  [key: string]: PayrollValue;
}

export interface PayrollRow {
  _id?: string;
  Legajo?: string | number;
  'Apellido y Nombre'?: string;
  Sucursal?: string;
  Convenio?: string;
  'Antigüedad (Años)'?: number;
  'Neto a Pagar'?: number;
  'Remuneración Total'?: number;
  Adicionales?: number;
  Deducciones?: number;
  Hijos?: number;
  'Obra Social'?: string;
  Condición?: string;
  Actividad?: string;
  Localidad?: string;
  [key: string]: PayrollValue;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface PayrollStats {
  summary: {
    totalEmployees: number;
    totalRemuneration: number;
    averageRemuneration: number;
    totalAdicionales: number;
    totalHijos: number;
    [key: string]: number;
  };
  distributions: {
    obraSocial: DistributionItem[];
    condicion: DistributionItem[];
    actividad: DistributionItem[];
    localidad: DistributionItem[];
    [key: string]: DistributionItem[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DashboardDetailsResponse {
  clientName: string;
  metadata: PayrollMetadata;
  stats: PayrollStats;
  rows: PayrollRow[];
  periods?: Array<{ period: string }>;
}

export type TabKey = 'personal' | 'costos' | 'desvios' | 'retenciones' | 'ficha';
