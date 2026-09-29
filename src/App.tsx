import React, { useState, useRef } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShieldCheck, 
  Calendar, 
  ChevronDown, 
  Check, 
  BookOpen, 
  Edit3, 
  CheckCircle2, 
  Plus,
  FileText
} from 'lucide-react';
import { DashboardState } from './types/dashboard';
import { initialDashboardData, samplePeriodsData } from './data/defaultData';
import { getProductIcon } from './utils/icons';
import { parseBrNumber, formatCurrency, formatNumber, calculateKpi, calculateEmissoes } from './utils/formatters';
import { ClientGuideModal } from './components/ClientGuideModal';
import { PrintReportModal } from './components/PrintReportModal';

const STORAGE_KEY = 'ekto_seguros_dashboard_data_v2';
const PERIODS_STORAGE_KEY = 'ekto_seguros_periods_v2';

// --- SPOTLIGHT CONTAINER CARD ---
const SpotlightCard = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(450px circle at ${x}px ${y}px, rgba(243, 156, 56, 0.12), rgba(0, 227, 150, 0.05) 50%, transparent 80%)`;
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = 'transparent';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#0F141E] border border-[#1E2638] rounded-2xl relative overflow-hidden group shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 ${className}`}
    >
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
};

// --- CUSTOM TOOLTIP ---
const CustomEvolucaoTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E17]/95 border border-[#1E2638] p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-white/60 text-xs font-semibold mb-2">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs font-bold my-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white/80">{item.name}:</span>
            </div>
            <span className="text-white">{item.value} apólices</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function App() {
  // Periods Store
  const [periodsMap, setPeriodsMap] = useState<Record<string, DashboardState>>(() => {
    try {
      const saved = localStorage.getItem(PERIODS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return samplePeriodsData;
  });

  // Main Dashboard Data
  const [data, setData] = useState<DashboardState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return initialDashboardData;
  });

  // UI States
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save changes to current data and persistence
  const handleSaveData = (newData: DashboardState) => {
    setData(newData);
    const updatedPeriods = {
      ...periodsMap,
      [newData.dateRange]: newData,
    };
    setPeriodsMap(updatedPeriods);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(updatedPeriods));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  };

  // Switch Period
  const handleSelectPeriod = (periodKey: string) => {
    setDateRangeOpen(false);

    let periodData = periodsMap[periodKey];
    if (!periodData) {
      periodData = {
        ...data,
        dateRange: periodKey,
        periodLabel: `Desempenho de ${periodKey}`,
      };
      const updated = { ...periodsMap, [periodKey]: periodData };
      setPeriodsMap(updated);
      localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(updated));
    }

    setData(periodData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(periodData));
    showToast(`Período: ${periodKey}`);
  };

  // KPI Calculations
  const kpiNovos = calculateKpi(data.kpiSegurosNovos.meta, data.kpiSegurosNovos.realizado);
  const kpiRen = calculateKpi(data.kpiRenovacoes.meta, data.kpiRenovacoes.realizado);

  // Status Emissões Calculations
  const emissoes = calculateEmissoes(data.emissoes.novos, data.emissoes.renovacao);

  const donutStatusData = [
    { name: 'Seguros Novos', value: emissoes.novos, color: '#00E396' },
    { name: 'Seguros Renovados', value: emissoes.renovacao, color: '#FFA502' },
  ];

  // Split produtos into 2 columns
  const halfLength = Math.ceil(data.produtos.length / 2);
  const produtosCol1 = data.produtos.slice(0, halfLength);
  const produtosCol2 = data.produtos.slice(halfLength);

  // Inline KPI Update
  const updateNovosMeta = (val: string) => {
    const num = parseBrNumber(val);
    handleSaveData({
      ...data,
      kpiSegurosNovos: { ...data.kpiSegurosNovos, meta: num },
    });
  };

  const updateNovosReal = (val: string) => {
    const num = parseBrNumber(val);
    handleSaveData({
      ...data,
      kpiSegurosNovos: { ...data.kpiSegurosNovos, realizado: num },
    });
  };

  const updateRenMeta = (val: string) => {
    const num = parseBrNumber(val);
    handleSaveData({
      ...data,
      kpiRenovacoes: { ...data.kpiRenovacoes, meta: num },
    });
  };

  const updateRenReal = (val: string) => {
    const num = parseBrNumber(val);
    handleSaveData({
      ...data,
      kpiRenovacoes: { ...data.kpiRenovacoes, realizado: num },
    });
  };

  const updateEmissoesNovos = (val: string) => {
    const num = parseBrNumber(val);
    handleSaveData({
      ...data,
      emissoes: { ...data.emissoes, novos: num },
    });
  };

  const updateEmissoesRen = (val: string) => {
    const num = parseBrNumber(val);
    handleSaveData({
      ...data,
      emissoes: { ...data.emissoes, renovacao: num },
    });
  };

  const updateProdutoPercent = (id: string, val: string) => {
    const num = parseBrNumber(val);
    const updated = data.produtos.map(p => p.id === id ? { ...p, percent: num } : p);
    handleSaveData({
      ...data,
      produtos: updated,
    });
  };

  return (
    <div className="min-h-screen max-h-none xl:h-screen xl:max-h-screen bg-[#07090E] text-white font-['Plus_Jakarta_Sans'] flex flex-col p-2.5 sm:p-3.5 md:p-4 overflow-y-auto xl:overflow-hidden print-page">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[99999] bg-[#00E396] text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full h-full max-w-[1720px] mx-auto flex flex-col justify-between gap-2.5 sm:gap-3">
        
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between shrink-0 h-11 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#0F141E] to-[#171F30] border border-[#1E2638] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-4.5 h-4.5 text-[#00E396]" />
            </div>
            {/* Top-Left Title: Only "Dashboard Comercial", no subtitle */}
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
              Dashboard Comercial
            </h1>
          </div>

          {/* Action Buttons: Only Edição Rápida, Exportar Relatório, Modo de Usar, Período */}
          <div className="flex items-center gap-2 no-print flex-wrap">
            
            {/* Botão: Edição Rápida / Concluir Edição */}
            <button
              onClick={() => {
                const nextState = !isQuickEditMode;
                setIsQuickEditMode(nextState);
                showToast(nextState ? 'Edição ativada: altere os valores nos cards' : 'Edição concluída e salva!');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isQuickEditMode
                  ? 'bg-[#00E396] text-black border-[#00E396] shadow-[0_0_15px_rgba(0,227,150,0.4)]'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30 shadow-sm'
              }`}
              title="Permite alterar metas, valores e apólices direto na tela"
            >
              {isQuickEditMode ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Concluir Edição</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edição Rápida</span>
                </>
              )}
            </button>

            {/* Botão: Exportar Relatório (Abre modal com Copiar Resumo e Baixar HTML) */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-[#0F141E] hover:bg-[#151C2B] border border-[#1E2638] hover:border-white/20 text-white/80 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Copiar resumo para WhatsApp ou baixar relatório HTML"
            >
              <FileText className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span>Exportar Relatório</span>
            </button>

            {/* Botão: Modo de Usar (Guia) */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="bg-[#0F141E] hover:bg-[#151C2B] border border-[#1E2638] hover:border-white/20 text-white/80 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Instruções de como editar e exportar"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#00E396]" />
              <span className="hidden sm:inline">Modo de Usar</span>
            </button>

            {/* Date Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDateRangeOpen(!dateRangeOpen)}
                className="bg-[#0F141E] hover:bg-[#151C2B] border border-[#1E2638] hover:border-white/20 text-white/80 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-white/60" />
                <span className="font-mono">{data.dateRange}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${dateRangeOpen ? 'rotate-180' : ''}`} />
              </button>

              {dateRangeOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F141E] border border-[#1E2638] rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] text-white/40 uppercase font-bold tracking-wider">Períodos Salvos</div>
                  {Object.keys(periodsMap).map((periodKey) => (
                    <button
                      key={periodKey}
                      onClick={() => handleSelectPeriod(periodKey)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between ${
                        data.dateRange === periodKey ? 'text-[#00E396] font-bold bg-[#00E396]/10' : 'text-white/70'
                      }`}
                    >
                      <span className="truncate">{periodKey}</span>
                      {data.dateRange === periodKey && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-[#1E2638] mt-1 pt-1">
                    <button
                      onClick={() => {
                        const newName = prompt('Digite o nome ou intervalo do novo período (ex: 01/06/2025 - 30/06/2025):');
                        if (newName && newName.trim()) {
                          handleSelectPeriod(newName.trim());
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-[#F39C38] hover:bg-[#F39C38]/10 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar Novo Período
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- ROW 1: CARDS PRINCIPAIS (SEGUROS NOVOS & RENOVAÇÕES) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 min-h-[135px]">
          
          {/* Card: Seguros Novos */}
          <SpotlightCard className="p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F39C38] tracking-wider uppercase flex items-center gap-1.5">
                <span>SEGUROS NOVOS</span>
                {isQuickEditMode && <span className="text-[10px] text-amber-400 font-normal">(Clique para editar)</span>}
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                kpiNovos.superou 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-[#00E396]/15 text-[#00E396] border-[#00E396]/30 shadow-[0_0_8px_rgba(0,227,150,0.2)]'
              }`}>
                {kpiNovos.percent}% {kpiNovos.superou ? 'Meta Batida!' : ''}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 my-auto">
              {/* Highlighted Meta */}
              <div>
                <span className="text-[10px] font-semibold text-white/50 tracking-wider block uppercase">META</span>
                {isQuickEditMode ? (
                  <input
                    type="text"
                    defaultValue={data.kpiSegurosNovos.meta}
                    onBlur={(e) => updateNovosMeta(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="bg-[#07090E] border border-[#F39C38] rounded px-2 py-0.5 text-xl font-black text-white w-40 outline-none"
                    placeholder="Meta R$"
                  />
                ) : (
                  <span className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                    {formatCurrency(kpiNovos.meta)}
                  </span>
                )}
              </div>

              {/* Realizado & Restante */}
              <div className="flex items-center gap-4 sm:gap-6 text-right">
                <div>
                  <span className="text-[9px] font-semibold text-white/40 tracking-wider block uppercase leading-none mb-1">REALIZADO</span>
                  {isQuickEditMode ? (
                    <input
                      type="text"
                      defaultValue={data.kpiSegurosNovos.realizado}
                      onBlur={(e) => updateNovosReal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="bg-[#07090E] border border-[#00E396] rounded px-2 py-0.5 text-xs font-bold text-white w-28 outline-none text-right"
                      placeholder="Realizado R$"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                      {formatCurrency(kpiNovos.realizado)}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-semibold text-white/40 tracking-wider block uppercase leading-none mb-1">
                    {kpiNovos.superou ? 'SUPEROU' : 'RESTANTE'}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold tracking-tight leading-none ${
                    kpiNovos.superou ? 'text-emerald-400 font-extrabold' : 'text-white/60'
                  }`}>
                    {kpiNovos.superou ? `+${formatCurrency(kpiNovos.excedente)}` : formatCurrency(kpiNovos.restante)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#1A2234] rounded-full overflow-hidden relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  kpiNovos.superou 
                    ? 'bg-gradient-to-r from-[#00E396] via-[#10B981] to-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                    : 'bg-gradient-to-r from-[#00E396] to-[#2F80ED] shadow-[0_0_10px_rgba(0,227,150,0.6)]'
                }`}
                style={{ width: `${Math.min(100, kpiNovos.percent)}%` }}
              />
            </div>
          </SpotlightCard>

          {/* Card: Renovações */}
          <SpotlightCard className="p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F39C38] tracking-wider uppercase flex items-center gap-1.5">
                <span>RENOVAÇÕES</span>
                {isQuickEditMode && <span className="text-[10px] text-amber-400 font-normal">(Clique para editar)</span>}
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                kpiRen.superou 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-[#00E396]/15 text-[#00E396] border-[#00E396]/30 shadow-[0_0_8px_rgba(0,227,150,0.2)]'
              }`}>
                {kpiRen.percent}% {kpiRen.superou ? 'Meta Batida!' : ''}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 my-auto">
              {/* Highlighted Meta */}
              <div>
                <span className="text-[10px] font-semibold text-white/50 tracking-wider block uppercase">META</span>
                {isQuickEditMode ? (
                  <input
                    type="text"
                    defaultValue={data.kpiRenovacoes.meta}
                    onBlur={(e) => updateRenMeta(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    className="bg-[#07090E] border border-[#F39C38] rounded px-2 py-0.5 text-xl font-black text-white w-40 outline-none"
                    placeholder="Meta R$"
                  />
                ) : (
                  <span className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                    {formatCurrency(kpiRen.meta)}
                  </span>
                )}
              </div>

              {/* Realizado & Restante */}
              <div className="flex items-center gap-4 sm:gap-6 text-right">
                <div>
                  <span className="text-[9px] font-semibold text-white/40 tracking-wider block uppercase leading-none mb-1">REALIZADO</span>
                  {isQuickEditMode ? (
                    <input
                      type="text"
                      defaultValue={data.kpiRenovacoes.realizado}
                      onBlur={(e) => updateRenReal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="bg-[#07090E] border border-[#00E396] rounded px-2 py-0.5 text-xs font-bold text-white w-28 outline-none text-right"
                      placeholder="Realizado R$"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                      {formatCurrency(kpiRen.realizado)}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-semibold text-white/40 tracking-wider block uppercase leading-none mb-1">
                    {kpiRen.superou ? 'SUPEROU' : 'RESTANTE'}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold tracking-tight leading-none ${
                    kpiRen.superou ? 'text-emerald-400 font-extrabold' : 'text-white/60'
                  }`}>
                    {kpiRen.superou ? `+${formatCurrency(kpiRen.excedente)}` : formatCurrency(kpiRen.restante)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#1A2234] rounded-full overflow-hidden relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  kpiRen.superou 
                    ? 'bg-gradient-to-r from-[#00E396] via-[#10B981] to-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                    : 'bg-gradient-to-r from-[#FFA502] to-[#00E396] shadow-[0_0_10px_rgba(255,165,2,0.6)]'
                }`}
                style={{ width: `${Math.min(100, kpiRen.percent)}%` }}
              />
            </div>
          </SpotlightCard>

        </div>

        {/* --- ROW 2: SEGUROS EMITIDOS & DISTRIBUIÇÃO POR PRODUTO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[175px]">
          
          {/* SEGUROS EMITIDOS (Left 5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider">
                SEGUROS EMITIDOS
              </h3>
              {isQuickEditMode && (
                <span className="text-[10px] text-amber-400 font-normal">(Clique para editar)</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 my-auto">
              
              {/* Left Column Stats */}
              <div className="flex flex-col gap-3.5">
                
                {/* Seguros Novos */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7.5 h-7.5 rounded-full bg-[#00E396] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,227,150,0.4)]">
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/70 block uppercase leading-tight">
                      SEGUROS NOVOS
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      {isQuickEditMode ? (
                        <input
                          type="text"
                          defaultValue={data.emissoes.novos}
                          onBlur={(e) => updateEmissoesNovos(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="bg-[#07090E] border border-[#00E396] rounded px-1.5 py-0.5 text-base font-black text-white w-20 outline-none"
                        />
                      ) : (
                        <span className="text-lg lg:text-xl font-black text-white tracking-tight">
                          {formatNumber(emissoes.novos)}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-[#00E396]">
                        ({emissoes.novosPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seguros Renovados */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7.5 h-7.5 rounded-full bg-[#FFA502] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,165,2,0.4)]">
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white/70 block uppercase leading-tight">
                      SEGUROS RENOVADOS
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      {isQuickEditMode ? (
                        <input
                          type="text"
                          defaultValue={data.emissoes.renovacao}
                          onBlur={(e) => updateEmissoesRen(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="bg-[#07090E] border border-[#FFA502] rounded px-1.5 py-0.5 text-base font-black text-white w-20 outline-none"
                        />
                      ) : (
                        <span className="text-lg lg:text-xl font-black text-white tracking-tight">
                          {formatNumber(emissoes.renovacao)}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-[#FFA502]">
                        ({emissoes.renovacaoPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Donut Chart with Center Total */}
              <div className="relative w-32 h-32 lg:w-36 lg:h-36 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {donutStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">TOTAL</span>
                  <span className="text-sm lg:text-base font-extrabold text-white tracking-tight leading-tight">
                    {formatNumber(emissoes.total)}
                  </span>
                </div>
              </div>

            </div>
          </SpotlightCard>

          {/* DISTRIBUIÇÃO POR PRODUTO (Right 7 cols) */}
          <SpotlightCard className="lg:col-span-7 p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider">
                DISTRIBUIÇÃO POR PRODUTO
              </h3>
              {isQuickEditMode && (
                <span className="text-[10px] text-amber-400 font-normal">(Edite as % diretamente)</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 my-auto">
              
              {/* Column 1 */}
              <div className="flex flex-col gap-1.5">
                {produtosCol1.map((item) => {
                  const Icon = getProductIcon(item.iconName);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-[95px]">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
                        <span className="font-semibold text-white/80 truncate">{item.name}</span>
                      </div>
                      
                      {/* Bar track */}
                      <div className="flex-1 h-1.5 bg-[#1A2234] rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percent * 3.5}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>

                      {isQuickEditMode ? (
                        <div className="flex items-center gap-0.5 w-10">
                          <input
                            type="text"
                            defaultValue={item.percent}
                            onBlur={(e) => updateProdutoPercent(item.id, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            className="bg-[#07090E] border border-white/20 rounded px-1 py-0.5 text-[10px] text-right font-bold text-white w-8 outline-none font-mono"
                          />
                          <span className="text-[10px] text-white/40">%</span>
                        </div>
                      ) : (
                        <span className="font-bold text-white/80 w-6 text-right text-[10px]">{item.percent}%</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-1.5">
                {produtosCol2.map((item) => {
                  const Icon = getProductIcon(item.iconName);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-[95px]">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
                        <span className="font-semibold text-white/80 truncate">{item.name}</span>
                      </div>
                      
                      {/* Bar track */}
                      <div className="flex-1 h-1.5 bg-[#1A2234] rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.percent * 3.5}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>

                      {isQuickEditMode ? (
                        <div className="flex items-center gap-0.5 w-10">
                          <input
                            type="text"
                            defaultValue={item.percent}
                            onBlur={(e) => updateProdutoPercent(item.id, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            className="bg-[#07090E] border border-white/20 rounded px-1 py-0.5 text-[10px] text-right font-bold text-white w-8 outline-none font-mono"
                          />
                          <span className="text-[10px] text-white/40">%</span>
                        </div>
                      ) : (
                        <span className="font-bold text-white/80 w-6 text-right text-[10px]">{item.percent}%</span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </SpotlightCard>

        </div>

        {/* --- ROW 3: EVOLUÇÃO DIÁRIA --- */}
        <SpotlightCard className="p-3.5 sm:p-4 flex-1 min-h-[165px] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 shrink-0 mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider">
                EVOLUÇÃO DIÁRIA
              </h3>
            </div>

            {/* Actions & Legend */}
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E396] shadow-[0_0_6px_#00E396]" />
                <span className="text-white/80">Seguros Novos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2F80ED] shadow-[0_0_6px_#2F80ED]" />
                <span className="text-white/80">Renovações</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="flex-1 w-full min-h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.evolucaoDiaria} margin={{ top: 5, right: 10, left: -25, bottom: -5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2234" />
                <XAxis 
                  dataKey="date" 
                  stroke="#4B5563" 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: '#1E2638' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#4B5563" 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomEvolucaoTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="novos" 
                  name="Seguros Novos"
                  stroke="#00E396" 
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#00E396', strokeWidth: 0 }}
                  activeDot={{ r: 4.5, fill: '#00E396', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="renovacoes" 
                  name="Renovações"
                  stroke="#2F80ED" 
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: '#2F80ED', strokeWidth: 0 }}
                  activeDot={{ r: 4.5, fill: '#2F80ED', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

      </div>

      {/* MODALS */}
      <ClientGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={data}
      />
    </div>
  );
}
