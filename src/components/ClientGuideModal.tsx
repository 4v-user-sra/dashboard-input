import React from 'react';
import { X, CheckCircle2, Sliders, Printer, Database, Sparkles, BookOpen, Edit3, Share2 } from 'lucide-react';

interface ClientGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientGuideModal: React.FC<ClientGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2638] bg-[#0F141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00E396]/15 border border-[#00E396]/30 flex items-center justify-center text-[#00E396]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Manual de Uso do Dashboard Comercial</h2>
              <p className="text-xs text-white/50 mt-1">Diretrizes completas para alimentar dados, alternar meses e imprimir relatórios</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-white/80 leading-relaxed">
          
          {/* Section 1 */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4.5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#F39C38] font-bold text-sm">
              <Edit3 className="w-4 h-4" />
              <span>1. Duas Formas de Alimentar os Dados</span>
            </div>
            <div className="space-y-2 text-white/70">
              <p>
                <strong>Opção A (Edição Rápida Direta no Card):</strong> Clique no botão <em>"Edição Rápida"</em> no cabeçalho. Os campos de Meta e Realizado viram caixas de texto editáveis diretamente na tela. Digite o novo valor e aperte Enter ou clique fora: o gráfico e as porcentagens recalculam na mesma hora!
              </p>
              <p>
                <strong>Opção B (Painel Completo "Alimentar Dados"):</strong> Clique no botão laranja <em>"Alimentar Dados"</em> para acessar os controles avançados:
              </p>
              <ul className="space-y-1 pl-4 list-disc text-white/70">
                <li><strong>Metas & Valores (R$):</strong> Digite Meta e Realizado. Aceita formatos brasileiros (ex: <code className="bg-black/30 px-1 py-0.5 rounded">1.200.000</code> ou <code className="bg-black/30 px-1 py-0.5 rounded">1200000</code>).</li>
                <li><strong>Apólices Emitidas:</strong> Digite os números ou use o botão <em>"Sincronizar com a soma do gráfico diário"</em>.</li>
                <li><strong>Mix de Produtos:</strong> Edite nomes, porcentagens ou clique em <em>"Ajustar para 100% Automático"</em>.</li>
                <li><strong>Evolução Diária:</strong> Adicione dias individualmente ou cole colunas inteiras da sua planilha Excel.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4.5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#00E396] font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>2. Múltiplos Períodos & Salvamento Automático</span>
            </div>
            <p>
              Clique no <strong>seletor de período (data)</strong> no topo para alternar entre meses salvos (Abril/2025, Maio/2025, Março/2025, Consolidado Anual) ou clique em <strong>"Criar Novo Período"</strong> para iniciar um mês novo sem perder os anteriores.
            </p>
            <p>
              Todas as informações ficam gravadas automaticamente no navegador do cliente (LocalStorage). Para guardar backups permanentes, use <strong>"Exportar Backup (.json)"</strong>.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4.5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#2F80ED] font-bold text-sm">
              <Printer className="w-4 h-4" />
              <span>3. Impressão, PDF & Envio por WhatsApp</span>
            </div>
            <p>
              Clique no botão <strong>"Imprimir / PDF"</strong> para abrir o painel executivo com três facilidades:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc text-white/70">
              <li><strong>Imprimir / Salvar PDF:</strong> Dispara a caixa de impressão formatada em página única limpa.</li>
              <li><strong>Copiar Resumo:</strong> Copia um texto executivo pronto e formatado com emojis para colar direto no WhatsApp ou e-mail da diretoria.</li>
              <li><strong>Baixar Relatório HTML:</strong> Gera um arquivo leve e independente que abre em qualquer computador offline.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-[#1E2638] bg-[#0F141E]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00E396] hover:bg-[#00c582] text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Entendido, ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
