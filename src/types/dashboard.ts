export interface KpiValues {
  meta: number;
  realizado: number;
}

export interface CalculatedKpi {
  meta: number;
  realizado: number;
  restante: number;
  percent: number;
}

export interface EmissoesData {
  novos: number;
  renovacao: number;
}

export interface ProdutoItem {
  id: string;
  name: string;
  percent: number;
  color: string;
  iconName: string;
}

export interface EvolucaoItem {
  date: string;
  novos: number;
  renovacoes: number;
}

export interface DashboardState {
  companyName: string;
  periodLabel: string;
  dateRange: string;
  kpiSegurosNovos: KpiValues;
  kpiRenovacoes: KpiValues;
  emissoes: EmissoesData;
  produtos: ProdutoItem[];
  evolucaoDiaria: EvolucaoItem[];
  lastUpdated?: string;
}
