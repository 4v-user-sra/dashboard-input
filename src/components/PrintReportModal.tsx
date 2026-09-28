import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileDown, ShieldCheck, TrendingUp, PieChart, Layers } from 'lucide-react';
import { DashboardState } from '../types/dashboard';
import { formatCurrency, formatNumber, calculateKpi, calculateEmissoes } from '../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardState;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const kpiNovos = calculateKpi(data.kpiSegurosNovos.meta, data.kpiSegurosNovos.realizado);
  const kpiRen = calculateKpi(data.kpiRenovacoes.meta, data.kpiRenovacoes.realizado);
  const emissoes = calculateEmissoes(data.emissoes.novos, data.emissoes.renovacao);

  const handleNativePrint = () => {
    try {
      window.print();
    } catch {
      // Handled gracefully
    }
  };

  const handleCopySummary = () => {
    const text = `📊 *${data.companyName.toUpperCase()}* - ${data.dateRange}
_${data.periodLabel}_

*1. SEGUROS NOVOS*
• Meta: ${formatCurrency(kpiNovos.meta)}
• Realizado: ${formatCurrency(kpiNovos.realizado)} (${kpiNovos.percent}% atingido)
• Restante: ${formatCurrency(kpiNovos.restante)}

*2. RENOVAÇÕES*
• Meta: ${formatCurrency(kpiRen.meta)}
• Realizado: ${formatCurrency(kpiRen.realizado)} (${kpiRen.percent}% atingido)
• Restante: ${formatCurrency(kpiRen.restante)}

*3. APÓLICES EMITIDAS*
• Seguros Novos: ${formatNumber(emissoes.novos)} (${emissoes.novosPercent}%)
• Seguros Renovados: ${formatNumber(emissoes.renovacao)} (${emissoes.renovacaoPercent}%)
• Total de Apólices: ${formatNumber(emissoes.total)}

*4. TOP PRODUTOS*
${data.produtos.slice(0, 5).map(p => `• ${p.name}: ${p.percent}%`).join('\n')}

_Relatório emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${data.companyName} - Relatório Executivo</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #07090E; color: #FFFFFF; padding: 30px; margin: 0; }
    .card { background: #0F141E; border: 1px solid #1E2638; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    h1 { color: #FFFFFF; margin: 0 0 5px 0; font-size: 24px; }
    .subtitle { color: #8892B0; font-size: 14px; margin-bottom: 25px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; background: rgba(0, 227, 150, 0.15); color: #00E396; }
    .val-big { font-size: 28px; font-weight: 900; margin: 10px 0; }
    .val-sub { color: #A0AEC0; font-size: 13px; }
    .bar { height: 8px; background: #1A2234; border-radius: 4px; overflow: hidden; margin-top: 15px; }
    .bar-fill { height: 100%; background: #00E396; border-radius: 4px; }
    @media print { body { background: #FFFFFF; color: #000000; } .card { border-color: #DDD; background: #FAFAFA; } }
  </style>
</head>
<body>
  <h1>${data.companyName}</h1>
  <div class="subtitle">${data.periodLabel} | Período: <strong>${data.dateRange}</strong></div>

  <div class="grid">
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#F39C38;">SEGUROS NOVOS</strong>
        <span class="badge">${kpiNovos.percent}% da meta</span>
      </div>
      <div class="val-big">${formatCurrency(kpiNovos.meta)}</div>
      <div class="val-sub">Realizado: <strong>${formatCurrency(kpiNovos.realizado)}</strong> | Restante: <strong>${formatCurrency(kpiNovos.restante)}</strong></div>
      <div class="bar"><div class="bar-fill" style="width: ${Math.min(100, kpiNovos.percent)}%;"></div></div>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#F39C38;">RENOVAÇÕES</strong>
        <span class="badge">${kpiRen.percent}% da meta</span>
      </div>
      <div class="val-big">${formatCurrency(kpiRen.meta)}</div>
      <div class="val-sub">Realizado: <strong>${formatCurrency(kpiRen.realizado)}</strong> | Restante: <strong>${formatCurrency(kpiRen.restante)}</strong></div>
      <div class="bar"><div class="bar-fill" style="width: ${Math.min(100, kpiRen.percent)}%;"></div></div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-top:0;">APÓLICES EMITIDAS (TOTAL: ${formatNumber(emissoes.total)})</h3>
    <p>Seguros Novos: <strong>${formatNumber(emissoes.novos)} (${emissoes.novosPercent}%)</strong> | Renovações: <strong>${formatNumber(emissoes.renovacao)} (${emissoes.renovacaoPercent}%)</strong></p>
  </div>

  <script>window.print();</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-executivo-${data.dateRange.replace(/[\/\s-]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2638] bg-[#0F141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2F80ED]/15 border border-[#2F80ED]/30 flex items-center justify-center text-[#2F80ED]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Imprimir & Exportar Relatório</h2>
              <p className="text-xs text-white/50 mt-1">Gere o documento oficial para apresentação ou envio ao cliente</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Preview */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">{data.companyName}</h3>
                <span className="text-white/50">{data.periodLabel}</span>
              </div>
              <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 font-mono text-white/80">
                {data.dateRange}
              </span>
            </div>

            {/* KPIs Preview */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#07090E] p-3 rounded-lg border border-[#1E2638]">
                <div className="flex justify-between items-center text-[10px] text-[#F39C38] font-bold">
                  <span>SEGUROS NOVOS</span>
                  <span className="text-[#00E396]">{kpiNovos.percent}%</span>
                </div>
                <div className="text-lg font-black text-white mt-1">{formatCurrency(kpiNovos.meta)}</div>
                <div className="text-[11px] text-white/60 mt-0.5">Realizado: {formatCurrency(kpiNovos.realizado)}</div>
              </div>

              <div className="bg-[#07090E] p-3 rounded-lg border border-[#1E2638]">
                <div className="flex justify-between items-center text-[10px] text-[#F39C38] font-bold">
                  <span>RENOVAÇÕES</span>
                  <span className="text-[#00E396]">{kpiRen.percent}%</span>
                </div>
                <div className="text-lg font-black text-white mt-1">{formatCurrency(kpiRen.meta)}</div>
                <div className="text-[11px] text-white/60 mt-0.5">Realizado: {formatCurrency(kpiRen.realizado)}</div>
              </div>
            </div>

            {/* Apólices */}
            <div className="bg-[#07090E] p-3 rounded-lg border border-[#1E2638] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-bold block">Total Apólices Emitidas</span>
                <span className="text-base font-black text-white">{formatNumber(emissoes.total)}</span>
              </div>
              <div className="text-right text-[11px] text-white/70">
                <div>Novos: <strong className="text-[#00E396]">{formatNumber(emissoes.novos)} ({emissoes.novosPercent}%)</strong></div>
                <div>Renovados: <strong className="text-[#FFA502]">{formatNumber(emissoes.renovacao)} ({emissoes.renovacaoPercent}%)</strong></div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={handleNativePrint}
              className="p-3.5 bg-[#00E396]/15 hover:bg-[#00E396]/25 border border-[#00E396]/30 rounded-xl text-left transition-all cursor-pointer group"
            >
              <Printer className="w-5 h-5 text-[#00E396] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-xs">Imprimir / Salvar PDF</div>
              <div className="text-[10px] text-white/60 mt-1">Abre a caixa de impressão do navegador direto</div>
            </button>

            <button
              onClick={handleCopySummary}
              className="p-3.5 bg-[#2F80ED]/15 hover:bg-[#2F80ED]/25 border border-[#2F80ED]/30 rounded-xl text-left transition-all cursor-pointer group"
            >
              {copied ? (
                <Check className="w-5 h-5 text-[#00E396] mb-2" />
              ) : (
                <Copy className="w-5 h-5 text-[#2F80ED] mb-2 group-hover:scale-110 transition-transform" />
              )}
              <div className="font-bold text-white text-xs">{copied ? 'Copiado!' : 'Copiar Resumo'}</div>
              <div className="text-[10px] text-white/60 mt-1">Formato ideal para WhatsApp ou e-mail executivo</div>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="p-3.5 bg-[#F39C38]/15 hover:bg-[#F39C38]/25 border border-[#F39C38]/30 rounded-xl text-left transition-all cursor-pointer group"
            >
              <FileDown className="w-5 h-5 text-[#F39C38] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white text-xs">Baixar Relatório HTML</div>
              <div className="text-[10px] text-white/60 mt-1">Gera arquivo pronto que abre em qualquer lugar</div>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-[#1E2638] bg-[#0F141E]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
