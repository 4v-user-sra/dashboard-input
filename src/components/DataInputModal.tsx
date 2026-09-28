import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sliders, 
  PieChart as PieIcon, 
  TrendingUp, 
  FileSpreadsheet, 
  Settings2, 
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { DashboardState, ProdutoItem, EvolucaoItem } from '../types/dashboard';
import { initialDashboardData, samplePresets } from '../data/defaultData';
import { iconMap } from '../utils/icons';
import { parseBrNumber, formatCurrency, formatNumber, calculateKpi, calculateEmissoes } from '../utils/formatters';

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardState;
  onSave: (newData: DashboardState) => void;
}

export const DataInputModal: React.FC<DataInputModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'metas' | 'emissoes' | 'produtos' | 'evolucao' | 'presets'>('metas');
  const [formData, setFormData] = useState<DashboardState>(data);
  const [csvText, setCsvText] = useState('');
  const [showCsvBox, setShowCsvBox] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync formData whenever modal opens or parent data updates
  useEffect(() => {
    if (isOpen) {
      setFormData(JSON.parse(JSON.stringify(data)));
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = () => {
    const updated: DashboardState = {
      ...formData,
      lastUpdated: new Date().toISOString(),
    };
    onSave(updated);
    showToast('Dashboard atualizado com sucesso!');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Live KPI Calculations
  const kpiNovos = calculateKpi(formData.kpiSegurosNovos.meta, formData.kpiSegurosNovos.realizado);
  const kpiRen = calculateKpi(formData.kpiRenovacoes.meta, formData.kpiRenovacoes.realizado);

  // Live Emissoes Calculations
  const emissoesCalc = calculateEmissoes(formData.emissoes.novos, formData.emissoes.renovacao);

  // Evolucao Diaria sum
  const sumEvolucaoNovos = formData.evolucaoDiaria.reduce((acc, row) => acc + (Number(row.novos) || 0), 0);
  const sumEvolucaoRen = formData.evolucaoDiaria.reduce((acc, row) => acc + (Number(row.renovacoes) || 0), 0);

  // Sync Emissoes with Evolucao Diaria
  const handleSyncWithEvolucao = () => {
    setFormData({
      ...formData,
      emissoes: {
        novos: sumEvolucaoNovos,
        renovacao: sumEvolucaoRen,
      },
    });
    showToast(`Apólices sincronizadas: ${sumEvolucaoNovos} novos e ${sumEvolucaoRen} renovações!`);
  };

  // Produtos Helpers
  const totalProdutosPercent = formData.produtos.reduce((acc, p) => acc + (Number(p.percent) || 0), 0);

  const normalizeProdutos = () => {
    if (totalProdutosPercent === 0 || formData.produtos.length === 0) return;
    const factor = 100 / totalProdutosPercent;
    let accumulated = 0;
    const updated = formData.produtos.map((p, idx) => {
      if (idx === formData.produtos.length - 1) {
        return { ...p, percent: Math.max(0, 100 - accumulated) };
      }
      const val = Math.round((Number(p.percent) || 0) * factor);
      accumulated += val;
      return { ...p, percent: val };
    });
    setFormData({ ...formData, produtos: updated });
    showToast('Produtos recalculados para somar exatamente 100%!');
  };

  const handleAddProduto = () => {
    const newId = String(Date.now());
    const newProd: ProdutoItem = {
      id: newId,
      name: 'Novo Produto',
      percent: 5,
      color: '#00D2D3',
      iconName: 'Shield',
    };
    setFormData({
      ...formData,
      produtos: [...formData.produtos, newProd],
    });
    showToast('Novo produto adicionado à lista!');
  };

  const handleRemoveProduto = (id: string) => {
    setFormData({
      ...formData,
      produtos: formData.produtos.filter((p) => p.id !== id),
    });
  };

  // Evolução Diária Helpers
  const handleAddEvolucaoRow = () => {
    const nextDay = String(formData.evolucaoDiaria.length + 1).padStart(2, '0');
    const newRow: EvolucaoItem = {
      date: `${nextDay}/04`,
      novos: 80,
      renovacoes: 50,
    };
    setFormData({
      ...formData,
      evolucaoDiaria: [...formData.evolucaoDiaria, newRow],
    });
  };

  const handleRemoveEvolucaoRow = (idx: number) => {
    setFormData({
      ...formData,
      evolucaoDiaria: formData.evolucaoDiaria.filter((_, i) => i !== idx),
    });
  };

  const handleImportCsv = () => {
    if (!csvText.trim()) {
      showToast('Cole o conteúdo no campo abaixo antes de processar.');
      return;
    }
    try {
      const lines = csvText.trim().split('\n');
      const parsed: EvolucaoItem[] = [];
      lines.forEach((line) => {
        const parts = line.split(/[,;\t]/).map((s) => s.trim());
        if (parts.length >= 3) {
          const date = parts[0];
          const novos = parseBrNumber(parts[1]);
          const renovacoes = parseBrNumber(parts[2]);
          if (date) {
            parsed.push({ date, novos, renovacoes });
          }
        }
      });
      if (parsed.length > 0) {
        setFormData({ ...formData, evolucaoDiaria: parsed });
        setShowCsvBox(false);
        setCsvText('');
        showToast(`${parsed.length} dias importados com sucesso!`);
      } else {
        showToast('Formato não reconhecido. Use: Data, Novos, Renovações (ex: 01/05, 50, 30)');
      }
    } catch {
      showToast('Erro ao processar dados. Verifique a formatação.');
    }
  };

  // Export / Import JSON Backup
  const handleExportJSON = () => {
    try {
      const jsonStr = JSON.stringify(formData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dados-dashboard-${formData.dateRange.replace(/[\/\s-]/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Arquivo de backup baixado com sucesso!');
    } catch {
      showToast('Falha ao gerar arquivo de backup.');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.kpiSegurosNovos || parsed.produtos)) {
          setFormData({
            ...initialDashboardData,
            ...parsed,
          });
          showToast('Dados do arquivo importados com sucesso!');
        } else {
          showToast('O arquivo selecionado não tem o formato correto.');
        }
      } catch {
        showToast('Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2638] bg-[#0F141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F39C38]/15 border border-[#F39C38]/30 flex items-center justify-center text-[#F39C38]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Painel de Alimentação & Cálculos</h2>
              <p className="text-xs text-white/50 mt-1">Altere qualquer informação. Todos os cálculos de metas e gráficos atualizam em tempo real.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-[#1E2638] bg-[#090D14] overflow-x-auto">
          <button
            onClick={() => setActiveTab('metas')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'metas'
                ? 'border-[#F39C38] text-[#F39C38]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            1. Metas & Valores (R$)
          </button>

          <button
            onClick={() => setActiveTab('emissoes')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'emissoes'
                ? 'border-[#00E396] text-[#00E396]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            2. Qtd. Apólices Emitidas
          </button>

          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'produtos'
                ? 'border-[#2F80ED] text-[#2F80ED]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            3. Mix de Produtos
          </button>

          <button
            onClick={() => setActiveTab('evolucao')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'evolucao'
                ? 'border-[#9B51E0] text-[#9B51E0]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            4. Evolução Diária
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-[#00D2D3] text-[#00D2D3]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            5. Períodos & Backup
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {toastMessage && (
            <div className="p-3 bg-[#00E396]/15 border border-[#00E396]/40 text-[#00E396] rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: METAS & VALORES */}
          {activeTab === 'metas' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Cálculo Automático Ativo:</strong> Digite a <strong>Meta</strong> e o <strong>Realizado</strong> (aceita números normais, ex: <code className="bg-black/30 px-1 py-0.5 rounded">1200000</code> ou <code className="bg-black/30 px-1 py-0.5 rounded">1.200.000</code> ou <code className="bg-black/30 px-1 py-0.5 rounded">1.2M</code>). O <strong>Restante</strong> e a <strong>% da Meta</strong> são calculados instantaneamente.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Seguros Novos */}
                <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F39C38] uppercase tracking-wider">SEGUROS NOVOS</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      kpiNovos.superou 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-[#00E396]/15 text-[#00E396] border-[#00E396]/30'
                    }`}>
                      {kpiNovos.percent}% {kpiNovos.superou ? '(Superada!)' : 'atingido'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Meta (R$)</label>
                      <input
                        type="text"
                        defaultValue={formData.kpiSegurosNovos.meta}
                        onChange={(e) => {
                          const val = parseBrNumber(e.target.value);
                          setFormData({
                            ...formData,
                            kpiSegurosNovos: { ...formData.kpiSegurosNovos, meta: val },
                          });
                        }}
                        className="w-full bg-[#07090E] border border-[#1E2638] focus:border-[#F39C38] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none transition-colors"
                        placeholder="Ex: 1200000 ou 1.200.000"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">Valor formatado: {formatCurrency(kpiNovos.meta)}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Realizado (R$)</label>
                      <input
                        type="text"
                        defaultValue={formData.kpiSegurosNovos.realizado}
                        onChange={(e) => {
                          const val = parseBrNumber(e.target.value);
                          setFormData({
                            ...formData,
                            kpiSegurosNovos: { ...formData.kpiSegurosNovos, realizado: val },
                          });
                        }}
                        className="w-full bg-[#07090E] border border-[#1E2638] focus:border-[#F39C38] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none transition-colors"
                        placeholder="Ex: 800000 ou 800.000"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">Valor formatado: {formatCurrency(kpiNovos.realizado)}</span>
                    </div>

                    <div className="p-3 bg-[#07090E]/60 border border-white/5 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/50">Restante calculado:</span>
                        <span className="font-bold text-white font-mono">{formatCurrency(kpiNovos.restante)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Progresso da meta:</span>
                        <span className="font-bold text-[#00E396] font-mono">{kpiNovos.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A2234] rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-[#00E396] transition-all duration-300"
                          style={{ width: `${Math.min(100, kpiNovos.percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renovações */}
                <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F39C38] uppercase tracking-wider">RENOVAÇÕES</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      kpiRen.superou 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-[#00E396]/15 text-[#00E396] border-[#00E396]/30'
                    }`}>
                      {kpiRen.percent}% {kpiRen.superou ? '(Superada!)' : 'atingido'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Meta (R$)</label>
                      <input
                        type="text"
                        defaultValue={formData.kpiRenovacoes.meta}
                        onChange={(e) => {
                          const val = parseBrNumber(e.target.value);
                          setFormData({
                            ...formData,
                            kpiRenovacoes: { ...formData.kpiRenovacoes, meta: val },
                          });
                        }}
                        className="w-full bg-[#07090E] border border-[#1E2638] focus:border-[#F39C38] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none transition-colors"
                        placeholder="Ex: 800000 ou 800.000"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">Valor formatado: {formatCurrency(kpiRen.meta)}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Realizado (R$)</label>
                      <input
                        type="text"
                        defaultValue={formData.kpiRenovacoes.realizado}
                        onChange={(e) => {
                          const val = parseBrNumber(e.target.value);
                          setFormData({
                            ...formData,
                            kpiRenovacoes: { ...formData.kpiRenovacoes, realizado: val },
                          });
                        }}
                        className="w-full bg-[#07090E] border border-[#1E2638] focus:border-[#F39C38] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none transition-colors"
                        placeholder="Ex: 150000 ou 150.000"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">Valor formatado: {formatCurrency(kpiRen.realizado)}</span>
                    </div>

                    <div className="p-3 bg-[#07090E]/60 border border-white/5 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/50">Restante calculado:</span>
                        <span className="font-bold text-white font-mono">{formatCurrency(kpiRen.restante)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Progresso da meta:</span>
                        <span className="font-bold text-[#00E396] font-mono">{kpiRen.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A2234] rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-[#00E396] transition-all duration-300"
                          style={{ width: `${Math.min(100, kpiRen.percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: APÓLICES EMITIDAS */}
          {activeTab === 'emissoes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex-wrap gap-2">
                <span>🎯 O total de apólices e as fatias do gráfico Donut são calculados automaticamente.</span>
                
                {formData.evolucaoDiaria.length > 0 && (
                  <button
                    onClick={handleSyncWithEvolucao}
                    className="px-3 py-1.5 bg-[#00E396] text-black font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#00c582] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sincronizar com a soma do gráfico diário ({sumEvolucaoNovos + sumEvolucaoRen} apólices)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quantidades de Apólices</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1 flex items-center justify-between">
                        <span>Seguros Novos (Unidades)</span>
                        <span className="text-[#00E396] font-bold">{emissoesCalc.novosPercent}%</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={formData.emissoes.novos}
                        onChange={(e) => {
                          const val = parseBrNumber(e.target.value);
                          setFormData({
                            ...formData,
                            emissoes: { ...formData.emissoes, novos: val },
                          });
                        }}
                        className="w-full bg-[#07090E] border border-[#1E2638] focus:border-[#00E396] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1 flex items-center justify-between">
                        <span>Seguros Renovados (Unidades)</span>
                        <span className="text-[#FFA502] font-bold">{emissoesCalc.renovacaoPercent}%</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={formData.emissoes.renovacao}
                        onChange={(e) => {
                          const val = parseBrNumber(e.target.value);
                          setFormData({
                            ...formData,
                            emissoes: { ...formData.emissoes, renovacao: val },
                          });
                        }}
                        className="w-full bg-[#07090E] border border-[#1E2638] focus:border-[#FFA502] rounded-lg px-3 py-2 text-white font-mono text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-5 flex flex-col justify-center items-center text-center space-y-3">
                  <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">Total Consolidado</span>
                  <span className="text-4xl font-black text-white">{formatNumber(emissoesCalc.total)}</span>
                  <div className="w-full max-w-[260px] p-2 bg-[#07090E] rounded-lg border border-white/5 text-xs text-white/70 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#00E396]">Novos:</span>
                      <strong>{formatNumber(emissoesCalc.novos)} ({emissoesCalc.novosPercent}%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#FFA502]">Renovações:</span>
                      <strong>{formatNumber(emissoesCalc.renovacao)} ({emissoesCalc.renovacaoPercent}%)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUTOS */}
          {activeTab === 'produtos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-white/70">
                  Soma atual das fatias: <strong className={`font-mono text-sm ${totalProdutosPercent === 100 ? 'text-[#00E396]' : 'text-amber-400'}`}>{totalProdutosPercent}%</strong>
                  {totalProdutosPercent !== 100 && (
                    <span className="ml-2 text-amber-400/80">(Clique no botão ao lado para balancear)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={normalizeProdutos}
                    className="px-3 py-1.5 rounded-lg bg-[#2F80ED]/15 text-[#2F80ED] hover:bg-[#2F80ED]/25 border border-[#2F80ED]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ajustar para 100% Automático
                  </button>
                  <button
                    onClick={handleAddProduto}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Produto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {formData.produtos.map((item, index) => {
                  return (
                    <div key={item.id} className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-3 flex items-center gap-2.5">
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => {
                          const updated = [...formData.produtos];
                          updated[index].color = e.target.value;
                          setFormData({ ...formData, produtos: updated });
                        }}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                        title="Escolher cor"
                      />

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...formData.produtos];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, produtos: updated });
                        }}
                        className="flex-1 bg-[#07090E] border border-[#1E2638] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2F80ED]"
                        placeholder="Nome do Produto"
                      />

                      <div className="flex items-center gap-1 w-20">
                        <input
                          type="text"
                          value={item.percent}
                          onChange={(e) => {
                            const updated = [...formData.produtos];
                            updated[index].percent = parseBrNumber(e.target.value);
                            setFormData({ ...formData, produtos: updated });
                          }}
                          className="w-12 bg-[#07090E] border border-[#1E2638] rounded-lg px-1.5 py-1.5 text-xs text-right text-white font-mono outline-none"
                        />
                        <span className="text-xs text-white/50">%</span>
                      </div>

                      <select
                        value={item.iconName}
                        onChange={(e) => {
                          const updated = [...formData.produtos];
                          updated[index].iconName = e.target.value;
                          setFormData({ ...formData, produtos: updated });
                        }}
                        className="bg-[#07090E] border border-[#1E2638] rounded-lg px-2 py-1.5 text-xs text-white/80 outline-none"
                      >
                        {Object.keys(iconMap).map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemoveProduto(item.id)}
                        className="text-red-400/60 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EVOLUÇÃO DIÁRIA */}
          {activeTab === 'evolucao' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-white/70">
                  Total de dias no gráfico: <strong>{formData.evolucaoDiaria.length} dias</strong> | Soma Novos: <strong className="text-[#00E396]">{sumEvolucaoNovos}</strong> | Soma Renovações: <strong className="text-[#2F80ED]">{sumEvolucaoRen}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCsvBox(!showCsvBox)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#00E396]" />
                    {showCsvBox ? 'Ocultar Importador' : 'Colar do Excel / CSV'}
                  </button>
                  <button
                    onClick={handleAddEvolucaoRow}
                    className="px-3 py-1.5 rounded-lg bg-[#9B51E0]/20 text-[#9B51E0] hover:bg-[#9B51E0]/30 border border-[#9B51E0]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Ponto/Dia
                  </button>
                </div>
              </div>

              {showCsvBox && (
                <div className="p-4 bg-[#0F141E] border border-[#1E2638] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Importação Rápida (Cole as linhas da sua planilha)</span>
                    <span className="text-[11px] text-white/50">Formato: Data, Novos, Renovações</span>
                  </div>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="01/04, 55, 35&#10;02/04, 60, 40&#10;03/04, 75, 45"
                    className="w-full bg-[#07090E] border border-[#1E2638] rounded-lg p-2.5 text-xs text-white font-mono outline-none"
                  />
                  <button
                    onClick={handleImportCsv}
                    className="px-4 py-2 bg-[#00E396] hover:bg-[#00c582] text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Processar e Substituir Dias
                  </button>
                </div>
              )}

              <div className="max-h-[320px] overflow-y-auto border border-[#1E2638] rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0F141E] text-white/50 border-b border-[#1E2638] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Data</th>
                      <th className="py-2.5 px-4 text-[#00E396]">Seguros Novos</th>
                      <th className="py-2.5 px-4 text-[#2F80ED]">Renovações</th>
                      <th className="py-2.5 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2638]/50 bg-[#07090E]">
                    {formData.evolucaoDiaria.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="py-1.5 px-4">
                          <input
                            type="text"
                            value={row.date}
                            onChange={(e) => {
                              const updated = [...formData.evolucaoDiaria];
                              updated[idx].date = e.target.value;
                              setFormData({ ...formData, evolucaoDiaria: updated });
                            }}
                            className="bg-[#0F141E] border border-[#1E2638] rounded px-2 py-1 text-xs text-white font-mono w-20 outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-4">
                          <input
                            type="text"
                            value={row.novos}
                            onChange={(e) => {
                              const updated = [...formData.evolucaoDiaria];
                              updated[idx].novos = parseBrNumber(e.target.value);
                              setFormData({ ...formData, evolucaoDiaria: updated });
                            }}
                            className="bg-[#0F141E] border border-[#1E2638] rounded px-2 py-1 text-xs text-white font-mono w-24 outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-4">
                          <input
                            type="text"
                            value={row.renovacoes}
                            onChange={(e) => {
                              const updated = [...formData.evolucaoDiaria];
                              updated[idx].renovacoes = parseBrNumber(e.target.value);
                              setFormData({ ...formData, evolucaoDiaria: updated });
                            }}
                            className="bg-[#0F141E] border border-[#1E2638] rounded px-2 py-1 text-xs text-white font-mono w-24 outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveEvolucaoRow(idx)}
                            className="text-red-400/60 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PRESETS & BACKUP */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {/* Títulos Gerais */}
              <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4.5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identificação do Dashboard</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Título Principal da Empresa</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full bg-[#07090E] border border-[#1E2638] rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Subtítulo / Período Exibido</label>
                    <input
                      type="text"
                      value={formData.periodLabel}
                      onChange={(e) => setFormData({ ...formData, periodLabel: e.target.value })}
                      className="w-full bg-[#07090E] border border-[#1E2638] rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cenários Prontos */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Carregar Cenários de Teste</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {samplePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          ...preset.data,
                        });
                        showToast(`Cenário "${preset.label}" aplicado!`);
                      }}
                      className="bg-[#0F141E] hover:bg-[#151C2B] border border-[#1E2638] hover:border-[#00E396]/50 p-3.5 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-bold text-white block group-hover:text-[#00E396]">{preset.label}</span>
                      <span className="text-[11px] text-white/50 mt-1 block">{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exportar & Importar Arquivo */}
              <div className="p-4 bg-[#0F141E] border border-[#1E2638] rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Exportação e Importação de Arquivos</h4>
                  <p className="text-[11px] text-white/50">Baixe um arquivo de backup para guardar o mês ou importe dados anteriores.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Backup (.json)
                  </button>
                  <label className="px-3.5 py-2 bg-[#2F80ED]/20 hover:bg-[#2F80ED]/30 text-[#2F80ED] border border-[#2F80ED]/40 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Importar Arquivo (.json)
                    <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1E2638] bg-[#0F141E]">
          <button
            onClick={() => {
              setFormData(initialDashboardData);
              showToast('Valores resetados para o padrão.');
            }}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Valores Originais
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#00E396] hover:bg-[#00c582] text-black text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,227,150,0.4)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar & Atualizar Dash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
