import React from 'react';
import { X, BookOpen, Edit3, CheckCircle2, FileText, Calendar } from 'lucide-react';

interface ClientGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientGuideModal: React.FC<ClientGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F17] border border-[#1E2638] rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2638] bg-[#0F141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00E396]/15 border border-[#00E396]/30 flex items-center justify-center text-[#00E396]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Modo de Uso do Dashboard</h2>
              <p className="text-xs text-white/50 mt-1">Como editar números, alternar períodos e exportar relatórios</p>
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-white/80 leading-relaxed">
          
          {/* Section 1: Edição Rápida */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#F39C38] font-bold text-sm">
              <Edit3 className="w-4 h-4" />
              <span>1. Como Alterar os Números (Edição Rápida)</span>
            </div>
            <p className="text-white/70">
              O dashboard funciona com edição direta na tela, sem formulários complexos:
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-white/70">
              <li>Clique no botão <strong>"Edição Rápida"</strong> no topo do dashboard.</li>
              <li>Os campos de <strong>Meta</strong>, <strong>Realizado</strong>, <strong>Apólices</strong> e <strong>Produtos</strong> viram caixas de texto editáveis na hora.</li>
              <li>Digite o novo número (ex: <code className="bg-black/40 px-1 py-0.5 rounded text-white">1200000</code> ou <code className="bg-black/40 px-1 py-0.5 rounded text-white">1.200.000</code>) e aperte <kbd className="px-1 bg-white/10 rounded font-mono text-[10px]">Enter</kbd> ou clique fora.</li>
              <li>O sistema calcula automaticamente o <strong>Restante</strong>, a <strong>% da Meta</strong>, as fatias do <strong>Donut</strong> e a <strong>barra de progresso</strong>.</li>
              <li>Ao terminar, clique no botão <strong>"Concluir Edição"</strong> para travar os valores.</li>
            </ol>
          </div>

          {/* Section 2: Salvamento Automático */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#00E396] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Salvamento Automático</span>
            </div>
            <p className="text-white/70">
              Todas as edições feitas ficam gravadas automaticamente no navegador. Ao fechar e reabrir o link em outro momento, os valores continuam salvos.
            </p>
          </div>

          {/* Section 3: Exportar Relatório */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#2F80ED] font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>3. Exportar Relatório (WhatsApp & HTML)</span>
            </div>
            <p className="text-white/70">
              Clique no botão <strong>"Exportar Relatório"</strong> no cabeçalho:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-white/70">
              <li><strong>Copiar Resumo (Texto):</strong> Gera um texto formatado com os números consolidados pronto para colar no WhatsApp ou e-mail.</li>
              <li><strong>Baixar Relatório HTML:</strong> Baixa um arquivo executivo que abre em qualquer computador offline.</li>
            </ul>
          </div>

          {/* Section 4: Períodos */}
          <div className="bg-[#0F141E] border border-[#1E2638] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Calendar className="w-4 h-4" />
              <span>4. Alternar Meses / Períodos</span>
            </div>
            <p className="text-white/70">
              No botão de data no canto superior direito, você pode alternar entre os meses salvos (Abril, Maio, etc.) ou criar um novo período para o mês atual.
            </p>
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
