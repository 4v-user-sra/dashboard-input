import { DashboardState } from '../types/dashboard';

export const initialDashboardData: DashboardState = {
  companyName: 'Dashboard Comercial',
  periodLabel: 'Visão geral do desempenho da sua operação',
  dateRange: '01/04/2025 - 30/04/2025',
  kpiSegurosNovos: {
    meta: 1200000,
    realizado: 800000,
  },
  kpiRenovacoes: {
    meta: 800000,
    realizado: 150000,
  },
  emissoes: {
    novos: 1245,
    renovacao: 580,
  },
  produtos: [
    { id: '1', name: 'Automóvel', percent: 22, color: '#2F80ED', iconName: 'Car' },
    { id: '2', name: 'Residencial', percent: 15, color: '#00E396', iconName: 'Home' },
    { id: '3', name: 'Condomínio', percent: 10, color: '#8B5CF6', iconName: 'Building2' },
    { id: '4', name: 'Empresarial', percent: 9, color: '#F39C38', iconName: 'Briefcase' },
    { id: '5', name: 'Frota', percent: 8, color: '#00D2D3', iconName: 'Truck' },
    { id: '6', name: 'Equipamento', percent: 6, color: '#FF4757', iconName: 'Wrench' },
    { id: '7', name: 'Evento', percent: 5, color: '#FFA502', iconName: 'CalendarDays' },
    { id: '8', name: 'Mobi Livre', percent: 5, color: '#9B51E0', iconName: 'Smartphone' },
    { id: '9', name: 'Vida', percent: 4, color: '#00D2D3', iconName: 'User' },
    { id: '10', name: 'RC Profissional', percent: 3, color: '#2F80ED', iconName: 'Shield' },
    { id: '11', name: 'Demais Produtos', percent: 3, color: '#718096', iconName: 'Layers' },
  ],
  evolucaoDiaria: [
    { date: '01/04', novos: 55, renovacoes: 35 },
    { date: '03/04', novos: 65, renovacoes: 32 },
    { date: '05/04', novos: 60, renovacoes: 40 },
    { date: '07/04', novos: 70, renovacoes: 33 },
    { date: '09/04', novos: 100, renovacoes: 60 },
    { date: '11/04', novos: 90, renovacoes: 62 },
    { date: '13/04', novos: 78, renovacoes: 50 },
    { date: '15/04', novos: 68, renovacoes: 48 },
    { date: '17/04', novos: 105, renovacoes: 62 },
    { date: '19/04', novos: 88, renovacoes: 52 },
    { date: '21/04', novos: 112, renovacoes: 70 },
    { date: '23/04', novos: 92, renovacoes: 58 },
    { date: '25/04', novos: 125, renovacoes: 75 },
    { date: '27/04', novos: 140, renovacoes: 78 },
    { date: '29/04', novos: 120, renovacoes: 68 },
    { date: '30/04', novos: 158, renovacoes: 95 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const samplePeriodsData: Record<string, DashboardState> = {
  '01/04/2025 - 30/04/2025': initialDashboardData,
  '01/05/2025 - 31/05/2025': {
    ...initialDashboardData,
    dateRange: '01/05/2025 - 31/05/2025',
    periodLabel: 'Fechamento Consolidado de Maio',
    kpiSegurosNovos: { meta: 1300000, realizado: 1380000 },
    kpiRenovacoes: { meta: 850000, realizado: 820000 },
    emissoes: { novos: 1420, renovacao: 690 },
    evolucaoDiaria: [
      { date: '02/05', novos: 65, renovacoes: 40 },
      { date: '06/05', novos: 80, renovacoes: 48 },
      { date: '10/05', novos: 95, renovacoes: 55 },
      { date: '14/05', novos: 110, renovacoes: 62 },
      { date: '18/05', novos: 120, renovacoes: 70 },
      { date: '22/05', novos: 135, renovacoes: 82 },
      { date: '26/05', novos: 150, renovacoes: 90 },
      { date: '31/05', novos: 175, renovacoes: 105 },
    ],
  },
  '01/03/2025 - 31/03/2025': {
    ...initialDashboardData,
    dateRange: '01/03/2025 - 31/03/2025',
    periodLabel: 'Fechamento Histórico de Março',
    kpiSegurosNovos: { meta: 1100000, realizado: 920000 },
    kpiRenovacoes: { meta: 750000, realizado: 680000 },
    emissoes: { novos: 1100, renovacao: 520 },
    evolucaoDiaria: [
      { date: '03/03', novos: 50, renovacoes: 30 },
      { date: '08/03', novos: 62, renovacoes: 38 },
      { date: '14/03', novos: 75, renovacoes: 45 },
      { date: '20/03', novos: 88, renovacoes: 52 },
      { date: '26/03', novos: 98, renovacoes: 60 },
      { date: '31/03', novos: 120, renovacoes: 75 },
    ],
  },
  'Ano atual (2025)': {
    ...initialDashboardData,
    dateRange: 'Ano atual (2025)',
    periodLabel: 'Acumulado Geral do Ano de 2025',
    kpiSegurosNovos: { meta: 14000000, realizado: 9800000 },
    kpiRenovacoes: { meta: 9500000, realizado: 6500000 },
    emissoes: { novos: 14500, renovacao: 7200 },
    evolucaoDiaria: [
      { date: 'Jan', novos: 980, renovacoes: 520 },
      { date: 'Fev', novos: 1120, renovacoes: 590 },
      { date: 'Mar', novos: 1250, renovacoes: 640 },
      { date: 'Abr', novos: 1380, renovacoes: 710 },
      { date: 'Mai', novos: 1420, renovacoes: 690 },
      { date: 'Jun (proj)', novos: 1500, renovacoes: 750 },
    ],
  },
};

export const samplePresets = [
  {
    label: 'Cenário Padrão (Abril/2025)',
    description: 'Metas originais (67% novos / 19% renovações)',
    data: initialDashboardData,
  },
  {
    label: 'Cenário Meta Superada (106%)',
    description: 'Vendas acima do objetivo estipulado',
    data: samplePeriodsData['01/05/2025 - 31/05/2025'],
  },
  {
    label: 'Cenário Acumulado 2025',
    description: 'Visão consolidada anual por mês',
    data: samplePeriodsData['Ano atual (2025)'],
  },
];
